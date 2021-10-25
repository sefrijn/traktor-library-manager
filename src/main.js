import { use, createApp } from "vue";
import App from "./App.vue";
import "./css/styles.scss";
import "./assets/tailwind.css";
import VTooltipPlugin from "v-tooltip";
import "v-tooltip/dist/v-tooltip.css";

const app = createApp(App);
app.use(VTooltipPlugin);
app.mount("#app");
