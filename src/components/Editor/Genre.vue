<template>
	<div class="ring-0 ring-offset-0" :style="{ width: width }">
		<div class="relative">
			<input
				ref="input"
				v-model="value"
				type="text"
				class="text-xs font-semibold w-full bg-transparent text-white border-none"
				:style="{ height: height }"
				@keydown="onKeyDown"
			/>
		</div>
		<div class="max-h-60 overflow-scroll">
			<p
				v-if="spotifyGenres.length == 0 && !apiDone"
				class="px-3 py-1 animate-pulse-fast text-green-200 text-opacity-80"
			>
				Getting suggestions...
			</p>
			<ul
				v-if="genres.length > 0 && genres[0] !== value"
				class="text-white text-opacity-80 font-semibold"
			>
				<li
					v-for="(genre, index) in genres"
					:class="{
						active: index == autocompleteSelected,
						'text-green-300': spotifyGenres.includes(genre),
					}"
					class="pl-3 pr-1.5 py-1 cursor-pointer flex justify-between"
					@mouseenter="hoverGenre(index)"
					@click="selectGenre(index)"
				>
					<span>{{ genre }}</span>
					<svg-icon
						v-if="spotifyGenres.includes(genre)"
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

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			text: "",
			value: "",
			width: "",
			height: "",
			autocompleteSelected: -1,
			iconSpotify: mdiSpotify,
		};
	},
	mixins: [spotifySuggestions],
	computed: {
		genres() {
			return [...this.spotifyGenres, ...this.$store.state.genres].filter(
				(genre) => {
					if (this.value) {
						return genre
							.toLowerCase()
							.includes(this.value.toLowerCase());
					} else {
						return true;
					}
				}
			);
		},
	},
	methods: {
		// Returns edit value to grid
		getValue() {
			return this.value;
		},
		// Set this editor to popup
		isPopup() {
			return true;
		},
		hoverGenre(index) {
			this.autocompleteSelected = index;
		},
		selectGenre(index) {
			if (index >= 0) {
				this.value = this.genres[index];
			}
			this.autocompleteSelected = -1;
			this.$nextTick(() => {
				this.$refs.input.focus();
			});
		},
		onKeyDown(event) {
			const keyCode = event.keyCode;
			if (
				keyCode === KEY_ENTER &&
				this.autocompleteSelected >= 0 &&
				this.genres[0] !== this.value
			) {
				event.preventDefault();
				event.stopPropagation();
				this.value = this.genres[this.autocompleteSelected];
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
		this.value = this.params.value;
		this.width = this.params.column.actualWidth + "px";
		this.height = this.params.node.rowHeight + "px";
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.input.select();
		});
	},
};
</script>
