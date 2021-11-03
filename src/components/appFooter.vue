<template>
	<footer
		class="px-2 flex justify-between font-medium text-xxs text-gray bg-black-light"
	>
		<div>
			<button
				v-if="!sidebar"
				v-tooltip="'Show Sidebar'"
				class="mr-1.5 flex justify-center items-center h-7 w-7"
				@click="sidebar = true"
			>
				<svg-icon
					type="mdi"
					:path="iconOpenSidebar"
					size="18"
				></svg-icon>
			</button>
			<button
				v-if="sidebar"
				v-tooltip="'Hide Sidebar'"
				class="mr-1.5 flex justify-center items-center h-7 w-7"
				@click="sidebar = false"
			>
				<svg-icon
					type="mdi"
					:path="iconCloseSidebar"
					size="18"
				></svg-icon>
			</button>
		</div>
		<div class="flex space-x-4">
			<span>Selected NML library file: {{ path }}</span>
			<span>{{ total }} songs</span>
		</div>
	</footer>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArrowCollapseLeft } from "@mdi/js";
import { mdiArrowExpandRight } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	props: ["path", "total"],
	data() {
		return {
			iconCloseSidebar: mdiArrowCollapseLeft,
			iconOpenSidebar: mdiArrowExpandRight,
		};
	},
	computed: {
		sidebar: {
			get() {
				return this.$store.state.sidebar;
			},
			set(value) {
				this.$store.commit("showSidebar", value);
			},
		},
	},
	methods: {},
};
</script>
