import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";
import { nmlPlaylist } from "./../config/paths.js";
const cloneDeep = require("lodash.clonedeep");
const slugify = require("slugify");

function removeObjValue(path, obj) {
	var schema = obj; // a moving reference to internal objects within obj
	var pList = path.split(".");
	var len = pList.length;
	for (var i = 0; i < len - 1; i++) {
		var elem = pList[i];
		if (!schema[elem]) schema[elem] = {};
		schema = schema[elem];
	}

	delete schema[pList[len - 1]];
}

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

function makeid(length) {
	var result = "";
	var characters =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	var charactersLength = characters.length;
	for (var i = 0; i < length; i++) {
		result += characters.charAt(
			Math.floor(Math.random() * charactersLength)
		);
	}
	return result;
}

// pathLibrary and playlistsItemPath change in recursive function
// Mapping path in Library to path in Playlists (used for browser tree)
// playlists and library stay the same

function getItems(pathLibrary, playlistsItemPath, library, playlists) {
	let nodesArray = getObjValue(pathLibrary, library);
	let subnodesArrayPath = ".SUBNODES.0.NODE";
	if (nodesArray) {
		nodesArray.forEach((node, index) => {
			let nodePath = pathLibrary + "." + index;
			let nodeData = {};
			if (node.SUBNODES) {
				nodeData.text = " " + node.$.NAME;
				let id = makeid(5);
				nodeData.child = [];
				nodeData.id = slugify(`${node.$.NAME} folder ${id}`);
			}
			if (node.PLAYLIST) {
				nodeData.text = node.$.NAME;
				let uuid = node.PLAYLIST[0]["$"]["UUID"];
				nodeData.id = uuid + "-playlist";
				if (
					node.$.NAME === "Preparation" &&
					pathLibrary === "NML.PLAYLISTS.0.NODE.0.SUBNODES.0.NODE"
				) {
					nodeData.htmlAttributes = { class: "preparation" };
				}
			}
			if (node.SMARTLIST) {
				nodeData.text = node.$.NAME;
				let uuid = node.SMARTLIST[0]["$"]["UUID"];
				nodeData.id = uuid + "-smartlist";
			}
			// Root element expanded
			if (playlistsItemPath === "") {
				nodeData.expanded = true;
			} else {
			}
			setObjValue(playlistsItemPath + index, nodeData, playlists);

			// If there are children, repeat this function and complete paths
			if (nodesArray[index].SUBNODES) {
				getItems(
					nodePath + subnodesArrayPath,
					playlistsItemPath + index + ".child.",
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
			playlists: [], // Rebuild playlist for Browser Tree
			fieldsTreeView: {
				dataSource: null,
				id: "id",
				text: "text",
				ready: false,
			},

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
		setTreeViewData(state, data) {
			state.fieldsTreeView = {
				dataSource: data,
				id: state.fieldsTreeView.id,
				text: state.fieldsTreeView.text,
				ready: state.fieldsTreeView.ready,
			};
		},
		setPlaylistData(state) {
			// state.playlists = [];
			getItems(nmlPlaylist, "", state.library, state.playlists);
			state.fieldsTreeView.dataSource = state.playlists;
			state.fieldsTreeView.ready = true;

			console.log(state.playlists);
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
		removePlaylistFolder(state) {
			removeObjValue("0.child.0.child", state.playlists);
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
