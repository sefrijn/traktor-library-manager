<template>
	<div class="search relative mx-1.5 flex bg-black-medium">
		<p
			v-if="text"
			class="absolute bottom-full uppercase w-full py-1 font-medium text-gray-dark text-xxs"
		>
			Filtering by
		</p>

		<input
			type="text"
			placeholder="Search"
			class="h-9 w-48 border-none bg-black-medium hover:bg-black-dark focus:outline-none focus:ring-0 focus:bg-black-dark"
			@input="searching($event)"
			v-model="text"
		/>
		<button
			v-if="query"
			@click="clear"
			class="h-9 w-9 block flex justify-center items-center cursor-pointer hover:bg-black-dark"
			v-tooltip="'Clear'"
		>
			<svg-icon type="mdi" :path="iconClear"></svg-icon>
		</button>

		<button
			v-if="!query"
			class="h-9 w-9 block flex justify-center items-center"
		>
			<svg-icon v-if="!query" type="mdi" :path="iconSearch"></svg-icon>
		</button>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiMagnify } from "@mdi/js";
import { mdiClose } from "@mdi/js";

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconSearch: mdiMagnify,
			iconClear: mdiClose,
			text: "",
		};
	},
	computed: {
		query() {
			return this.$store.state.query;
		},
	},
	methods: {
		searching(event) {
			console.log(this.text);
			this.$store.commit("setQuery", this.text);
		},
		clear() {
			this.text = "";
			this.$store.commit("setQuery", "");
		},
	},
};
</script>
