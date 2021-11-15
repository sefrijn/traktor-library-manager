<template>
	<div class="ring-0 ring-offset-0" :style="{ width: width }">
		<div class="relative flex flex-wrap items-center pl-3 pr-1 pt-1">
			<div class="bg-active mr-1 py-1 px-2 rounded" v-for="tag in tags">
				{{ tag }}
			</div>
			<div
				contenteditable
				role="textbox"
				ref="input"
				@input="onInput"
				type="text"
				class="font-xs w-auto py-1 pl-0 pr-2 m-0 text-sm flex-grow bg-transparent text-white border-none"
				@keydown="onKeyDown"
			>
				{{ value }}
			</div>
			<div
				v-if="value"
				@click="clear"
				class="h-full w-8 text-white absolute right-0 top-0 block flex justify-center items-center cursor-pointer hover:bg-active"
			>
				<svg-icon type="mdi" :path="iconClear" size="15"></svg-icon>
			</div>
		</div>
		<ul
			v-if="genres.length > 0 && genres[0] !== value"
			class="text-white text-opacity-40 max-h-40 overflow-scroll"
		>
			<li
				class="px-3 py-1 cursor-pointer"
				v-for="(genre, index) in genres"
				:class="{ active: index == autocompleteSelected }"
				@mouseenter="hoverGenre(index)"
				@click="selectGenre(index)"
			>
				{{ genre }}
			</li>
		</ul>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiClose } from "@mdi/js";

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ENTER = 13;
const KEY_BACKSPACE = 8;

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			iconClear: mdiClose,
			text: "",
			value: "",
			tags: [],
			width: "",
			height: "",
			autocompleteSelected: -1,
		};
	},
	computed: {
		genres() {
			return this.$store.state.genres.filter((genre) => {
				return genre.toLowerCase().includes(this.value.toLowerCase());
			});
		},
	},
	methods: {
		// Returns edit value to grid
		getValue() {
			return this.tags.join(", ");
		},
		// Set this editor to popup
		isPopup() {
			return true;
		},
		hoverGenre(index) {
			// console.log(index);
			this.autocompleteSelected = index;
		},
		selectGenre(index) {
			this.value = this.genres[index];
			this.autocompleteSelected = -1;
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
		clear() {
			this.value = "";
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
		onInput(e) {
			console.log(e.target.innerText);
			this.value = e.target.innerText;
		},
		onKeyDown(event) {
			const keyCode = event.keyCode;
			if (keyCode === KEY_BACKSPACE) {
				console.log("backspace");
				if (this.value.length == 0) {
					console.log("select previous tag: ");
				}
			}
			if (
				keyCode === KEY_ENTER &&
				this.value.length > 0 &&
				this.autocompleteSelected == -1
			) {
				event.preventDefault();
				event.stopPropagation();
				this.tags.push(this.value);
				this.value = "";
				console.log("add tag");
			}
			if (
				keyCode === KEY_ENTER &&
				this.autocompleteSelected >= 0 &&
				this.genres[0] !== this.value
			) {
				event.preventDefault();
				event.stopPropagation();
				this.value = this.genres[this.autocompleteSelected];
				console.log("set to autocomplete value");
				this.autocompleteSelected = -1;
			}
			if (keyCode === KEY_DOWN) {
				event.preventDefault();
				if (this.autocompleteSelected >= this.genres.length - 1) {
					this.autocompleteSelected = -1;
				} else {
					this.autocompleteSelected++;
				}
			}
			if (keyCode === KEY_UP) {
				event.preventDefault();
				if (this.autocompleteSelected >= 0) {
					this.autocompleteSelected--;
				} else {
					this.autocompleteSelected = this.genres.length - 1;
				}
			}
			if (this.autocompleteSelected >= this.genres.length) {
				this.autocompleteSelected = -1;
			}
		},
	},
	created() {
		this.tags = this.params.value.split(/[;,]+/).map((item) => item.trim());
		console.log(this.tags);

		this.width = this.params.column.actualWidth + "px";
		this.height = this.params.node.rowHeight + "px";
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.input.focus();
		});
	},
};
</script>
