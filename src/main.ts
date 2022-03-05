import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import {
  ElButton,
  ElCheckbox,
  ElCol,
  ElContainer,
  ElDialog,
  ElForm,
  ElFormItem,
  ElFooter,
  ElIcon,
  ElImage,
  ElInput,
  ElLink,
  ElMain,
  ElNotification,
  ElProgress,
  ElRadio,
  ElRow,
  ElTable,
  ElTableColumn,
  ElTooltip,
  ElUpload,
  ElMessageBox,
} from 'element-plus';
import 'element-plus/dist/index.css';

createApp(App)
.use(ElLink)
.use(ElImage)
.use(ElButton)
.use(Dialog)
.use(Form)
.use(FormItem)
.use(Input)
.use(Table)
.use(TableColumn)
.use(Main)
.use(Footer)
.use(Container)
.use(Icon)
.use(Row)
.use(Col)
.use(ElUpload)
.use(ElCheckbox)
.use(ElRadio)
.use(ElTooltip)
.use(ElProgress)
.mount('#app')
