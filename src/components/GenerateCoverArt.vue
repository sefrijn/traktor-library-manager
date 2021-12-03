<template>
	<div class="absolute h-full w-full z-20" v-if="percentage < 100">
		<img
			src="./../assets/welcome.png"
			alt=""
			class="absolute top-0 left-0 w-full h-full object-cover z-0"
		/>
		<div
			class="z-10 relative h-full w-full z-20 flex flex-col items-center justify-center space-y-6"
		>
			<h2 class="text-2xl">Generating Cover Art</h2>
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
	mounted() {
		let self = this;
		window.ipcRenderer.receive("coverArtProgress", (message) => {
			self.percentage = message * 100;
			if (self.percentage == 100) {
				console.log("done generating cover art");
			}
		});
	},
};
</script>
