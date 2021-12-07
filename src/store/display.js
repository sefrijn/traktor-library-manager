export default {
	state: () => ({
		display: "split", // display setting [split,list,grid]
		sidebar: true,
		scrollSource: "",
		scrollRatio: 0.0,
		preventScroll: false, // prevent during editing rowdata
		activePlaylist: null, // selected playlist, null means all tracks
		showMarkers: false,
	}),
	getters: {
		display(state) {
			return state.display;
		},
		sidebar(state) {
			return state.sidebar;
		},
		scrollSource(state) {
			return state.scrollSource;
		},
		scrollRatio(state) {
			return state.scrollRatio;
		},
		preventScroll(state) {
			return state.preventScroll;
		},
		activePlaylist(state) {
			return state.activePlaylist;
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
		setScrollSource(state, source) {
			state.scrollSource = source;
		},
		setScrollRatio(state, ratio) {
			state.scrollRatio = ratio;
		},
		setPreventScroll(state, prevent) {
			state.preventScroll = prevent;
		},
		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
		setShowMarkers(state, value) {
			state.showMarkers = value;
		},
	},
};
