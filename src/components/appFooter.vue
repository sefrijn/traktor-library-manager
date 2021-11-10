<template>
	<footer
		class="px-2 flex justify-between font-medium text-xxs text-gray-dark bg-black-light"
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
		<div class="flex justify-center items-center space-x-6">
			<div
				v-if="isSaving"
				class="mt-1 flex justify-center items-start space-x-1"
			>
				<clip-loader
					:loading="isSaving"
					color="#f3980c"
					size="13px"
				></clip-loader>
				<p class="animate-pulse">Autosaving Library</p>
			</div>
			<span>Selected NML library file: {{ path }}</span>
			<span>{{ total }} songs</span>
		</div>
	</footer>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArrowCollapseLeft } from "@mdi/js";
import { mdiArrowExpandRight } from "@mdi/js";
import ClipLoader from "vue-spinner/src/ClipLoader.vue";

export default {
	components: {
		SvgIcon,
		ClipLoader,
	},
	props: ["path", "total"],
	data() {
		return {
			iconCloseSidebar: mdiArrowCollapseLeft,
			iconOpenSidebar: mdiArrowExpandRight,
		};
	},
	computed: {
		isSaving() {
			return this.$store.state.saving;
		},
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
