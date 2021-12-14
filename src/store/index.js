import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";
import { nmlPlaylist } from "./../config/paths.js";

// function removeFromObject(obj, prop) {
// 	if (typeof obj === "undefined") {
// 		return false;
// 	}

// 	var _index = prop.indexOf(".");
// 	if (_index > -1) {
// 		return removeFromObject(
// 			obj[prop.substring(0, _index)],
// 			prop.substr(_index + 1)
// 		);
// 	}
// 	// delete obj[prop];
// 	return prop;
// }

function setObjValue(path, value, obj) {
	var schema = obj; // a moving reference to internal objects within obj
	var pList = path.split(".");
	var len = pList.length;
	for (var i = 0; i < len - 1; i++) {
		var elem = pList[i];
		if (!schema[elem]) schema[elem] = {};
		schema = schema[elem];
	}

	schema[pList[len - 1]] = value;
}

function getObjValue(path, obj) {
	var schema = obj; // a moving reference to internal objects within obj
	var pList = path.split(".");
	var len = pList.length;
	for (var i = 0; i < len - 1; i++) {
		var elem = pList[i];
		if (!schema[elem]) schema[elem] = {};
		schema = schema[elem];
	}

	return schema[pList[len - 1]];
}

function getItems(path, lib, pl, pathIndex) {
	let obj = getObjValue(path, lib);
	let subfolderPath = ".SUBNODES.0.NODE";
	let name = ".$.NAME";
	if (obj) {
		// console.log(obj);
		obj.forEach((item, index) => {
			let value = {
				text: obj[index].$.NAME,
				children: [],
				// getItems(path + "." + index + subfolderPath, lib);
			};
			setObjValue(pathIndex + ".children." + index, value, pl);
			if (obj[index].SUBNODES) {
				getItems(
					path + "." + index + subfolderPath,
					lib,
					pl,
					pathIndex + ".children." + index
				);
			}
		});
	} else {
		// console.log("does not exist");
		// console.log(getItems(path + subfolderPath, lib));
	}
	// console.log(pl);
}

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

			// Autocomplete
			genres: [],
			tags: [],

			// NML data (XML to JS)
			library: null, // JS Object - Converted from NML Traktor Library XML

			// Rebuild data (new JS structure)
			playlists: null, // Rebuild playlist for Browser Tree
			collection: null, // full rowData - rebuild JS object with relevant columns
			rowData: null, // filtered rowData - rebuild and filtered with only visible rows

			// Other
			filenameToIndex: null, // map filename to rowData index
			trackPlaying: {}, // Currently loaded and playing track
		};
	},
	getters: {
		library: (state) => (path) => {
			return getObjValue(path, state.library);
		},
	},
	mutations: {
		setLibraryValue(state, data) {
			setObjValue(data.path, data.value, state.library);
		},
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

		//  NML data
		setLibrary(state, data) {
			state.library = data;
		},

		// Rebuild data
		setCollection(state, data) {
			state.collection = data;
		},
		setPlaylistData(state) {
			// let id = 0;
			// let plArray = [];
			// first item
			state.playlists = [
				{
					text: "Playlists",
					children: [],
				},
			];

			getItems(
				nmlPlaylist + ".SUBNODES.0.NODE",
				state.library,
				state.playlists,
				0
			);

			// let pl = getObjValue(
			// 	nmlPlaylist + ".SUBNODES.0.NODE",
			// 	state.library
			// );
			// console.log(pl);
			// let pid = 0;
			// pl.forEach((item) => {
			// 	id++;
			// 	plArray[0].children.push({
			// 		text: item.$.NAME,
			// 	});
			// 	// console.log(item);
			// });
			// state.playlists = plArray;
			console.log(state.playlists);
		},
		setRowData(state, data) {
			state.rowData = data;
		},

		// Other
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
