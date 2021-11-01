<template>
	<div class="flex relative mx-1.5">
		<p
			v-if="artist"
			class="absolute top-full w-full pt-2 text-gray-dark text-xs"
		>
			{{ artist }} - {{ title }}
		</p>

		<img v-if="artist" :src="image" class="h-9 w-9" alt="" />
		<button
			@click="togglePlayback"
			class="h-9 w-9 flex justify-center items-center"
			v-bind:class="{ active: isPlaying }"
		>
			<svg-icon type="mdi" :path="iconPlayPause"></svg-icon>
		</button>
		<div
			id="waveform"
			ref="waveform"
			class="h-9 relative bg-black-dark"
			style="width:400px;"
		>
			<div class="absolute w-full h-full flex justify-center items-end">
				<scale-loader
					:color="color"
					:height="height"
					:width="width"
					:loading="loading"
				></scale-loader>
			</div>
		</div>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiPlay } from "@mdi/js";
import ScaleLoader from "vue-spinner/src/ScaleLoader.vue";
import WaveSurfer from "wavesurfer.js";
let wavesurfer;

export default {
	components: {
		SvgIcon,
		ScaleLoader,
	},
	data() {
		return {
			isPlaying: false,
			iconPlayPause: mdiPlay,
			color: "#969696",
			height: "18px", // scale loader
			width: "5px", // scale loader
		};
	},
	computed: {
		artist() {
			return this.$store.state.trackPlaying.artist;
		},
		title() {
			return this.$store.state.trackPlaying.title;
		},
		image() {
			return this.$store.state.trackPlaying.image
				? "local-resource://coverart/400/" +
						this.$store.state.trackPlaying.image
				: null;
		},
		loading() {
			return this.$store.state.loading;
		},
	},
	methods: {
		togglePlayback() {
			wavesurfer.playPause();
			this.isPlaying = wavesurfer.isPlaying();
		},
		emptyWavesurfer() {
			wavesurfer.stop();
			wavesurfer.empty();
		},
		createWavesurfer() {
			wavesurfer = WaveSurfer.create({
				container: this.$refs.waveform,
				waveColor: "#d30",
				progressColor: "#900",
				cursorColor: "#ddd",
				barWidth: 2,
				height: 36,
				mediaControls: true,
			});
		},
	},
	beforeUnmount() {
		// Destroy and reset wavesurfer for hot reload
		wavesurfer.empty();
		wavesurfer.destroy();
		this.createWavesurfer();
	},
	mounted() {
		let self = this;
		this.createWavesurfer();

		window.ipcRenderer.receive("loadAudio", function(message) {
			// self.$store.commit("setTrue");
			self.emptyWavesurfer();
			var blob = new window.Blob([message]);
			wavesurfer.loadBlob(blob);
			console.log("load audio file");
		});
		wavesurfer.on("ready", function() {
			// self.$store.commit("setFalse");
			self.$store.commit("setLoading", false);
			wavesurfer.play();
			self.isPlaying = true;
		});
	},
};
</script>
