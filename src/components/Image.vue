<template>
	<div class="relative image w-full" style="padding-bottom:100%;">
		<img class="absolute top-0 left-0 z-10" :src="src" alt="" />
		<div
			class="absolute text-black-medium text-xs uppercase font-medium w-full h-full flex justify-center items-center z-0"
		>
			<p class="text-center">no image</p>
		</div>
	</div>
	<div class="py-1 title text-xs font-medium text-center text-gray">
		{{ artist }}<span v-if="artist"> - </span>{{ title }}
	</div>
</template>

<script>
export default {
	name: "Image",
	props: ["artist", "title", "src"],
	data() {
		return {};
	},
	methods: {},
};
</script>
