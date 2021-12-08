<template>
	<div
		:class="{ 'block fixed': contextMenu.show, hidden: !contextMenu.show }"
		class="context-menu z-30 bg-black-light border border-black-dark px-2 py-2"
		:style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
	>
		<ul class="text-sm">
			<li>Delete from Playlist</li>
			<li>Copy</li>
			<li>Paste</li>
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
