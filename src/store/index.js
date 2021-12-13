import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";

export default createStore({
	modules: {
		functional: functional,
		display: display,
	},
	state() {
		return {
			// Filters
			query: "",
			filter: {
				rating: 0,
				color: 0,
			},

			// Tracks
			collection: null,
			playlists: null,
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
		setTrackPlaying(state, track) {
			state.trackPlaying = track;
		},

		setQuery(state, text) {
			state.query = text;
		},
		setFilter(state, value) {
			state.filter = value;
		},
		setPlaylistData(state, data) {
			state.playlists = data;
		},
		// addPlaylist(state, playlist) {
		// 	state.playlists[playlist.name] = playlist.entries;
		// },
	},
	actions: {
		setPreventScroll({ commit }, prevent) {
			commit("setPreventScroll", prevent);
		},
	},
});
