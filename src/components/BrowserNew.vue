<template>
	<div
		class="w-60 relative px-2 text-sm select-none text-gray-light overflow-scroll"
	>
		<div
			class="flex py-1 px-2 space-x-2 cursor-pointer hover:bg-active-dark hover:text-white"
			:class="{ active: this.$store.getters.activePlaylist == null }"
			@click="openTrackCollection"
		>
			<svg-icon
				type="mdi"
				class="text-white"
				:path="iconCollection"
				size="18"
			></svg-icon>
			<span>Track Collection</span>
		</div>

		<BaseTree
			v-if="treeData"
			:treeData="treeData"
			ref="browsertree"
			class="relative h-screen"
		>
			<template v-slot="{ node, index, tree }">
				<div
					class="inline-flex flex-nowrap items-start py-1 px-1 space-x-1 cursor-pointer hover:bg-active-dark hover:text-white relative"
					@click="clickItem(node, tree)"
					style="width:min-content"
				>
					<svg-icon
						type="mdi"
						class="text-white"
						:path="
							getIcon(node.$folded, node.$children.length == 0)
						"
						size="18"
					></svg-icon>
					<div class="whitespace-nowrap">
						{{ node.text }} ({{ node.$children.length }})
					</div>
					<button
						class="opacity-10 hover:opacity-100"
						@click="tree.removeNode(node)"
					>
						<svg-icon
							type="mdi"
							:path="iconDelete"
							size="18"
						></svg-icon>
					</button>
					<button class="opacity-10 hover:opacity-100" @click="">
						<svg-icon
							type="mdi"
							:path="iconEdit"
							size="18"
						></svg-icon>
					</button>
				</div>
			</template>
		</BaseTree>
	</div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveMusic } from "@mdi/js";
import { mdiFolderOutline } from "@mdi/js";
import { mdiFolderOpenOutline } from "@mdi/js";
import { mdiPlaylistMusic } from "@mdi/js";
import { mdiPlaylistPlus } from "@mdi/js";
import { mdiDeleteOutline } from "@mdi/js";
import { mdiPencilOutline } from "@mdi/js";
import { mdiContentDuplicate } from "@mdi/js";

// Browser tree NEW
import { BaseTree, Draggable } from "@he-tree/vue3";
import "@he-tree/vue3/dist/he-tree-vue3.css";

const cloneDeep = require("lodash.clonedeep");

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
			iconCollection: mdiArchiveMusic,
			iconDUplicate: mdiContentDuplicate,
			iconEdit: mdiPencilOutline,
			iconDelete: mdiDeleteOutline,
			open: false,
		};
	},
	computed: {
		treeData() {
			return this.$store.state.playlists;
		},
	},
	watch: {
		// playlists(newval, oldval) {
		// 	this.treeData = cloneDeep(newval);
		// },
		// treeData(newval, oldval) {
		// 	console.log("new treedata");
		// 	console.log(newval);
		// },
	},
	methods: {
		openTrackCollection() {
			console.log("open track collection");
		},
		clickItem(node, tree) {
			console.log(tree.outputNestedData());
			if (node.$children.length > 0) {
				tree.toggleFold(node);
			} else {
				console.log("open playlist: " + node.uuid);
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

<style lang="scss">
@import "../css/colors";

main .he-tree .tree-placeholder {
	background: $black-medium;
	border: 1px dashed $gray;
	height: 28px !important;
	// max-height: 20px;
}
</style>
