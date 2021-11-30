<template>
	<div class="flex h-9 bg-black-medium px-2 items-center relative">
		<p
			class="hidden filter-label absolute left-0 bottom-full uppercase w-full py-1 font-medium text-gray-dark text-xxs whitespace-nowrap overflow-hidden overflow-ellipsis"
		>
			filter by intensity
		</p>
		<div
			v-if="rating > 0"
			@click="filter"
			:star="0"
			class="pt-1 absolute top-full left-0 clear-rating-filter mr-2 cursor-pointer text-gray hover:opacity-100 hover:text-active-orange flex items-center"
		>
			<svg-icon
				class="pointer-events-none inline"
				type="mdi"
				:path="iconCancel"
				size="13"
			></svg-icon>
			<span class="pointer-events-none uppercase text-xxs">Clear</span>
		</div>

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
