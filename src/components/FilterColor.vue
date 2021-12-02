<template>
	<div class="flex h-9 bg-black-medium pl-3 items-center relative">
		<p
			class="filter-label absolute left-0 bottom-full uppercase w-full py-0 font-medium text-gray-dark text-xxs whitespace-nowrap overflow-hidden overflow-ellipsis"
			v-if="color > 0"
		>
			filter by color
		</p>

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
		<button
			@click="filter"
			:color="0"
			class="h-9 w-9 ml-1 block flex justify-center items-center cursor-pointer hover:bg-black-dark"
			:class="{ 'pointer-events-none': color == 0 }"
			v-tooltip="'Clear'"
		>
			<svg-icon
				class="pointer-events-none"
				:class="{ 'text-black-light': color == 0 }"
				type="mdi"
				:path="iconCancel"
			></svg-icon>
		</button>
	</div>
</template>

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
