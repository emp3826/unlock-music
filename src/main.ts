import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import {
  Button,
  Checkbox,
  Col,
  Container,
  Dialog,
  Form,
  FormItem,
  Footer,
  Icon,
  Image,
  Input,
  Link,
  Main,
  Notification,
  Progress,
  Radio,
  Row,
  Table,
  TableColumn,
  Tooltip,
  Upload,
  MessageBox,
} from 'element-ui';
import 'element-ui/lib/theme-chalk/base.css';

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
