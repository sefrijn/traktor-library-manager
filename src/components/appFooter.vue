<template>
	<footer
		class="px-2 flex justify-between font-medium text-xxs text-gray-dark bg-black-light"
	>
		<div
			class="flex items-center space-x-3"
			:class="{ 'pointer-events-none opacity-40': !pathToLibrary }"
		>
			<audio-player></audio-player>
		</div>

		<div
			v-if="pathToLibrary"
			class="h-5 flex justify-center items-center space-x-6"
		>
			<div
				v-if="isSaving"
				class="flex justify-center items-center space-x-1"
			>
				<clip-loader
					class="mt-0.5"
					:loading="isSaving"
					color="#f3980c"
					size="13px"
				></clip-loader>
				<p class="animate-pulse">Autosaving Library</p>
			</div>

			<div class="text-right">
				<p class="uppercase">active</p>
				<p class="text-white">{{ filteredSongs }}</p>
			</div>
			<div class="text-right">
				<p class="uppercase">library</p>
				<p class="text-white">{{ totalSongs }}</p>
			</div>
		</div>
	</footer>
</template>

<style lang="scss">
.clear-rating-filter:hover + div > span > svg {
	@apply text-white opacity-20;
}
</style>

<script>
import ClipLoader from "vue-spinner/src/ClipLoader.vue";
import AudioPlayer from "./AudioPlayer.vue";

export default {
	components: {
		ClipLoader,
		AudioPlayer,
	},
	props: ["totalSongs", "filteredSongs"],
	data() {
		return {};
	},
	computed: {
		pathToLibrary() {
			return this.$store.state.libraryPath;
		},

		isSaving() {
			return this.$store.state.saving;
		},
	},
	methods: {},
};
</script>
