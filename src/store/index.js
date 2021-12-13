import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";

function removeFromObject(obj, prop) {
	if (typeof obj === "undefined") {
		return false;
	}

	var _index = prop.indexOf(".");
	if (_index > -1) {
		return removeFromObject(
			obj[prop.substring(0, _index)],
			prop.substr(_index + 1)
		);
	}
	// delete obj[prop];
	return prop;
}

// function setObjValue(path, value, obj) {
// 	var schema = obj; // a moving reference to internal objects within obj
// 	var pList = path.split(".");
// 	var len = pList.length;
// 	for (var i = 0; i < len - 1; i++) {
// 		var elem = pList[i];
// 		if (!schema[elem]) schema[elem] = {};
// 		schema = schema[elem];
// 	}

// 	schema[pList[len - 1]] = value;
// }

export default createStore({
	modules: {
		functional: functional,
		display: display,
	},
	state() {
		return {
			debug: {},

			// Filters
			query: "",
			filter: {
				rating: 0,
				color: 0,
			},

			// Autocomplete
			genres: [],
			tags: [],

			// Tracks
			// library: null, // full JS Object - converted from NML XML
			collection: null, // full rowData - rebuild with only relevant columns
			playlists: null, // Reference of converted library XML to JS object
			rowData: null, // filtered rowData
			filenameToIndex: null,
			trackPlaying: {},
			// trackSelected: {},
		};
	},
	mutations: {
		// setLibraryValue(state, data) {
		// 	setObjValue(data.path, data.value, state.library);
		// },
		// Filter
		setQuery(state, text) {
			state.query = text;
		},
		setFilter(state, value) {
			state.filter = value;
		},

		// Autocomplete
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

		//  Tracks
		setLibrary(state, data) {
			state.library = data;
		},
		setCollection(state, data) {
			state.collection = data;
		},
		setPlaylistData(state, data) {
			state.playlists = data;
		},
		setRowData(state, data) {
			console.log("setRowData in Vuex Store");
			state.rowData = data;
		},
		setFilenameToIndex(state, data) {
			state.filenameToIndex = data;
		},
		setTrackPlaying(state, track) {
			state.trackPlaying = track;
		},

		// New playlist function
		removePlaylistFolder(state, path) {
			// console.log(path);
			// console.log(state.playlists.SUBNODES[0].NODE);
			// console.log(removeFromObject(state.playlists, path));
			// delete state.playlists[removeFromObject(state.playlists, path)];
			// console.log(state.playlists.SUBNODES[0].NODE);
			// console.log(state.playlists[removeFromObject(state.playlists, path)]);
			// console.log(
			// 	fetchFromObject(state.playlists, state.playlists.SUBNODES)
			// );
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
