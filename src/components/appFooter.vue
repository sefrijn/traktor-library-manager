<template>
	<footer
		class="px-2 flex justify-between font-medium text-xxs text-gray-dark bg-black-light"
	>
		<div class="flex items-center space-x-6">
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
			<div class="flex">
				<p class="uppercase mr-2">Filter by rating</p>
				<div
					@click="filter"
					:star="0"
					v-tooltip="'Clear Filter'"
					class="clear-rating-filter mr-2 cursor-pointer text-white opacity-20 hover:opacity-100 hover:text-active-orange"
				>
					<svg-icon
						class="pointer-events-none inline"
						type="mdi"
						:path="iconStarNone"
						size="13"
					></svg-icon>
				</div>
				<div class="rating flex">
					<span
						v-for="star in stars"
						@click="filter"
						:star="star"
						class="cursor-pointer"
					>
						<svg-icon
							class="pointer-events-none inline text-active-orange"
							type="mdi"
							:path="iconStar"
							size="13"
						></svg-icon>
					</span>
					<span
						v-for="star in 5 - stars"
						@click="filter"
						:star="star + stars"
						class="cursor-pointer"
					>
						<svg-icon
							class="pointer-events-none inline text-white opacity-20"
							type="mdi"
							:path="iconStar"
							size="13"
						></svg-icon>
					</span>
				</div>
			</div>
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

<style lang="scss">
.clear-rating-filter:hover + div > span > svg {
	@apply text-white opacity-20;
}
</style>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArrowCollapseLeft } from "@mdi/js";
import { mdiArrowExpandRight } from "@mdi/js";
import { mdiStar } from "@mdi/js";
import { mdiClose } from "@mdi/js";
import ClipLoader from "vue-spinner/src/ClipLoader.vue";

export default {
	components: {
		SvgIcon,
		ClipLoader,
	},
	props: ["path", "total"],
	data() {
		return {
			iconStar: mdiStar,
			iconStarNone: mdiClose,
			iconCloseSidebar: mdiArrowCollapseLeft,
			iconOpenSidebar: mdiArrowExpandRight,
		};
	},
	computed: {
		stars() {
			return this.$store.state.filterRating;
		},
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
	methods: {
		filter(e) {
			let value = parseInt(e.target.attributes.star.nodeValue);
			this.$store.commit("setFilterRating", value);
		},
	},
};
</script>
