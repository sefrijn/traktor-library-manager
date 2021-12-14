<template>
	<div class="ring-0 ring-offset-0" :style="{ width: width }">
		<div class="relative flex flex-wrap items-center pl-3 pr-1 pt-1">
			<div
				class="bg-active mb-1 mr-1 py-1 px-2 rounded cursor-pointer hover:bg-active-orange hover:line-through"
				:class="{ 'clear-tag': tagSelect && index == tags.length - 1 }"
				@click="deleteTag(index)"
				v-for="(tag, index) in tags"
			>
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
		</div>

		<div class="max-h-60 overflow-scroll">
			<p
				v-if="spotifyGenres.length == 0 && !apiDone"
				class="px-3 py-1 animate-pulse-fast text-green-200 text-opacity-80"
			>
				Getting suggestions...
			</p>
			<ul
				v-if="
					tagsAutocomplete.length > 0 && tagsAutocomplete[0] !== value
				"
				class="text-white text-opacity-80 font-semibold"
			>
				<li
					v-for="(tag, index) in tagsAutocomplete"
					:class="{
						active: index == autocompleteSelected,
						'text-green-300': spotifyGenres.includes(tag),
					}"
					class="pl-3 pr-1.5 py-1 cursor-pointer flex justify-between"
					@mouseenter="hoverTag(index)"
					@click="selectTag(index)"
				>
					<span>{{ tag }}</span>
					<svg-icon
						v-if="spotifyGenres.includes(tag)"
						type="mdi"
						:path="iconSpotify"
						size="14"
					></svg-icon>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import spotifySuggestions from "./../../mixins/SpotifySuggestions.js";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiSpotify } from "@mdi/js";

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ENTER = 13;
const KEY_BACKSPACE = 8;
const KEY_ESCAPE = 27;

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			text: "",
			value: "",
			tags: [],
			width: "",
			height: "",
			tagSelect: false,
			autocompleteSelected: -1,
			iconSpotify: mdiSpotify,
		};
	},
	mixins: [spotifySuggestions],
	computed: {
		tagsAutocomplete() {
			return [...this.spotifyGenres, ...this.$store.state.tags].filter(
				(tag) => {
					return tag.toLowerCase().includes(this.value.toLowerCase());
				}
			);
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
		hoverTag(index) {
			this.autocompleteSelected = index;
		},
		selectTag(index) {
			this.value = "";
			this.tags.push(this.tagsAutocomplete[index]);
			this.autocompleteSelected = -1;
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
		deleteTag(index) {
			this.tags.splice(index, 1);
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
		onInput(e) {
			console.log(e.target.innerText);
			this.value = e.target.innerText;
			console.log(this.tagsAutocomplete.length);
			if (this.tagsAutocomplete.length == 0) {
				this.autocompleteSelected = -1;
			}
		},
		onKeyDown(event) {
			const keyCode = event.keyCode;
			if (keyCode === KEY_BACKSPACE) {
				if (this.tagSelect == true) {
					this.tags.pop();
					this.tagSelect = false;
					return;
				}
				if (this.value.length == 0) {
					this.tagSelect = true;
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
			}
			if (
				keyCode === KEY_ENTER &&
				this.autocompleteSelected >= 0 &&
				this.tagsAutocomplete[0] !== this.value
			) {
				event.preventDefault();
				event.stopPropagation();
				this.tags.push(
					this.tagsAutocomplete[this.autocompleteSelected]
				);
				this.value = "";
				this.autocompleteSelected = -1;
			}
			if (keyCode === KEY_DOWN) {
				event.preventDefault();
				if (
					this.autocompleteSelected >=
					this.tagsAutocomplete.length - 1
				) {
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
					this.autocompleteSelected =
						this.tagsAutocomplete.length - 1;
				}
			}
			if (keyCode === KEY_ESCAPE && this.autocompleteSelected >= 0) {
				event.preventDefault();
				event.stopPropagation();
				this.autocompleteSelected = -1;
			}
			if (this.autocompleteSelected >= this.tagsAutocomplete.length) {
				this.autocompleteSelected = -1;
			}
		},
	},
	created() {
		if (this.params.value) {
			this.tags = this.params.value
				.split(/[;,]+/)
				.map((item) => item.trim());
		}

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
