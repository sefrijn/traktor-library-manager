import { nmlPlaylist } from "./../config/paths.js";
const slugify = require("slugify");

export default {
	state: () => ({
		// NML data (XML to JS)
		library: null, // JS Object - Converted from NML Traktor Library XML

		// Rebuild data (new JS structure)
		collection: null, // full rowData, rebuild JS object with relevant columns
		playlists: [], // Rebuild playlist for Browser Tree
		playlistEntries: {},
		browser: {
			dataSource: null,
			id: "id",
			text: "text",
			ready: false,
		},

		// Autocomplete lists
		genres: [],
		tags: [],

		// Selected playlist info
		activePlaylist: null, // selected playlist, null means all tracks

		// Track Index
		filenameToIndex: null, // map filename to rowData index
	}),
	getters: {
		libraryFull(state) {
			return state.library;
		},
		library: (state) => (path) => {
			return objectWalker(path, state.library);
		},
		collection(state) {
			return state.collection;
		},
		playlists(state) {
			return state.playlists;
		},
		playlistEntries(state) {
			return state.playlistEntries;
		},
		browser(state) {
			return state.browser;
		},

		// Autocomplete
		genres(state) {
			return state.genres;
		},
		tags(state) {
			return state.tags;
		},

		// Active Playlist
		activePlaylist(state) {
			return state.activePlaylist;
		},

		// Track Index
		filenameToIndex(state) {
			return state.filenameToIndex;
		},
	},
	mutations: {
		//  NML data - ALL
		setLibrary(state, data) {
			state.library = data;
		},
		// NML data - specific node
		setLibraryValue(state, data) {
			objectWalker(data.path, state.library, "set", data.value);
		},
		setLibraryPlaylist(state) {
			// Write data to Library
			setLibraryPlaylistNode(
				state.playlists,
				state.playlistEntries,
				state.library,
				nmlPlaylist
			);
		},

		// Rebuild data
		setCollection(state, data) {
			state.collection = data;
		},
		setPlaylistData(state) {
			setPlaylistNode(
				nmlPlaylist,
				"",
				state.library,
				state.playlists,
				state.playlistEntries
			);
			state.browser.dataSource = state.playlists;
			state.browser.ready = true;
		},
		setBrowserData(state, data) {
			state.playlists = data;
			state.browser = {
				dataSource: data,
				id: state.browser.id,
				text: state.browser.text,
				ready: state.browser.ready,
			};
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

		// Active playlist
		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},

		// Track index
		setFilenameToIndex(state, data) {
			state.filenameToIndex = data;
		},
	},
};

function setLibraryPlaylistNode(nodes, entries, library, path) {
	nodes.forEach((node, index) => {
		if (node.type == "folder") {
			let name = nmlPlaylist === path ? "$ROOT" : node.text.trim();
			let nodeValue = {
				$: {
					TYPE: node.type.toUpperCase(),
					NAME: name,
				},
				SUBNODES: [
					{
						$: {
							COUNT: node.child.length,
						},
						NODE: [],
					},
				],
			};
			objectWalker(path + "." + index, library, "set", nodeValue);
			setLibraryPlaylistNode(
				node.child,
				entries,
				library,
				path + "." + index + ".SUBNODES.0.NODE"
			);
		}
		if (node.type == "playlist") {
			let nodeEntries = [];
			let id = node.id.substr(0, node.id.indexOf("-"));
			entries[id].forEach((entry, index) => {
				nodeEntries.push({
					PRIMARYKEY: [
						{
							$: {
								TYPE: "TRACK",
								KEY: entry,
							},
						},
					],
				});
			});
			let nodeValue = {
				$: {
					TYPE: node.type.toUpperCase(),
					NAME: node.text.trim(),
				},
				PLAYLIST: [
					{
						$: {
							ENTRIES: nodeEntries.length,
							TYPE: "LIST",
							UUID: id,
						},
						ENTRY: nodeEntries,
					},
				],
			};
			objectWalker(path + "." + index, library, "set", nodeValue);
		}
		if (node.type == "smartlist") {
			let id = node.id.substr(0, node.id.indexOf("-"));
			let nodeValue = {
				$: {
					TYPE: node.type.toUpperCase(),
					NAME: node.text.trim(),
				},
				SMARTLIST: [
					{
						$: {
							UUID: id,
						},
						ENTRY: entries[id],
					},
				],
			};
			objectWalker(path + "." + index, library, "set", nodeValue);
		}
	});
}

// > Playlist walker
function setPlaylistNode(
	pathLibrary,
	playlistsItemPath,
	library,
	playlists,
	entries
) {
	let nodesArray = objectWalker(pathLibrary, library);
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
				nodeData.type = "folder";
				if (
					node.$.NAME === "Library Manager" &&
					pathLibrary === "NML.PLAYLISTS.0.NODE.0.SUBNODES.0.NODE"
				) {
					nodeData.htmlAttributes = { class: "library-manager" };
				}
			}
			if (node.PLAYLIST) {
				nodeData.text = node.$.NAME;
				let uuid = node.PLAYLIST[0]["$"]["UUID"];
				nodeData.id = uuid + "-playlist";
				nodeData.type = "playlist";

				// Append current PL to PlaylistEntries
				entries[uuid] = [];
				if ("PLAYLIST" in node && "ENTRY" in node.PLAYLIST[0]) {
					node.PLAYLIST[0]["ENTRY"].forEach((track) => {
						if (track.PRIMARYKEY[0].$.TYPE != "TRACK") {
							delete entries[uuid];
							return;
						}
						entries[uuid].push(track.PRIMARYKEY[0].$.KEY);
					});
				}

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
				nodeData.type = "smartlist";
				entries[uuid] = node.SMARTLIST[0]["SEARCH_EXPRESSION"];
			}
			// Root element expanded
			if (playlistsItemPath === "") {
				nodeData.text = "Playlists";
				nodeData.expanded = true;
			}
			objectWalker(playlistsItemPath + index, playlists, "set", nodeData);

			// If there are children, repeat this function and complete paths
			if (nodesArray[index].SUBNODES) {
				setPlaylistNode(
					nodePath + subnodesArrayPath,
					playlistsItemPath + index + ".child.",
					library,
					playlists,
					entries
				);
			}
		});
	}
}

// > Helpers
function objectWalker(path, obj, type = "get", value = null) {
	var schema = obj; // a moving reference to internal objects within obj
	var pList = path.split(".");
	var len = pList.length;
	for (var i = 0; i < len - 1; i++) {
		var elem = pList[i];
		if (!schema[elem]) schema[elem] = {};
		schema = schema[elem];
	}

	if (type == "get") return schema[pList[len - 1]];

	if (type == "set" && value) schema[pList[len - 1]] = value;

	if (type == "delete") delete schema[pList[len - 1]];
}

// > Generate an ID
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
