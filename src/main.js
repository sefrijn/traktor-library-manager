import { use, createApp } from 'vue';
import App from './App.vue';
import store from './store';
import './css/styles.scss';
import './assets/tailwind.css';
import FloatingVue from 'floating-vue';
import 'floating-vue/dist/style.css';

const app = createApp(App);

app.use(FloatingVue);
app.use(store);
app.mount('#app');
