import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";
import { nmlPlaylist } from "./../config/paths.js";
const cloneDeep = require("lodash.clonedeep");

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

// pathLibrary and playlistsItemPath change in recursive function
// Mapping path in Library to path in Playlists (used for browser tree)
// playlists and library stay the same
let id = 0;
function getItems(pathLibrary, playlistsItemPath, library, playlists) {
	let nodesArray = getObjValue(pathLibrary, library);
	let subnodesArrayPath = ".SUBNODES.0.NODE";
	if (nodesArray) {
		nodesArray.forEach((node, index) => {
			let nodePath = pathLibrary + "." + index;
			let nodeData = {
				label: node.$.NAME,
				path: nodePath,
				id: id,
			};
			id++;
			if (node.SUBNODES) {
				nodeData.nodes = [];
				nodeData.type = "FOLDER";
				nodeData.droppable = true;
			}
			if (node.PLAYLIST) {
				let uuid = node.PLAYLIST[0]["$"]["UUID"];
				nodeData.uuid = uuid;
				nodeData.type = "PLAYLIST";
				nodeData.droppable = false;
			}
			if (node.SMARTLIST) {
				let uuid = node.SMARTLIST[0]["$"]["UUID"];
				nodeData.uuid = uuid;
				nodeData.type = "SMARTLIST";
				nodeData.droppable = false;
			}
			if (playlistsItemPath === "") {
				nodeData.draggable = false;
				nodeData.folded = false;
			} else {
				nodeData.draggable = true;
				nodeData.folded = true;
			}
			setObjValue(playlistsItemPath + index, nodeData, playlists);

			// If there are children, repeat this function and complete paths
			if (nodesArray[index].SUBNODES) {
				getItems(
					nodePath + subnodesArrayPath,
					playlistsItemPath + index + ".nodes.",
					library,
					playlists
				);
			}
		});
	}
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
			state.playlists = [];

			getItems(nmlPlaylist, "", state.library, state.playlists);

			console.log(cloneDeep(state.playlists));
			// Test print specific value from playlist object
			// console.log(
			// 	getObjValue(
			// 		"NML.PLAYLISTS.0.NODE.0.SUBNODES.0.NODE.5",
			// 		state.library
			// 	)
			// );
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
