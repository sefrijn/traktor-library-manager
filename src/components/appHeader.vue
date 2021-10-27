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

		<div class="flex relative">
			<div class="flex relative mx-1.5">
				<p
					v-if="currentTrack"
					class="absolute top-full w-full pt-2 text-gray-dark text-xs"
				>
					{{ currentTrack }}
				</p>

				<img v-if="currentTrack" :src="src" class="h-9 w-9" alt="" />
				<button
					@click="togglePlayback"
					class="h-9 w-9 flex justify-center items-center"
					v-bind:class="{ active: isPlaying }"
				>
					<svg-icon type="mdi" :path="iconPlayPause"></svg-icon>
				</button>
				<div
					id="waveform"
					class="h-9 relative bg-black-dark"
					style="width:400px;"
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
			</div>

			<button
				v-tooltip="'Open Traktor Library File'"
				class="mx-1.5 flex justify-center items-center h-9 w-9"
				@click="$emit('load')"
			>
				<svg-icon type="mdi" :path="iconOpenLib" size="18"></svg-icon>
			</button>

			<div class="flex mx-1 items-center h-9">
				<div>
					<input
						type="radio"
						name="display"
						value="list"
						id="viewlist"
						v-model="display"
					/>
					<label for="viewlist" v-tooltip="'Show collection as list'">
						<svg-icon
							type="mdi"
							:path="iconList"
							size="22"
						></svg-icon
					></label>
				</div>
				<div>
					<input
						type="radio"
						name="display"
						value="split"
						id="viewsplit"
						v-model="display"
						checked
					/>
					<label
						for="viewsplit"
						v-tooltip="'Split list and coverview'"
						><svg-icon
							type="mdi"
							:path="iconSplit"
							size="22"
						></svg-icon
					></label>
				</div>
				<div>
					<input
						type="radio"
						name="display"
						value="grid"
						id="viewgrid"
						v-model="display"
					/>
					<label for="viewgrid" v-tooltip="'Show only coverview'"
						><svg-icon
							type="mdi"
							:path="iconGrid"
							size="22"
						></svg-icon
					></label>
				</div>
			</div>
		</div>
	</header>
</template>
<style scoped>
input[type="radio"] {
	@apply hidden;
}
input[type="radio"] + label {
	@apply mx-0.5 bg-black-medium;
}
input[type="radio"] + label:hover {
	@apply bg-black-dark cursor-pointer;
}

label {
	@apply flex justify-center items-center h-9 w-9;
}
input[type="radio"]:checked + label {
	/*background-color: red;*/
	@apply bg-active;
}
</style>
<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveSearch } from "@mdi/js";
import { mdiPlay } from "@mdi/js";
import { mdiViewHeadline } from "@mdi/js";
import { mdiViewSplitHorizontal } from "@mdi/js";
import { mdiViewComfy } from "@mdi/js";
import ScaleLoader from "vue-spinner/src/ScaleLoader.vue";
import WaveSurfer from "wavesurfer.js";
let wavesurfer;

export default {
	components: {
		SvgIcon,
		ScaleLoader,
	},
	props: ["src", "currentTrack"],
	data() {
		return {
			isPlaying: false,
			iconOpenLib: mdiArchiveSearch,
			iconPlayPause: mdiPlay,
			iconList: mdiViewHeadline,
			iconSplit: mdiViewSplitHorizontal,
			iconGrid: mdiViewComfy,
			color: "#969696",
			height: "18px",
			width: "5px",
			// display: "split",
		};
	},
	watch: {
		currentTrack: function(newVal, oldVal) {
			// watch it
			console.log("Prop changed: ", newVal, " | was: ", oldVal);
			this.test = newVal;
			console.log(this.test);
		},
	},
	computed: {
		loading() {
			return this.$store.state.loading;
		},
		display: {
			get() {
				return this.$store.state.display;
			},
			set(value) {
				this.$store.commit("setDisplay", value);
			},
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
		createWavesurfer() {
			wavesurfer = WaveSurfer.create({
				container: "#waveform",
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
		wavesurfer.destroy();
		this.createWavesurfer();
	},
	mounted() {
		let self = this;
		this.createWavesurfer();
		window.ipcRenderer.receive("loadAudio", function(message) {
			var blob = new window.Blob([message]);
			wavesurfer.loadBlob(blob);
		});

		wavesurfer.on("ready", function() {
			self.$store.commit("setFalse");
			wavesurfer.play();
			self.isPlaying = true;
		});
	},
};
</script>
