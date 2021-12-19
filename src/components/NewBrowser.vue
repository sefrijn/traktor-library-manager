<template>
  <div class="overflow-auto">
    <div
      class="text-sm flex space-x-1 py-1 px-2 cursor-pointer hover:bg-active-dark hover:text-white"
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

    <ejs-treeview
      cssClass="inline-flex"
      v-if="fieldsReady"
      ref="treeview"
      id="treeview"
      :fields="fields"
      :allowDragAndDrop="true"
      :nodeDragStop="dragStop"
      :nodeDragging="dragNode"
      :allowEditing="true"
      :nodeExpanded="update"
      :nodeCollapsed="update"
      :dataSourceChanged="update"
      :expandOn="'Click'"
      :sortOrder="sorting"
      :created="hideNodes"
      :animation="animation"
    ></ejs-treeview>
  </div>
</template>
<script>
import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveMusic } from "@mdi/js";

const cloneDeep = require("lodash.clonedeep");

export default {
  components: {
    "ejs-treeview": TreeViewComponent,
    SvgIcon,
  },
  data() {
    return {
      iconCollection: mdiArchiveMusic,
      sorting: null,
      animation: {
        expand: { effect: "SlideDown", duration: 100, easing: "linear" },
        collapse: { effect: "SlideUp", duration: 100, easing: "linear" },
      },
    };
  },
  computed: {
    fieldsReady() {
      return this.$store.state.fieldsTreeView.ready;
    },
    fields() {
      return this.$store.state.fieldsTreeView;
    },
  },
  methods: {
    hideNodes(args) {
      this.sorting = "Ascending";
      let d = this.$refs.treeview.getTreeData();
      let excluded = [];
      console.log(d);
      d[0].child.forEach((val, index) => {
        if (
          (val.text === "_RECORDINGS" || val.text === "_LOOPS") &&
          val.id.includes("playlist")
        )
          excluded.push(val.id);
      });
      this.$refs.treeview.disableNodes(excluded);
    },
    update(args) {
      console.log(args);
      console.log("update");
      let d = this.$refs.treeview.getTreeData();
      console.log(d);
    },
    dragNode(args) {
      if (args.droppedNode != null)
        if (
          !args.droppedNodeData.id.includes("folder")
          // && args.position == "Inside"
        ) {
          args.dropIndicator = "e-no-drop";
        }
    },

    // Cancel when:
    // 1. Playlist is being dragged in same folder before or after an item
    // 2. Folder is reorganised inside same folder (before or after item)
    // 3. Playlist OR Folder dropped onto a Playlist

    dragStop(args) {
      console.log(args);
      if (args.droppedNode != null)
        if (
          !args.droppedNodeData.id.includes("folder")
          //|| args.draggedNodeData.parentID == args.droppedNodeData.parentID
        ) {
          args.cancel = true;
        }
    },
  },
  mounted() {},
};
</script>
<style lang="scss">
@import "~@syncfusion/ej2-base/styles/material-dark.css";
@import "~@syncfusion/ej2-vue-navigations/styles/material-dark.css";

.control_wrapper {
  display: block;
  max-width: 350px;
  max-height: 350px;
  margin: auto;
  overflow: auto;
  border: 1px solid #dddddd;
  border-radius: 3px;
}
#treeview.e-treeview {
  // @apply select-none text-gray text-sm;
  > .e-list-parent.e-ul {
    @apply pl-1;
  }
  .e-list-item {
    .e-fullrow {
      // height: 28px;
    }
    &.e-hover > .e-fullrow {
      @apply bg-black-light border-black-light;
    }
    &.e-active {
      > .e-fullrow {
        @apply bg-active border-active;
      }
      > .e-text-content .e-list-text {
        @apply text-white;
      }
    }
    &.e-hover.e-active > .e-fullrow {
      @apply bg-active-dark border-active-dark;
    }
    .e-text-content {
      @apply pl-0;
      .e-icons {
        @apply hidden;
      }

      // @apply flex items-center px-1 py-0.5 cursor-pointer;
      &:hover {
        // @apply bg-active text-white;
      }
      &:not(.e-icon-wrapper) .e-list-text::before {
        mask-image: url("../assets/svg/playlist-music.svg");
      }
      .e-icon-expandable + .e-list-text::before {
        mask-image: url("../assets/svg/folder-outline.svg");
      }
      .e-icon-collapsible + .e-list-text:before {
        mask-image: url("../assets/svg/folder-open-outline.svg");
      }
      &:not(.e-icon-wrapper) .e-list-text::before,
      .e-icon-expandable + .e-list-text::before,
      .e-icon-collapsible + .e-list-text::before {
        content: "";
        mask-size: contain;
        width: 17px;
        height: 17px;
        @apply fill-current bg-white block mr-1;
      }
      .e-list-text {
        // min-height: 24px;
        // line-height: 24px;
        @apply flex items-center font-sans;
      }
      // .e-list-text {
      // }
    }
    &.e-active.e-node-focus {
      > .e-text-content {
        // @apply bg-black-light;
      }
    }

    .e-list-parent {
      // @apply pl-2;
    }
  }
}
</style>
