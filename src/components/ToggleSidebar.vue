<template>
	<button
		v-tooltip="'Show Sidebar'"
		class="mr-1.5 flex justify-center items-center h-9 w-9"
		@click="sidebar = !sidebar"
		:class="{ active: sidebar }"
	>
		<svg-icon type="mdi" :path="iconToggleSidebar" size="18"></svg-icon>
	</button>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArrowCollapseLeft } from "@mdi/js";
import { mdiArrowExpandRight } from "@mdi/js";
import { mdiFileTree } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconToggleSidebar: mdiFileTree,
		};
	},
	computed: {
		sidebar: {
			get() {
				return this.$store.getters.sidebar;
			},
			set(value) {
				this.$store.commit("showSidebar", value);
			},
		},
	},
};
</script>
