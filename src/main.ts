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

const app = createApp(App)
app.use(ElLink)
app.use(ElImage)
app.use(ElButton)
app.use(ElDialog)
app.use(ElForm)
app.use(ElFormItem)
app.use(ElInput)
app.use(ElTable)
app.use(ElTableColumn)
app.use(ElMain)
app.use(ElFooter)
app.use(ElContainer)
app.use(ElIcon)
app.use(ElRow)
app.use(ElCol)
app.use(ElUpload)
app.use(ElCheckbox)
app.use(ElRadio)
app.use(ElTooltip)
app.use(ElProgress)
app.mount('#app')
app.config.globalProperties.$notify = ElNotification
.prototype.$confirm = ElMessageBox.confirm
