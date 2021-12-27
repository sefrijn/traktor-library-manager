<template>
	<div
		class="absolute h-full w-full z-20"
		v-if="percentage < 100 && pathToLibrary"
	>
		<img
			src="./../assets/welcome.png"
			alt=""
			class="absolute top-0 left-0 w-full h-full object-cover z-0"
		/>
		<div
			class="z-10 relative h-full w-full z-20 flex flex-col items-center justify-center space-y-6"
		>
			<img
				class="w-auto mr-1 -mt-5"
				style="height:120px;"
				src="./../assets/logo-bw@2x.png"
				alt=""
			/>
			<h2 class="text-2xl">Loading Data</h2>
			<div class="loadbar w-1/3 h-3 bg-active">
				<div
					class="progress h-3 bg-black"
					:style="{ width: `${percentage}%` }"
				></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {
			percentage: 0,
		};
	},
	computed: {
		pathToLibrary() {
			return this.$store.getters.libraryPath;
		},
	},
	mounted() {
		window.ipcRenderer.receive("coverArtProgress", (message) => {
			this.percentage = message * 100;
			if (this.percentage == 100) {
				console.log("Cover Art Loaded");
			}
		});
	},
};
</script>
