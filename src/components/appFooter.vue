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
			class="h-5 flex justify-center items-center space-x-6 text-right"
		>
			<div>
				<p class="uppercase">status</p>
				<div class="text-white relative flex space-x-2">
					<clip-loader
						class="h-2"
						:loading="isSaving || isStartingUp"
						color="#f3980c"
						size="13px"
					></clip-loader>
					<p
						:class="{
							'animate-pulse-fast':
								isSaving || isStartingUp || clipboardMessage,
						}"
					>
						{{ status }}
					</p>
				</div>
			</div>
			<div>
				<p class="uppercase">active</p>
				<p class="text-white">{{ filteredSongs }}</p>
			</div>
			<div>
				<p class="uppercase">library</p>
				<p class="text-white">{{ totalSongs }}</p>
			</div>
		</div>

		<div
			class="class-helper w-1/4 w-1/5 w-1/6 w-1/7 w-1/8 w-1/9 w-1/10 hover:bg-active hidden"
		></div>
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
		status() {
			return this.$store.getters.status;
		},
		pathToLibrary() {
			return this.$store.getters.libraryPath;
		},
		isSaving() {
			return this.$store.getters.saving;
		},
		isSavingEnabled() {
			return this.$store.getters.savingEnabled;
		},
		isStartingUp() {
			return this.$store.getters.startingUp;
		},
		clipboardMessage() {
			return this.$store.getters.clipboardMessage;
		},
	},
	watch: {
		isSaving(newval, oldval) {
			this.updateStatus();
		},
		isSavingEnabled(newval, oldval) {
			this.updateStatus();
		},
		isStartingUp(newval, oldval) {
			this.updateStatus();
		},
		clipboardMessage(newval, oldval) {
			this.updateStatus();
		},
	},
	methods: {
		updateStatus() {
			if (!this.isSaving && this.isSavingEnabled) {
				this.$store.commit("setStatus", "Ready");
			}
			if (!this.isSaving && !this.isSavingEnabled && !this.isStartingUp) {
				this.$store.commit(
					"setStatus",
					"Saving disabled, close Traktor"
				);
			}
			if (!this.isSaving && !this.isSavingEnabled && this.isStartingUp) {
				this.$store.commit("setStatus", "Starting Up...");
			}
			if (!this.isSaving && this.clipboardMessage) {
				this.$store.commit("setStatus", "Track copied to clipboard!");
			}
			if (this.isSaving) {
				this.$store.commit("setStatus", "Autosaving Library");
			}
		},
	},
	mounted() {
		let self = this;
		window.ipcRenderer.receive("traktorOpen", function(traktorOpen) {
			// Initial check Traktor Open. Ready to save if Traktor is closed.
			if (self.$store.getters.startingUp) {
				console.log("Ready to save");
				self.$store.commit("setStartingUp", false);
			}

			// If Traktor is open (= true), saving is NOT enabled (= false), so invert variable
			self.$store.commit("setSavingEnabled", !traktorOpen);
		});
	},
};
</script>
