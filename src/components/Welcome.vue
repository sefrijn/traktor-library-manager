<template>
	<aside class="w-full h-full relative flex">
		<img
			src="./../assets/welcome.png"
			alt=""
			class="absolute top-0 left-0 w-full h-full object-cover z-0"
		/>
		<div
			class="z-10 w-full text-white flex flex-col items-center
	 justify-center "
		>
			<img
				class="w-auto mr-1 -mt-5"
				style="height:120px;"
				src="./../assets/logo-bw@2x.png"
				alt=""
			/>
			<h3>Welcome to</h3>
			<h1>Traktor <span class="font-light">Pro</span> 3</h1>
			<h2>Library Manager</h2>
			<div class="mt-5 max-w-prose text-center text-white font-medium">
				<p>
					A tool build by Sefrijn to help you manage your library.
				</p>
				<p>Open a .NML Library file on your computer to start:</p>
				<div class="mt-4 flex w-full items-center justify-center">
					<btn-open-library
						:size="24"
						text="Open library"
						:tooltip="false"
					></btn-open-library>
				</div>
			</div>
		</div>
	</aside>
</template>

<style scoped lang="scss">
h1,
h2,
h3 {
	display: block;
	text-align: center;
}
p {
	@apply text-lg;
}
p,
img,
h1,
h2,
h3 {
	@apply filter drop-shadow-md;
}
h1 {
	@apply text-5xl font-extrabold uppercase tracking-wider mt-0;
}
h2 {
	@apply text-5xl font-bold text-black;
}
h3 {
	@apply text-2xl font-bold text-white;
}
</style>

<script>
import BtnOpenLibrary from "./BtnOpenLibrary.vue";

export default {
	components: {
		BtnOpenLibrary,
	},
};
</script>
