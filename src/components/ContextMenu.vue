<template>
	<div
		v-if="contextMenu.show"
		class="block fixed z-30 bg-black-light border border-black-dark"
		:style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
	>
		<ul class="text-sm">
			<li class="px-2 py-0.5 hover:bg-active cursor-pointer">
				Delete from Playlist
			</li>
			<li class="px-2 py-0.5 hover:bg-active cursor-pointer">Copy</li>
			<li class="px-2 py-0.5 hover:bg-active cursor-pointer">Paste</li>
		</ul>
	</div>
</template>

<script>
export default {
	props: {
		contextMenu: Object,
	},
};
</script>
