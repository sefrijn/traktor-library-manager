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
			// Functional
			loading: false, // is audio being loaded? show loader
			saving: false, // is document being saved
			savingEnabled: true,
			libraryPath: null, // path to Library NML file
			startingUp: true,

			// Display
			display: "split", // display setting [split,list,grid]
			sidebar: true,
			scroll: {
				ratio: 0.0, // a decimal ratio, such as 0.349
				source: "",
				human: true,
			},
			preventScroll: false, // prevent during editing rowdata
			activePlaylist: null, // selected playlist, null means all tracks
			showMarkers: false,

			// Filters
			query: "",
			filter: {
				rating: 0,
				color: 0,
			},

			// Tracks
			collection: null,
			playlists: {},
			rowData: null,
			filenameToIndex: null,
			trackPlaying: {},
			trackSelected: {},

			// Autocomplete
			genres: [],
			tags: [],
		};
	},
	mutations: {
		setLoading(state, loading) {
			state.loading = loading;
		},
		setSaving(state, saving) {
			state.saving = saving;
		},
		setSavingEnabled(state, savingEnabled) {
			state.savingEnabled = savingEnabled;
		},
		setStartingUp(state, status) {
			state.startingUp = status;
		},
		setLibraryPath(state, path) {
			state.libraryPath = path;
		},
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

		addTag(state, tag) {
			state.tags.push(tag);
			state.tags.sort();
		},
		clearTags(state) {
			state.tags = [];
		},

		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
		setShowMarkers(state, value) {
			state.showMarkers = value;
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
		setDisplay(state, display_type) {
			state.display = display_type;
			localStorage.display = display_type;
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
		setFilter(state, value) {
			state.filter = value;
		},
		addPlaylist(state, playlist) {
			state.playslists["playlist.name"] = playlist.entries;
		},
	},
	actions: {
		setPreventScroll({ commit }, prevent) {
			commit("setPreventScroll", prevent);
		},
	},
});

app.use(VTooltipPlugin);
app.use(store);
app.mount("#app");
