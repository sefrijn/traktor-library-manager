<template>
	<div class="flex h-9 bg-black-medium px-3 items-center relative">
		<p
			class="filter-label hidden absolute left-0 bottom-full uppercase w-full py-1 font-medium text-gray-dark text-xxs whitespace-nowrap overflow-hidden overflow-ellipsis"
		>
			filter by color
		</p>

		<div
			v-if="color > 0"
			@click="filter"
			:color="0"
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

		<div class="flex space-x-1">
			<div
				v-for="index in 7"
				:color="index"
				@click="filter"
				class="flex items-center justify-center cursor-pointer color-dot"
				:class="{ 'active-color': color == index }"
			>
				<div
					class="h-3 w-3 rounded-full transition-transform pointer-events-none"
					:class="[
						`color-${index}`,
						{
							'transform scale-125 shadow-black': color == index,
						},
					]"
				></div>
			</div>
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
import { mdiClose } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconCancel: mdiClose,
		};
	},
	computed: {
		color() {
			return this.$store.state.filter.color;
		},
	},
	methods: {
		filter(e) {
			let value = {};
			value.color = parseInt(e.target.attributes.color.nodeValue);
			value.rating = this.$store.state.filter.rating;
			this.$store.commit("setFilter", value);
		},
	},
};
</script>
