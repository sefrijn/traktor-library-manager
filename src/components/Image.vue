<template>
	<div class="relative image w-full" style="padding-bottom:100%;">
		<img
			v-if="exists"
			class="absolute top-0 left-0 z-10 w-full h-auto"
			:src="src"
			alt=""
		/>
		<div
			class="no-image absolute text-gray-dark text-xs uppercase font-medium w-full h-full flex justify-center items-center z-0"
		>
			<p class="text-center">no image</p>
		</div>
	</div>
	<div
		class="py-2 text-xs font-medium text-gray-very-light"
		:style="{ height: textHeight + 'px' }"
		style="white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;"
	>
		{{ artist }}
		<span v-if="artist"><br /></span
		><span class="text-white">{{ title }}</span>
	</div>
</template>

<style lang="scss">
.active .no-image {
	@apply text-active-very-dark;
}
</style>
<script>
export default {
	name: "Image",
	props: ["artist", "title", "src", "textHeight"],
	computed: {
		exists() {
			return this.src.slice(-5) !== "/null" ? true : false;
		},
	},
};
</script>
