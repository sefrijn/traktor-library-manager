export default {
	state: () => ({
		display: "split", // display setting [split,list,grid]
		sidebar: true,
		preventScroll: false, // prevent during editing rowdata
		activePlaylist: null, // selected playlist, null means all tracks
		activePlaylistPath: [],
		showMarkers: false,
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
	},
};
