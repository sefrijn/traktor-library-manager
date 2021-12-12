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
					<svg
						v-if="spotifyGenres.includes(genre)"
						style="width:14px;height:14px"
						viewBox="0 0 24 24"
					>
						<path
							fill="currentColor"
							d="M17.9,10.9C14.7,9 9.35,8.8 6.3,9.75C5.8,9.9 5.3,9.6 5.15,9.15C5,8.65 5.3,8.15 5.75,8C9.3,6.95 15.15,7.15 18.85,9.35C19.3,9.6 19.45,10.2 19.2,10.65C18.95,11 18.35,11.15 17.9,10.9M17.8,13.7C17.55,14.05 17.1,14.2 16.75,13.95C14.05,12.3 9.95,11.8 6.8,12.8C6.4,12.9 5.95,12.7 5.85,12.3C5.75,11.9 5.95,11.45 6.35,11.35C10,10.25 14.5,10.8 17.6,12.7C17.9,12.85 18.05,13.35 17.8,13.7M16.6,16.45C16.4,16.75 16.05,16.85 15.75,16.65C13.4,15.2 10.45,14.9 6.95,15.7C6.6,15.8 6.3,15.55 6.2,15.25C6.1,14.9 6.35,14.6 6.65,14.5C10.45,13.65 13.75,14 16.35,15.6C16.7,15.75 16.75,16.15 16.6,16.45M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
						/>
					</svg>
				</li>
			</ul>
		</div>
	</div>
</template>

<script>
import spotifySuggestions from "./../../mixins/SpotifySuggestions.js";

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_ENTER = 13;

export default {
	data() {
		return {
			text: "",
			value: "",
			width: "",
			height: "",
			autocompleteSelected: -1,
			// spotifyGenres: [],
			// apiDone: false,
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
		// capitalize(str, lower = false) {
		// 	return (lower
		// 		? str.toLowerCase()
		// 		: str
		// 	).replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
		// },
	},
	created() {
		// let self = this;
		// window.ipcRenderer.send("spotifyGenres", [
		// 	this.params.data.artist,
		// 	this.params.data.title,
		// ]);

		// window.ipcRenderer.receive("spotifyGenres", function(message) {
		// 	console.log(message);
		// 	if (message) {
		// 		if (message.genres.length > 0) {
		// 			self.spotifyGenres = message.genres.map(function(genre) {
		// 				return self.capitalize(genre);
		// 			});
		// 			return;
		// 		}
		// 	}
		// 	self.apiDone = true;
		// });
		this.value = this.params.value;
		this.width = this.params.column.actualWidth + "px";
		this.height = this.params.node.rowHeight + "px";
	},
	mounted() {
		this.$nextTick(() => {
			this.$refs.input.select();
		});
	},
	// beforeUnmount() {
	// 	console.log("remove IPC listener");
	// 	window.ipcRenderer.removeListener("spotifyGenres");
	// },
};
</script>
