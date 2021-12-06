export default {
	state: () => ({
		loading: false, // is audio being loaded? show loader
		saving: false, // is document being saved
		savingEnabled: true,
		libraryPath: null, // path to Library NML file
		startingUp: true,
	}),
	getters: {
		loading(state) {
			return state.loading;
		},
		saving(state) {
			return state.saving;
		},
		savingEnabled(state) {
			return state.savingEnabled;
		},
		libraryPath(state) {
			return state.libraryPath;
		},
		startingUp(state) {
			return state.startingUp;
		},
	},
	mutations: {
		setLoading(state, loading) {
			state.loading = loading;
		},
		setSaving(state, saving) {
			state.saving = saving;
		},
		setSavingEnabled(state, savingEnabled) {
			state.savingEnabled = savingEnabled;
		},
		setLibraryPath(state, path) {
			state.libraryPath = path;
		},
		setStartingUp(state, status) {
			state.startingUp = status;
		},
	},
};
