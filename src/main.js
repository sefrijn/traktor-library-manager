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
			scroll: {
				ratio: 0.0, // a decimal ratio, such as 0.349
				source: "",
				human: true,
			},
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
		setScroll(state, scroll) {
			state.scroll.ratio = scroll.ratio;
			state.scroll.source = scroll.source;
		},
		setHumanScroll(state, human) {
			state.scroll.human = human;
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
