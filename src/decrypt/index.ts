import { Decrypt as JooxDecrypt } from '@/decrypt/joox';
import { Decrypt as KgmDecrypt } from '@/decrypt/kgm';
import { Decrypt as KwmDecrypt } from '@/decrypt/kwm';
import { Decrypt as NcmDecrypt } from '@/decrypt/ncm';
import { Decrypt as QmcDecrypt } from '@/decrypt/qmc';
import { Decrypt as QmcCacheDecrypt } from '@/decrypt/qmccache';
import { Decrypt as RawDecrypt } from '@/decrypt/raw';
import { Decrypt as TmDecrypt } from '@/decrypt/tm';
import { Decrypt as XmDecrypt } from '@/decrypt/xm';
import { DecryptResult, FileInfo } from '@/decrypt/entity';
import { SplitFilename } from '@/decrypt/utils';
import { storage } from '@/utils/storage';
import InMemoryStorage from '@/utils/storage/InMemoryStorage';

export async function Decrypt(file: FileInfo, config: Record<string, any>): Promise<DecryptResult> {
  if (storage instanceof InMemoryStorage) {
    await storage.setAll(config);
  }

  const raw = SplitFilename(file.name);
  let rt_data: DecryptResult;
  switch (raw.ext) {
    case 'ncm':
      rt_data = await NcmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'kwm':
      rt_data = await KwmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'xm':
    case 'wav':
    case 'mp3':
    case 'flac':
    case 'm4a':
      rt_data = await XmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'ogg':
      rt_data = await RawDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'tm0':
    case 'tm3':
      rt_data = await RawDecrypt(file.raw, raw.name, 'mp3');
      break;
    case 'qmc3':
    case 'qmc2':
    case 'qmc0':
    case 'qmcflac':
    case 'qmcogg':
    case 'tkm':
    case 'bkcmp3':
    case 'bkcm4a':
    case 'bkcflac':
    case 'bkcwav':
    case 'bkcape':
    case 'bkcogg':
    case 'bkcwma':
    case 'mggl':
    case 'mflac':
    case 'mflac0':
    case 'mgg':
    case 'mgg1':
    case '666c6163':
    case '6d7033':
    case '6f6767':
    case '6d3461':
    case '776176':
      rt_data = await QmcDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'tm2':
    case 'tm6':
      rt_data = await TmDecrypt(file.raw, raw.name);
      break;
    case 'cache':
      rt_data = await QmcCacheDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'vpr':
    case 'kgm':
    case 'kgma':
      rt_data = await KgmDecrypt(file.raw, raw.name, raw.ext);
      break;
    case 'ofl_en':
      rt_data = await JooxDecrypt(file.raw, raw.name, raw.ext);
      break;
    default:
      throw '不支持此文件格式';
  }

  if (!rt_data.rawExt) rt_data.rawExt = raw.ext;
  if (!rt_data.rawFilename) rt_data.rawFilename = raw.name;
  console.log(rt_data);
  return rt_data;
}
