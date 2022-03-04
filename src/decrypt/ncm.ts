import {
    AudioMimeType,
    BytesHasPrefix,
    GetArrayBuffer,
    GetImageFromURL,
    GetMetaFromFile, IMusicMeta,
    SniffAudioExt,
    WriteMetaToFlac,
    WriteMetaToMp3
} from "@/decrypt/utils";
import {parseBlob as metaParseBlob} from "music-metadata-browser";
import jimp from 'jimp';

import AES from "crypto-js/aes";
import PKCS7 from "crypto-js/pad-pkcs7";
import ModeECB from "crypto-js/mode-ecb";
import WordArray from "crypto-js/lib-typedarrays";
import Base64 from "crypto-js/enc-base64";
import EncUTF8 from "crypto-js/enc-utf8";
import EncHex from "crypto-js/enc-hex";

import {DecryptResult} from "@/decrypt/entity";

const CORE_KEY = EncHex.parse("687a4852416d736f356b496e62617857");
const META_KEY = EncHex.parse("2331346C6A6B5F215C5D2630553C2728");
const MagicHeader = [0x43, 0x54, 0x45, 0x4E, 0x46, 0x44, 0x41, 0x4D];


export async function Decrypt(file: File, raw_filename: string, _: string): Promise<DecryptResult> {
    return (new NcmDecrypt(await GetArrayBuffer(file), raw_filename)).decrypt()
}


interface NcmMusicMeta {
    //musicId: number
    musicName?: string
    artist?: Array<string | number>[]
    format?: string
    album?: string
    albumPic?: string
}

interface NcmDjMeta {
    mainMusic: NcmMusicMeta
}


class NcmDecrypt {
    raw: ArrayBuffer
    view: DataView
    offset: number = 0
    filename: string
    format: string = ""
    mime: string = ""
    audio?: Uint8Array
    blob?: Blob
    oriMeta?: NcmMusicMeta
    newMeta?: IMusicMeta
    image?: { mime: string, buffer: ArrayBuffer, url: string }

    constructor(buf: ArrayBuffer, filename: string) {
        const prefix = new Uint8Array(buf, 0, 8)
        if (!BytesHasPrefix(prefix, MagicHeader)) throw Error("此ncm文件已损坏")
        offset = 10
        raw = buf
        view = new DataView(buf)
        filename = filename
    }

    _getKeyData(): Uint8Array {
        const keyLen = view.getUint32(offset, true);
        offset += 4;
        const cipherText = new Uint8Array(raw, offset, keyLen)
            .map(uint8 => uint8 ^ 0x64);
        offset += keyLen;

        const plainText = AES.decrypt(
            // @ts-ignore
            {ciphertext: WordArray.create(cipherText)},
            CORE_KEY,
            {mode: ModeECB, padding: PKCS7}
        );

        const result = new Uint8Array(plainText.sigBytes);

        const words = plainText.words;
        const sigBytes = plainText.sigBytes;
        for (let i = 0; i < sigBytes; i++) {
            result[i] = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
        }

        return result.slice(17)
    }

    _getKeyBox(): Uint8Array {
        const keyData = _getKeyData()
        const box = new Uint8Array(Array(256).keys());

        const keyDataLen = keyData.length;

        let j = 0;

        for (let i = 0; i < 256; i++) {
            j = (box[i] + j + keyData[i % keyDataLen]) & 0xff;
            [box[i], box[j]] = [box[j], box[i]];
        }

        return box.map((_, i, arr) => {
            i = (i + 1) & 0xff;
            const si = arr[i];
            const sj = arr[(i + si) & 0xff];
            return arr[(si + sj) & 0xff];
        });
    }

    _getMetaData(): NcmMusicMeta {
        const metaDataLen = view.getUint32(offset, true);
        offset += 4;
        if (metaDataLen === 0) return {};

        const cipherText = new Uint8Array(raw, offset, metaDataLen)
            .map(data => data ^ 0x63);
        offset += metaDataLen;

        WordArray.create()
        const plainText = AES.decrypt(
            // @ts-ignore
            {
                ciphertext: Base64.parse(
                    // @ts-ignore
                    WordArray.create(cipherText.slice(22)).toString(EncUTF8)
                )
            },
            META_KEY,
            {mode: ModeECB, padding: PKCS7}
        ).toString(EncUTF8);

        const labelIndex = plainText.indexOf(":");
        let result: NcmMusicMeta;
        if (plainText.slice(0, labelIndex) === "dj") {
            const tmp: NcmDjMeta = JSON.parse(plainText.slice(labelIndex + 1));
            result = tmp.mainMusic;
        } else {
            result = JSON.parse(plainText.slice(labelIndex + 1));
        }
        if (!!result.albumPic) {
            result.albumPic = result.albumPic.replace("http://", "https://") + "?param=500y500"
        }
        return result
    }

    _getAudio(keyBox: Uint8Array): Uint8Array {
        offset += view.getUint32(offset + 5, true) + 13
        const audioData = new Uint8Array(raw, offset)
        let lenAudioData = audioData.length
        for (let cur = 0; cur < lenAudioData; ++cur) audioData[cur] ^= keyBox[cur & 0xff]
        return audioData
    }

    async _buildMeta() {
        if (!oriMeta) throw Error("invalid sequence")

        const info = GetMetaFromFile(filename, oriMeta.musicName)

        // build artists
        let artists: string[] = [];
        if (!!oriMeta.artist) {
            oriMeta.artist.forEach(arr => artists.push(<string>arr[0]));
        }

        if (artists.length === 0 && !!info.artist) {
            artists = info.artist.split(',')
                .map(val => val.trim()).filter(val => val != "");
        }

        if (oriMeta.albumPic) try {
            image = await GetImageFromURL(oriMeta.albumPic)
            while (image && image.buffer.byteLength >= 1 << 24) {
                let img = await jimp.read(Buffer.from(image.buffer))
                await img.resize(Math.round(img.getHeight() / 2), jimp.AUTO)
                image.buffer = await img.getBufferAsync("image/jpeg")
            }
        } catch (e) {
            console.log("get cover image failed", e)
        }


        newMeta = {title: info.title, artists, album: oriMeta.album, picture: image?.buffer}
    }

    async _writeMeta() {
        if (!audio || !newMeta) throw Error("invalid sequence")

        if (!blob) blob = new Blob([audio], {type: mime})
        const ori = await metaParseBlob(blob);

        let shouldWrite = !ori.common.album && !ori.common.artists && !ori.common.title
        if (shouldWrite || newMeta.picture) {
            if (format === "mp3") {
                audio = WriteMetaToMp3(Buffer.from(audio), newMeta, ori)
            } else if (format === "flac") {
                audio = WriteMetaToFlac(Buffer.from(audio), newMeta, ori)
            } else {
                console.info(`writing meta for ${format} is not being supported for now`)
                return
            }
            blob = new Blob([audio], {type: mime})
        }
    }

    gatherResult(): DecryptResult {
        if (!newMeta) throw Error("bad sequence")
        return {
            title: newMeta.title,
            artist: newMeta.artists?.join("; "),
            ext: format,
            album: newMeta.album,
            picture: image?.url,
            file: URL.createObjectURL(blob),
            blob: blob as Blob,
            mime: mime
        }
    }

    async decrypt() {
        const keyBox = _getKeyBox()
        oriMeta = _getMetaData()
        audio = _getAudio(keyBox)
        format = oriMeta.format || SniffAudioExt(audio)
        mime = AudioMimeType[format]
        await _buildMeta()
        try {
            await _writeMeta()
        } catch (e) {
            console.warn("write meta data failed", e)
        }
        return gatherResult()
    }
}
