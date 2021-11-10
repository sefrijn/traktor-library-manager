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
			saving: false, // is document being saved
			display: "split", // display setting [split,list,grid]
			scroll: {
				ratio: 0.0, // a decimal ratio, such as 0.349
				source: "",
				human: true,
			},
			preventScroll: false,
			trackPlaying: {},
			trackSelected: {},
			query: "",
			sidebar: true,
			playlists: {},
			collection: null,
			rowData: null,
			filenameToIndex: null,
			activePlaylist: null,
			genres: [],
			comments_1: [],
			comments_2: [],
		};
	},
	mutations: {
		setPreventScroll(state, prevent) {
			state.preventScroll = prevent;
		},
		addGenre(state, genre) {
			state.genres.push(genre);
			state.genres.sort();
		},
		clearAllGenres(state) {
			state.genres = [];
		},

		addComment_1(state, tag) {
			state.comments_1.push(tag);
			state.comments_1.sort();
		},
		clearComments_1(state) {
			state.comments_1 = [];
		},

		addComment_2(state, tag) {
			state.comments_2.push(tag);
			state.comments_2.sort();
		},
		clearComments_2(state) {
			state.comments_2 = [];
		},

		setSaving(state, saving) {
			state.saving = saving;
		},
		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
		setCollection(state, data) {
			state.collection = data;
		},
		setFilenameToIndex(state, data) {
			state.filenameToIndex = data;
		},
		setRowData(state, data) {
			console.log("setRowData in Vuex Store");
			state.rowData = data;
		},
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
		addPlaylist(state, playlist) {
			state.playslists["playlist.name"] = playlist.entries;
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
