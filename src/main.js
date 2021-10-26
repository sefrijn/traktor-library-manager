import { use, createApp } from "vue";
import App from "./App.vue";
import { createStore } from "vuex";
import "./css/styles.scss";
import "./assets/tailwind.css";
import VTooltipPlugin from "v-tooltip";
import "v-tooltip/dist/v-tooltip.css";

const app = createApp(App);

const store = createStore({
	state() {
		return {
			loading: false,
		};
	},
	mutations: {
		setTrue(state) {
			state.loading = true;
		},
		setFalse(state) {
			state.loading = false;
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
