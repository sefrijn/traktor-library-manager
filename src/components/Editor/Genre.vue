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
		};
	},
	computed: {
		genres() {
			return this.$store.state.genres.filter((genre) => {
				if (this.value) {
					return genre
						.toLowerCase()
						.includes(this.value.toLowerCase());
				} else {
					return true;
				}
			});
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
			this.value = this.genres[index];
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
