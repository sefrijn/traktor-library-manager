<template>
	<div class="flex items-center relative bg-black-dark shadow-black-lg">
		<button
			@click="togglePlayback"
			class="h-14 w-14 flex justify-center items-center"
			:class="{ active: isPlaying }"
		>
			<svg-icon type="mdi" :path="iconPlayPause" size="38"></svg-icon>
		</button>
		<div
			id="waveform"
			ref="waveform"
			class="cursor-pointer h-14 relative"
			:class="{ 'show-markers': showMarkers }"
			style="width:450px;"
		>
			<div
				class="absolute w-full h-full flex justify-center items-center"
			>
				<scale-loader
					:color="color"
					:height="height"
					:width="width"
					:loading="loading"
				></scale-loader>
			</div>
		</div>
		<div
			class="w-11 px-2 uppercase font-medium font-mono text-gray-dark text-xs flex flex-col items-center"
		>
			<span>{{ duration }}</span>
			<span class="text-white">{{ progress }}</span>
		</div>
		<img
			v-if="this.$store.state.trackPlaying.image && !sidebar"
			:src="image"
			class="h-14 w-14"
			alt=""
		/>
		<div
			v-if="!this.$store.state.trackPlaying.image && artist && !sidebar"
			class="h-14 w-14 bg-black-dark flex justify-center items-center font-bold text-gray-dark"
		>
			<span>?</span>
		</div>
		<div
			v-if="!this.$store.state.trackPlaying.image && !artist && !sidebar"
			class="h-14 w-14 bg-black-dark flex justify-center items-center text-gray-dark text-xxs"
			v-tooltip="'Load track to view waveform'"
		></div>
	</div>
	<div v-if="!sidebar" class="font-medium text-gray-dark">
		<p class="uppercase">now playing</p>
		<p
			class="text-gray-very-light text-xs whitespace-nowrap overflow-hidden overflow-ellipsis"
			style="max-width:230px"
		>
			{{ artist }}
		</p>
		<p
			class="text-white text-xs whitespace-nowrap overflow-hidden overflow-ellipsis"
			style="max-width:230px"
		>
			{{ title }}
		</p>
	</div>
	<button
		v-tooltip="'Toggle Audio'"
		class="flex justify-center items-center h-9 w-9"
		:class="{ active: muted }"
		@click="setmute"
	>
		<svg-icon v-if="muted" type="mdi" :path="iconMute" size="18"></svg-icon>
		<svg-icon
			v-if="!muted"
			type="mdi"
			:path="iconUnmute"
			size="18"
		></svg-icon>
	</button>

	<button
		v-tooltip="'Show Cuepoints'"
		class="flex justify-center items-center h-9 w-9"
		@click="toggleMarkers"
		:class="{ active: $store.getters.showMarkers }"
	>
		<svg-icon type="mdi" :path="iconToggleMarkers" size="18"></svg-icon>
	</button>

	<button
		@click="spotifyArtist"
		v-tooltip="'Open Artist in Spotify'"
		class="flex justify-center items-center h-9 w-9"
		:class="{
			'opacity-20 pointer-events-none': !$store.getters.spotifyArtist,
		}"
	>
		<svg-icon type="mdi" :path="iconInfo" size="18"></svg-icon>
	</button>
</template>

<style lang="scss">
@import "../css/colors";
#waveform > wave {
	overflow: visible !important;
}
.wavesurfer-marker svg {
	height: 15px !important;
	filter: drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.5));
	polygon {
		stroke-width: 0;
		stroke: transparent;
		// fill: #131313;
		@apply fill-current text-gray-dark;
		// box-shadow: inset 0 0 2px white;
	}
}
.wavesurfer-marker:hover svg polygon {
	fill: #007f93;
}
.wavesurfer-marker {
	display: none !important;
	bottom: 0px;
	span {
		position: absolute;
		z-index: 4;
		width: 11px;
		// display: none;
		margin-bottom: -5px;
		margin-top: -7px;
		pointer-events: none;
		font-size: 10px !important;
		@apply text-center text-black font-medium;
	}
}
#waveform.show-markers {
	.wavesurfer-marker {
		display: flex !important;
	}
}
</style>
<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiPlay } from "@mdi/js";
import { mdiVolumeHigh } from "@mdi/js";
import { mdiVolumeOff } from "@mdi/js";
import { mdiNumeric1Box } from "@mdi/js";
import { mdiSpotify } from "@mdi/js";
import ScaleLoader from "vue-spinner/src/ScaleLoader.vue";
import WaveSurfer from "wavesurfer.js";
import MarkersPlugin from "wavesurfer.js/dist/plugin/wavesurfer.markers.min.js";
import fancyTimeFormat from "./../mixins/FancyTimeFormat.js";

