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
	// getters: {
	// 	loading(state) {
	// 		return state.loading;
	// 	},
	// 	saving(state) {
	// 		return state.saving;
	// 	},
	// 	savingEnabled(state) {
	// 		return state.savingEnabled;
	// 	},
	// 	libraryPath(state) {
	// 		return state.libraryPath;
	// 	},
	// 	startingUp(state) {
	// 		return state.startingUp;
	// 	},
	// },
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
		setShowMarkers(state, value) {
			state.showMarkers = value;
		},
		setActivePlaylist(state, playlist) {
			state.activePlaylist = playlist;
		},
	},
};
