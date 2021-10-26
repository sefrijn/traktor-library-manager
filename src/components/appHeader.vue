<template>
	<header
		class="bg-black-light border-b border-black-medium flex justify-between items-center px-4"
	>
		<div class="flex justify-center items-center space-x-2">
			<img
				class="w-auto"
				style="height:20px;"
				src="./../assets/traktor_logo.png"
				alt=""
			/>
			<p class="text-gray">Library Manager</p>
		</div>

		<div class="flex">
			<button
				@click="togglePlayback"
				class="border border-r-0 border-black-medium flex justify-center items-center"
				style="height:35px; width:35px;"
				v-bind:class="{ active: isPlaying }"
			>
				<svg-icon type="mdi" :path="iconPlayPause"></svg-icon>
			</button>
			<div
				id="waveform"
				class="relative border border-black-medium"
				style="width:400px;height:35px;"
			>
				<div
					class="absolute w-full h-full flex justify-center items-end"
				>
					<scale-loader
						:color="color"
						:height="height"
						:width="width"
						:loading="loading"
					></scale-loader>
				</div>
			</div>

			<button
				v-tooltip="{
					content: 'Open Traktor Library File',
					triggers: ['hover'],
					delay: { show: 400, hide: 300 },
				}"
				class="px-5 py-2"
				style="height:35px;"
				@click="$emit('load')"
			>
				<svg-icon type="mdi" :path="iconOpenLib" size="18"></svg-icon>
			</button>
		</div>
	</header>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveSearch } from "@mdi/js";
import { mdiPlay } from "@mdi/js";
import ScaleLoader from "vue-spinner/src/ScaleLoader.vue";
import WaveSurfer from "wavesurfer.js";
let wavesurfer;

export default {
	components: {
		SvgIcon,
		ScaleLoader,
	},
	props: {
		clearWavesurfer: Boolean,
	},
	data() {
		return {
			isPlaying: false,
			iconOpenLib: mdiArchiveSearch,
			iconPlayPause: mdiPlay,
			color: "#969696",
			height: "18px",
			width: "5px",
		};
	},
	computed: {
		loading() {
			return this.$store.state.loading;
		},
	},
	methods: {
		togglePlayback() {
			wavesurfer.playPause();
			this.isPlaying = wavesurfer.isPlaying();
			console.log(this.isPlaying);
		},
		emptyWavesurfer() {
			wavesurfer.stop();
			wavesurfer.empty();
		},
	},
	beforeUnmount() {
		// Destroy and reset wavesurfer for hot reload
		wavesurfer.destroy();
		wavesurfer = WaveSurfer.create({
			container: "#waveform",
			waveColor: "#d30",
			progressColor: "#900",
			cursorColor: "#ddd",
			barWidth: 2,
			height: 35,
			mediaControls: true,
		});
	},
	mounted() {
		let self = this;
		wavesurfer = WaveSurfer.create({
			container: "#waveform",
			waveColor: "#d30",
			progressColor: "#900",
			cursorColor: "#ddd",
			barWidth: 2,
			height: 35,
			mediaControls: true,
		});
		window.ipcRenderer.receive("sendAudioBlob", function(message) {
			var blob = new window.Blob([message]);
			wavesurfer.loadBlob(blob);
		});

		wavesurfer.on("ready", function() {
			console.log("ready");
			self.$store.commit("setFalse");
			console.log(self.$store.state);

			wavesurfer.play();
			self.isPlaying = true;
		});
	},
};
</script>