let wavesurfer;

export default {
	components: {
		SvgIcon,
		ScaleLoader,
	},
	mixins: [fancyTimeFormat],
	data() {
		return {
			iconMute: mdiVolumeOff,
			iconUnmute: mdiVolumeHigh,
			iconToggleMarkers: mdiNumeric1Box,
			iconInfo: mdiSpotify,
			isPlaying: false,
			iconPlayPause: mdiPlay,
			color: "#343434",
			height: "18px", // scale loader
			width: "5px", // scale loader
			duration: "0:00",
			progress: "0:00",
			showCues: false,
			muted: false,
		};
	},
	computed: {
		showMarkers() {
			return this.$store.getters.showMarkers;
		},
		artist() {
			return this.$store.state.trackPlaying.artist;
		},
		title() {
			return this.$store.state.trackPlaying.title;
		},
		image() {
			return this.$store.state.trackPlaying.image
				? "local-resource://coverart/200/" +
						this.$store.state.trackPlaying.image
				: null;
		},
		loading() {
			return this.$store.getters.loading;
		},
		sidebar() {
			return this.$store.getters.sidebar;
		},
	},
	methods: {
		spotifyArtist() {
			window.ipcRenderer.send("spotifyArtist", this.artist);
		},
		setmute() {
			this.muted = !this.muted;
			wavesurfer.setMute(this.muted);
		},
		toggleMarkers() {
			this.$store.commit(
				"setShowMarkers",
				!this.$store.getters.showMarkers
			);
		},
		togglePlayback() {
			wavesurfer.playPause();
			this.isPlaying = wavesurfer.isPlaying();
		},
		emptyWavesurfer() {
			wavesurfer.stop();
			wavesurfer.empty();
			wavesurfer.clearMarkers();
		},
		createWavesurfer() {
			wavesurfer = WaveSurfer.create({
				container: this.$refs.waveform,
				waveColor: "#d30",
				progressColor: "#65051D",
				cursorColor: "#ddd",
				cursorWidth: 2,
				height: 56,
				mediaControls: true,
				plugins: [MarkersPlugin.create()],
			});
		},
	},
	beforeUnmount() {
		// Destroy and reset wavesurfer for hot reload
		console.log("destroy wavesurfer");
		wavesurfer.empty();
		wavesurfer.destroy();
		this.createWavesurfer();
	},
	mounted() {
		this.createWavesurfer();

		window.ipcRenderer.receive("loadAudio", (message) => {
			this.emptyWavesurfer();
			var blob = new window.Blob([message]);
			wavesurfer.loadBlob(blob);
			console.log("load audio file");
		});

		window.ipcRenderer.receive("spotifyArtist", (message) => {
			this.$store.commit("setSpotifyArtist", message);
		});

		wavesurfer.on("audioprocess", () => {
			this.progress = this.fancyTimeFormat(
				wavesurfer.backend.getCurrentTime()
			);
		});
		wavesurfer.on("finish", () => {
			this.isPlaying = wavesurfer.isPlaying();
			wavesurfer.stop();
		});
		wavesurfer.on("ready", () => {
			let cue_points = this.$store.state.trackPlaying.cue_points;
			for (const [key, cue] of Object.entries(cue_points)) {
				wavesurfer.addMarker({
					time: cue["$"]["START"] / 1000,
					label: cue["$"]["HOTCUE"],
					color: "#2e91a7",
					position: "top",
				});
			}
			this.duration = this.fancyTimeFormat(
				wavesurfer.backend.getDuration()
			);
			this.progress = this.fancyTimeFormat(0);
			this.$store.commit("setLoading", false);
			wavesurfer.play();
			this.isPlaying = true;
		});
	},
};
</script>
