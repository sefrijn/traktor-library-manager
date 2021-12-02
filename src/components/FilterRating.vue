<template>
	<div class="flex h-9 bg-black-medium pl-2 items-center relative">
		<p
			class="absolute filter-label left-0 bottom-full uppercase w-full font-medium text-gray-dark text-xxs whitespace-nowrap overflow-hidden overflow-ellipsis"
			v-if="rating > 0"
		>
			filter by intensity
		</p>

		<div class="rating flex items-center">
			<span
				v-for="star in rating"
				@click="filter"
				:star="star"
				class="-mt-0.5 cursor-pointer"
			>
				<svg-icon
					class="pointer-events-none inline text-active-orange"
					type="mdi"
					:path="iconStar"
					size="17"
				></svg-icon>
			</span>
			<span
				v-for="star in 5 - rating"
				@click="filter"
				:star="star + rating"
				class="-mt-0.5 cursor-pointer"
			>
				<svg-icon
					class="pointer-events-none inline text-white opacity-20"
					type="mdi"
					:path="iconStar"
					size="17"
				></svg-icon>
			</span>
		</div>

		<button
			@click="filter"
			:star="0"
			class="h-9 w-9 ml-1 block flex justify-center items-center cursor-pointer hover:bg-black-dark"
			:class="{ 'pointer-events-none': rating == 0 }"
			v-tooltip="'Clear'"
		>
			<svg-icon
				class="pointer-events-none"
				:class="{ 'text-black-light': rating == 0 }"
				type="mdi"
				:path="iconCancel"
			></svg-icon>
		</button>
	</div>
</template>

<style>
div:hover > .filter-label {
	display: block;
}
</style>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiStar } from "@mdi/js";
import { mdiClose } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconStar: mdiStar,
			iconCancel: mdiClose,
		};
	},
	computed: {
		rating() {
			return this.$store.state.filter.rating;
		},
	},
	methods: {
		filter(e) {
			let value = {};
			value.rating = parseInt(e.target.attributes.star.nodeValue);
			value.color = this.$store.state.filter.color;
			this.$store.commit("setFilter", value);
		},
	},
};
</script>
