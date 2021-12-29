import { createStore } from "vuex";
import functional from "./functional.js";
import display from "./display.js";
import nmlData from "./nml-data.js";

import { nmlPlaylist } from "./../config/paths.js";
const cloneDeep = require("lodash.clonedeep");
const slugify = require("slugify");

export default createStore({
	modules: {
		functional: functional,
		display: display,
		nmlData: nmlData,
	},
	state() {
		return {
			// AG Grid data & Filters
			rowData: null, // filtered rowData - rebuild and filtered with only visible rows
			query: "",
			filter: {
				rating: 0,
				color: 0,
			},

			// Other
			trackPlaying: {}, // Currently loaded and playing track
		};
	},
	getters: {},
	mutations: {
		// AG Grid
		setRowData(state, data) {
			state.rowData = data;
		},
		setQuery(state, text) {
			state.query = text;
		},
		setFilter(state, value) {
			state.filter = value;
		},

		// Other
		setTrackPlaying(state, track) {
			state.trackPlaying = track;
		},
	},
	actions: {
		setPreventScroll({ commit }, prevent) {
			commit("setPreventScroll", prevent);
		},
	},
});
