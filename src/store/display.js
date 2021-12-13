export default {
	state: () => ({
		display: "split", // display setting [split,list,grid]
		sidebar: true,
		preventScroll: false, // prevent during editing rowdata
		activePlaylist: null, // selected playlist, null means all tracks
		activePlaylistPath: [],
		showMarkers: false,
		contextMenu: { x: 0, y: 0, show: false },
		status: null,
		clipboardMessage: false,
		coverSize: 6,
		spotifyArtist: false,
	}),
	getters: {
		display(state) {
			return state.display;
		},
		sidebar(state) {
			return state.sidebar;
		},
		preventScroll(state) {
			return state.preventScroll;
		},
		activePlaylist(state) {
			return state.activePlaylist;
		},
		activePlaylistPath(state) {
			return state.activePlaylistPath;
		},
		showMarkers(state) {
			return state.showMarkers;
		},
		contextMenu(state) {
			return state.contextMenu;
		},
		status(state) {
			return state.status;
		},
		clipboardMessage(state) {
			return state.clipboardMessage;
		},
		coverSize(state) {
			return state.coverSize;
		},
		spotifyArtist(state) {
			return state.spotifyArtist;
		},
	},
	mutations: {
		setDisplay(state, display_type) {
			state.display = display_type;
			localStorage.display = display_type;
		},
		showSidebar(state, show) {
			state.sidebar = show;
		},
		setPreventScroll(state, prevent) {
			state.preventScroll = prevent;
		},
		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
		setActivePlaylistPath(state, path) {
			state.activePlaylistPath = path;
		},
		setShowMarkers(state, value) {
			state.showMarkers = value;
		},
		setContextMenu(state, value) {
			state.contextMenu = value;
		},
		setStatus(state, text) {
			state.status = text;
		},
		setClipboardMessage(state, show) {
			state.clipboardMessage = show;
		},
		setCoverSize(state, size) {
			state.coverSize = size;
		},
		setSpotifyArtist(state, enabled) {
			state.spotifyArtist = enabled;
		},
	},
};
