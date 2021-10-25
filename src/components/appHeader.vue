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
				class="border border-r-0 border-black-medium hover:bg-black-medium flex justify-center items-center"
				style="height:35px; width:35px;"
				v-bind:class="{ active: isPlaying }"
			>
				<svg-icon type="mdi" :path="iconPlayPause"></svg-icon>
			</button>
			<div
				id="waveform"
				class="border border-black-medium"
				style="width:400px;height:35px;"
			></div>

			<button
				v-tooltip="{
					content: 'Open Traktor Library File',
					triggers: ['hover'],
					delay: { show: 400, hide: 300 },
				}"
				class="bg-black-dark text-gray-light px-5 py-2 hover:bg-black-medium"
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
import WaveSurfer from "wavesurfer.js";
let wavesurfer;

export default {
	components: {
		SvgIcon,
	},
	data() {
		return {
			isPlaying: false,
			iconOpenLib: mdiArchiveSearch,
			iconPlayPause: mdiPlay,
		};
	},
	methods: {
		togglePlayback() {
			wavesurfer.playPause();
			this.isPlaying = wavesurfer.isPlaying();
			console.log(this.isPlaying);
		},
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
		// if (!typeof window.ipcRenderer.receive === "function") {
		window.ipcRenderer.receive("sendAudioBlob", function(message) {
			// console.log(message);
			var blob = new window.Blob([message]);
			wavesurfer.stop();
			wavesurfer.empty();
			wavesurfer.loadBlob(blob);
		});
		// }

		wavesurfer.on("ready", function() {
			console.log("ready");

			wavesurfer.play();
			self.isPlaying = true;
		});
	},
};
</script>
