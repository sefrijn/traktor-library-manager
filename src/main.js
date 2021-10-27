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
			display: "split",
		};
	},
	mutations: {
		setTrue(state) {
			state.loading = true;
		},
		setFalse(state) {
			state.loading = false;
		},
		setDisplay(state, display_type) {
			state.display = display_type;
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
