<template>
	<ul
		v-if="playlists"
		class="text-sm select-none text-gray-light playlists overflow-auto"
	>
		<li class="all">
			<div
				class="flex py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
				:class="{ active: this.$store.getters.activePlaylist == null }"
				@click="openTrackCollection"
			>
				<svg-icon
					type="mdi"
					class="text-white"
					:path="iconCollection"
					size="18"
				></svg-icon>
				<span>Track Collection</span>
			</div>
		</li>
		<folder :folder="playlists" :depth="0" :index="0" :path="[0]"></folder>
	</ul>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveMusic } from "@mdi/js";
import Folder from "./Folder.vue";
import { nmlPlaylist } from "./../config/paths.js";

export default {
	components: {
		Folder,
		SvgIcon,
	},
	data() {
		return {
			iconCollection: mdiArchiveMusic,
		};
	},
	computed: {
		playlists() {
			// Only IF library is set, get correct item
			return this.$store.state.library
				? this.$store.getters.library(nmlPlaylist + ".0")
				: null;

			// return this.$store.state.playlists;
		},
	},
	methods: {
		openTrackCollection() {
			this.$store.commit("setRowData", this.$store.state.collection);
			this.$store.commit("setActivePlaylist", null);
		},
	},
};
</script>
