<template>
	<header
		class="bg-black-light border-b border-black-medium flex justify-between items-center px-4"
	>
		<logo></logo>

		<div class="flex relative">
			<search></search>

			<audio-player></audio-player>

			<button
				v-tooltip="'Toggle Sidebar'"
				class="mx-1.5 flex justify-center items-center h-9 w-9"
				@click="$emit('toggleSidebar')"
			>
				<svg-icon
					type="mdi"
					:path="iconToggleSidebar"
					size="18"
				></svg-icon>
			</button>

			<button
				v-tooltip="'Open Traktor Library File'"
				class="mx-1.5 flex justify-center items-center h-9 w-9"
				@click="$emit('load')"
			>
				<svg-icon type="mdi" :path="iconOpenLib" size="18"></svg-icon>
			</button>

			<display-setting></display-setting>
		</div>
	</header>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveSearch } from "@mdi/js";
import { mdiArrowCollapseLeft } from "@mdi/js";
import Search from "./Search.vue";
import AudioPlayer from "./AudioPlayer.vue";
import DisplaySetting from "./DisplaySetting.vue";
import Logo from "./Logo.vue";

export default {
	components: {
		SvgIcon,
		Search,
		AudioPlayer,
		DisplaySetting,
		Logo,
	},
	data() {
		return {
			iconOpenLib: mdiArchiveSearch,
			iconToggleSidebar: mdiArrowCollapseLeft,
		};
	},
};
</script>
