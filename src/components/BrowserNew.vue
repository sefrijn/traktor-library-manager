<template>
	<div class="w-1/5 px-2 text-sm select-none text-gray-light overflow-scroll">
		<Draggable
			:treeData="treeData"
			:virtualization="true"
			style="width: 600px"
			:edgeScroll="true"
			:defaultFolded="true"
		>
			<template v-slot="{ node, index, tree }">
				<div
					class="flex flex-nowrap items-start py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
					@click="clickItem(node, tree)"
				>
					<svg-icon
						type="mdi"
						class="text-white"
						:path="
							getIcon(node.$folded, node.$children.length == 0)
						"
						size="18"
					></svg-icon>
					<div class="">
						({{ node.$children.length }}) {{ node.text }}
					</div>
				</div>
			</template>
		</Draggable>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiFolderOutline } from "@mdi/js";
import { mdiFolderOpenOutline } from "@mdi/js";
import { mdiPlaylistMusic } from "@mdi/js";
import { mdiPlaylistPlus } from "@mdi/js";

// Browser tree NEW
import { BaseTree, Draggable, obj } from "@he-tree/vue3";
import "@he-tree/vue3/dist/he-tree-vue3.css";

export default {
	components: {
		BaseTree,
		Draggable,
		SvgIcon,
	},
	data() {
		return {
			iconFolderClose: mdiFolderOutline,
			iconFolderOpen: mdiFolderOpenOutline,
			iconPlaylist: mdiPlaylistMusic,
			iconPreparation: mdiPlaylistPlus,
			open: false,
		};
	},
	computed: {
		treeData() {
			return this.$store.state.playlists;
		},
	},
	methods: {
		clickItem(node, tree) {
			if (node.$children.length > 0) {
				tree.toggleFold(node);
			} else {
				console.log("open playlist!");
			}
		},
		getIcon(folded, isplaylist) {
			if (isplaylist) {
				return this.iconPlaylist;
			}
			if (folded) {
				return this.iconFolderClose;
			} else {
				return this.iconFolderOpen;
			}
		},
	},
};
</script>
