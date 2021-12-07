<template>
	<div class="flex items-center relative border border-black bg-black-medium">
		<button
			@click="togglePlayback"
			class="h-14 w-14 flex justify-center items-center border-r border-black"
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
			v-if="progress"
			class="px-2 uppercase font-medium font-mono text-gray-dark text-xs"
		>
			<span>{{ duration }}</span
			><br />
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
			class="text-white text-xs whitespace-nowrap overflow-hidden overflow-ellipsis"
			style="max-width:calc(100vw - 900px)"
		>
			{{ artist }} - {{ title }}
		</p>
	</div>
</template>

<style lang="scss">
@import "../css/colors";
#waveform > wave {
	overflow: visible !important;
}
#waveform:hover > wave > wave {
	border-right-color: $traktor-active !important;
	// @apply border-active;
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
import ScaleLoader from "vue-spinner/src/ScaleLoader.vue";
import WaveSurfer from "wavesurfer.js";
import MarkersPlugin from "wavesurfer.js/dist/plugin/wavesurfer.markers.min.js";
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
			color: "#343434",
			height: "18px", // scale loader
			width: "5px", // scale loader
			duration: null,
			progress: null,
			showCues: false,
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
				? "local-resource://coverart/400/" +
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
				// barWidth: 2,
				height: 56,
				mediaControls: true,
				plugins: [MarkersPlugin.create()],
			});
		},
		fancyTimeFormat(duration) {
			// Hours, minutes and seconds
			var hrs = ~~(duration / 3600);
			var mins = ~~((duration % 3600) / 60);
			var secs = ~~duration % 60;

			// Output like "1:01" or "4:03:59" or "123:03:59"
			var ret = "";

			if (hrs > 0) {
				ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
			}

			ret += "" + mins + ":" + (secs < 10 ? "0" : "");
			ret += "" + secs;
			return ret;
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
		let self = this;
		this.createWavesurfer();

		window.ipcRenderer.receive("loadAudio", function(message) {
			self.emptyWavesurfer();
			var blob = new window.Blob([message]);
			wavesurfer.loadBlob(blob);
			console.log("load audio file");
		});
		wavesurfer.on("audioprocess", function() {
			self.progress = self.fancyTimeFormat(
				wavesurfer.backend.getCurrentTime()
			);
		});
		wavesurfer.on("finish", function() {
			self.isPlaying = wavesurfer.isPlaying();
			wavesurfer.stop();
		});
		wavesurfer.on("ready", function() {
			let cue_points = self.$store.state.trackPlaying.cue_points;
			for (const [key, cue] of Object.entries(cue_points)) {
				wavesurfer.addMarker({
					time: cue["$"]["START"] / 1000,
					label: cue["$"]["HOTCUE"],
					color: "#2e91a7",
					position: "top",
				});
			}
			self.duration = self.fancyTimeFormat(
				wavesurfer.backend.getDuration()
			);
			self.progress = self.fancyTimeFormat(0);
			self.$store.commit("setLoading", false);
			wavesurfer.play();
			self.isPlaying = true;
		});
	},
};
</script>
