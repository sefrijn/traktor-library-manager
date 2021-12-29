import { nmlCollection, nmlPlaylist, nmlSubnode } from "./../config/paths.js";
const slugify = require("slugify");
const cloneDeep = require("lodash.clonedeep");

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
		initialPlaylistData(state) {
			// Called only once during startup to get data for the app. After that, app only writes data to NML file, no more reading.
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
		addtoPlaylistEntries(state, data) {
			// Add track to auto playlist
			let loc = objectWalker(
				nmlCollection + "." + data.index + ".LOCATION.0.$",
				state.library
			);
			state.playlistEntries[data.id].push(
				loc.VOLUME + loc.DIR + loc.FILE
			);
		},
		griddelete_from_playlist(state, data) {
			let index = state.playlistEntries[data.playlist].findIndex(
				(track) =>
					track.includes(data.artist) && track.includes(data.title)
			);
			state.playlistEntries[data.playlist].splice(index, 1);
		},
		addNode(state, data) {
			let treeview = document.getElementById("treeview").ej2_instances[0];
			let selected = treeview.getNode(data.selected);
			let parentID = state.playlists[0].id;

			if (selected.id !== "") {
				parentID = selected.id.includes("-folder-")
					? selected.id
					: selected.parentID;
			}

			// Node for Treeview
			let node = {};

			if (data.type === "playlist") {
				node.text = data.name;
				node.type = data.type;
				node.id = data.id + "-playlist";
				// Create empty array in PlaylistEntries
				state.playlistEntries[data.id] = [];
			}
			if (data.type === "folder") {
				node.text = " " + data.name;
				node.type = data.type;
				node.child = [];
				node.id = slugify(`${data.name} folder ${makeid(5)}`);
			}

			treeview.addNodes([node], parentID);
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
		browserdelete(state, data) {
			let treeview = document.getElementById("treeview").ej2_instances[0];
			treeview.removeNodes([data.id]);
			console.log("node deleted from vuex");
		},
		browserrename(state, data) {
			let treeview = document.getElementById("treeview").ej2_instances[0];
			treeview.beginEdit(data.id);
			console.log("node editing started from vuex");
		},
		updateBrowserData(state) {
			state.browser = {
				dataSource: state.playlists,
				id: state.browser.id,
				text: state.browser.text,
				ready: state.browser.ready,
			};
		},

		// Autocomplete & Autoplaylists
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
		setAutoplaylistFolder(state) {
			// Create Library Manager folder if it does not exist
			let rootfolders = state.playlists[0].child;
			let libManIndex = rootfolders.findIndex((element) =>
				element.text.includes("Library Manager")
			);
			if (libManIndex == -1) {
				let name = "Library Manager";
				let node = {
					text: " " + name,
					type: "folder",
					child: [],
					id: slugify(`${name} folder ${makeid(5)}`),
					htmlAttributes: { class: "library-manager" },
				};
				state.playlists[0].child.push(node);
			}
		},
		setTagList(state) {
			// Get location of Library Manager Folder
			let rootfolders = state.playlists[0].child;
			let libManIndex = rootfolders.findIndex((element) =>
				element.text.includes("Library Manager")
			);

			// Create playlist folder at path
			let name = "Tags";
			let node;

			let autoIndex = rootfolders[libManIndex].child.findIndex(
				(value) => {
					return value.text.trim() == name;
				}
			);
			if (autoIndex == -1) {
				console.log("create auto folder");
				node = {
					text: " " + name,
					child: [],
					id: slugify(`${name} folder ${makeid(5)}`),
					type: "folder",
				};
			} else {
				node = rootfolders[libManIndex].child[autoIndex];
				console.log(
					"auto folder exists with items: " + node.child.length
				);
			}

			let id, playlistIndex, tags, loc;
			let entries = {};
			state.collection.forEach((track, index) => {
				tags = [...new Set(getTags(track))];
				tags.forEach((tag, index) => {
					// If playlist doesn't exist, create new auto playlist
					playlistIndex = node.child.findIndex((value) => {
						return value.text === tag;
					});
					if (playlistIndex == -1) {
						id = "autolist_" + makeid(23);
						// Add track to Browser Node
						node.child.push({
							text: tag,
							type: "playlist",
							id: id + "-playlist",
						});
					} else {
						// If playlist exists, set ID correctly for PlaylistEntries
						id = node.child[playlistIndex].id;
						id = id.substr(0, id.indexOf("-"));
					}
					// Add track to auto playlist
					loc = objectWalker(
						nmlCollection + "." + track.index + ".LOCATION.0.$",
						state.library
					);
					if (entries[id] === undefined) entries[id] = [];
					entries[id].push(loc.VOLUME + loc.DIR + loc.FILE);
				});
			});

			// Cleanup existing nodes
			let keep = [];
			node.child.forEach((tag, index) => {
				if (state.tags.includes(tag.text)) {
					keep.push(cloneDeep(tag));
				}
			});
			node.child = keep;

			// Write to Playlists and PlaylistEntries
			state.playlistEntries = { ...state.playlistEntries, ...entries };
			if (autoIndex == -1) {
				state.playlists[0].child[libManIndex].child.push(node);
			} else {
				state.playlists[0].child[libManIndex].child[autoIndex] = node;
			}
		},
		setDateImportedList(state) {
			// Get location of Library Manager Folder
			let rootfolders = state.playlists[0].child;
			let libManIndex = rootfolders.findIndex((element) =>
				element.text.includes("Library Manager")
			);

			// Create playlist folder at path
			let name = "Date Imported";
			let node;

			let autoIndex = rootfolders[libManIndex].child.findIndex(
				(value) => {
					return value.text.trim() == name;
				}
			);
			if (autoIndex == -1) {
				node = {
					text: " " + name,
					type: "folder",
					child: [],
					id: slugify(`${name} folder ${makeid(5)}`),
				};
			} else {
				node = rootfolders[libManIndex].child[autoIndex];
			}

			let timestamp, date, month, monthName, year;
			let playlistName, playlistIndex, id, loc;
			let entries = {};
			let activeLists = {};
			state.collection.forEach((track, index) => {
				timestamp = Date.parse(track.import_date);
				date = new Date(timestamp);

				monthName = date.toLocaleString("default", {
					month: "long",
				});
				year = date.getFullYear();
				month =
					date.getMonth() < 9
						? "0" + (date.getMonth() + 1)
						: date.getMonth() + 1;
				playlistName = month + " " + monthName;

				// Does Year folder exist?
				let yearIndex = node.child.findIndex((value) => {
					return value.text.trim() == year;
				});
				// Create it
				if (yearIndex == -1) {
					yearIndex = node.child.length;
					node.child.push({
						text: " " + year,
						type: "folder",
						child: [],
						id: slugify(`${year} folder autofolder ${makeid(5)}`),
					});
				}

				// If playlist doesn't exist, create new auto playlist
				playlistIndex = node.child[yearIndex].child.findIndex(
					(value) => {
						return value.text === playlistName;
					}
				);
				if (playlistIndex == -1) {
					// console.log("playlist does not exist");
					id = "autolist_" + makeid(23);
					// Add track to Browser Node
					node.child[yearIndex].child.push({
						text: playlistName,
						type: "playlist",
						id: id + "-playlist",
					});
				} else {
					// If playlist exists, set ID correctly for PlaylistEntries
					id = node.child[yearIndex].child[playlistIndex].id;
					id = id.substr(0, id.indexOf("-"));
				}

				// Generate list for cleanup
				if (activeLists[year] === undefined) {
					activeLists[year] = [];
				}
				if (!activeLists[year].includes(playlistName)) {
					activeLists[year].push(playlistName);
				}

				// Add track to auto playlist
				loc = objectWalker(
					nmlCollection + "." + track.index + ".LOCATION.0.$",
					state.library
				);
				if (entries[id] === undefined) entries[id] = [];
				entries[id].push(loc.VOLUME + loc.DIR + loc.FILE);
			});

			// cleanup unnused years and months
			node.child.forEach((year, index) => {
				if (!(year.text.trim() in activeLists)) {
					node.child.splice(index, 1);
				}
			});

			state.playlistEntries = { ...state.playlistEntries, ...entries };
			if (autoIndex == -1) {
				state.playlists[0].child[libManIndex].child.push(node);
			} else {
				state.playlists[0].child[libManIndex].child[autoIndex] = node;
			}
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
				path + "." + index + nmlSubnode
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
// Recursive functions
// Part of startup proces to set playlist data
function setPlaylistNode(
	pathLibrary,
	playlistsItemPath,
	library,
	playlists,
	entries
) {
	let nodesArray = objectWalker(pathLibrary, library);
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
					pathLibrary === nmlPlaylist + ".0" + nmlSubnode
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
				if (!node.PLAYLIST[0]["$"]["UUID"].includes("autolist")) {
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
				}

				if (
					node.$.NAME === "Preparation" &&
					pathLibrary === nmlPlaylist + ".0" + nmlSubnode
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
					nodePath + nmlSubnode,
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
function objectWalker(path, obj, type = "get", value = undefined) {
	var schema = obj; // a moving reference to internal objects within obj
	var pList = path.split(".");
	var len = pList.length;
	for (var i = 0; i < len - 1; i++) {
		var elem = pList[i];
		if (!schema[elem]) schema[elem] = {};
		schema = schema[elem];
	}

	if (type == "get") return schema[pList[len - 1]];

	if (type == "set") schema[pList[len - 1]] = value;

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

function getTags(track) {
	let tags1 = track.comment_1;
	if (tags1 != undefined && tags1 != "") {
		tags1 = tags1.split(/[;,]+/).map((item) => item.trim());
	} else {
		tags1 = [];
	}
	let tags2 = track.comment_2;
	if (tags2 != undefined && tags2 != "") {
		tags2 = tags2.split(/[;,]+/).map((item) => item.trim());
	} else {
		tags2 = [];
	}
	let tags = [...tags1, ...tags2];
	return tags;
}
