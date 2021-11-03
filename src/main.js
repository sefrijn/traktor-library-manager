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
			loading: false, // is audio being loaded? show loader
			display: "split", // display setting [split,list,grid]
			scroll: {
				ratio: 0.0, // a decimal ratio, such as 0.349
				source: "",
				human: true,
			},
			trackPlaying: {},
			trackSelected: {},
			query: "",
			sidebar: false,
		};
	},
	mutations: {
		showSidebar(state, show) {
			state.sidebar = show;
		},
		setTrackPlaying(state, track) {
			state.trackPlaying = track;
		},
		setLoading(state, loading) {
			state.loading = loading;
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
		setQuery(state, text) {
			state.query = text;
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
