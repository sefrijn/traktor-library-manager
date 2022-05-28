export default {
    state: () => ({
        loading: false, // is audio being loaded? show loader
        saving: false, // is document being saved
        savingEnabled: true,
        libraryPath: null, // path to Library NML file
        startingUp: true,
        allowTrackDragDrop: true,
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
        allowTrackDragDrop(state) {
            return state.allowTrackDragDrop;
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
        setAllowTrackDragDrop(state, allow) {
            state.allowTrackDragDrop = allow;
        },
    },
};
