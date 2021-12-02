<template>
	<div class="absolute h-full w-full z-20">
		<img
			src="./../assets/welcome.png"
			alt=""
			class="absolute top-0 left-0 w-full h-full object-cover z-0"
		/>
		<div
			class="z-10 relative h-full w-full z-20 flex items-center justify-center"
		>
			<h2 class="text-2xl">Generating Cover Art</h2>
			<div class="loadbar w-24">
				<div class="progress w-5 bg-green"></div>
			</div>
		</div>
	</div>
</template>
