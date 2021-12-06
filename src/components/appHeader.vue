<template>
	<header class="bg-black-light flex justify-between items-center px-2">
		<logo></logo>

		<div
			:class="{ 'pointer-events-none opacity-50': !pathToLibrary }"
			class="flex relative space-x-3"
		>
			<search ref="search"></search>

			<filter-rating></filter-rating>

			<filter-color></filter-color>

			<div class="spacer w-6"></div>

			<btn-open-library></btn-open-library>

			<button
				v-tooltip="'Show Cuepoints'"
				class="flex justify-center items-center h-9 w-9"
				@click="toggleMarkers"
				:class="{ active: $store.state.showMarkers }"
			>
				<svg-icon
					type="mdi"
					:path="iconToggleMarkers"
					size="18"
				></svg-icon>
			</button>

			<toggle-sidebar></toggle-sidebar>

			<display-setting></display-setting>
		</div>
	</header>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveSearch } from "@mdi/js";
import { mdiContentSave } from "@mdi/js";
import { mdiNumeric1Box } from "@mdi/js";
import Search from "./Search.vue";
import FilterRating from "./FilterRating.vue";
import FilterColor from "./FilterColor.vue";
import ToggleSidebar from "./ToggleSidebar.vue";
import DisplaySetting from "./DisplaySetting.vue";
import Logo from "./Logo.vue";
import BtnOpenLibrary from "./BtnOpenLibrary.vue";

export default {
	components: {
		SvgIcon,
		Search,
		FilterRating,
		FilterColor,
		DisplaySetting,
		ToggleSidebar,
		Logo,
		BtnOpenLibrary,
	},
	data() {
		return {
			iconOpenLib: mdiArchiveSearch,
			iconToggleMarkers: mdiNumeric1Box,
		};
	},
	computed: {
		pathToLibrary() {
			return this.$store.getters.libraryPath;
		},
	},
	methods: {
		toggleMarkers() {
			this.$store.commit(
				"setShowMarkers",
				!this.$store.state.showMarkers
			);
		},
	},
};
</script>
