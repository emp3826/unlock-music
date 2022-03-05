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
.use(Link)
.use(Image)
.use(Button)
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
.use(Upload)
.use(Checkbox)
.use(Radio)
.use(Tooltip)
.use(Progress)
.mount('#app')
Vue.prototype.$notify = Notification;
Vue.prototype.$confirm = MessageBox.confirm;

Vue.config.productionTip = false;
