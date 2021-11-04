<template>
	<ul
		v-if="playlists"
		class="text-sm select-none text-gray-light playlists overflow-scroll"
	>
		<li class="all">
			<div
				class="flex py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
				:class="{ active: this.$store.state.activePlaylist == null }"
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
		<folder :folder="playlists"></folder>
	</ul>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveMusic } from "@mdi/js";
import Folder from "./Folder.vue";

export default {
	props: {
		playlists: Object,
	},
	data() {
		return {
			iconCollection: mdiArchiveMusic,
		};
	},
	components: {
		Folder,
		SvgIcon,
	},
	methods: {
		openTrackCollection() {
			this.$store.commit("setRowData", this.$store.state.collection);
			this.$store.commit("setActivePlaylist", null);
		},
	},
};
</script>
