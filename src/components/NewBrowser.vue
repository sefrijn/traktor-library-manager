<template>
  <div class="flex flex-col justify-between">
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
        :cssClass="cssClasses"
        v-if="fieldsReady"
        ref="treeview"
        id="treeview"
        :fields="fields"
        :nodeClicked="nodeclick"
        :allowDragAndDrop="true"
        :nodeDragStop="dragStop"
        :nodeDragging="dragNode"
        :allowEditing="true"
        :nodeExpanded="update"
        :nodeCollapsed="update"
        :dataSourceChanged="update"
        :expandOn="'Click'"
        :sortOrder="sorting"
        :created="created"
        :animation="animation"
      >
      </ejs-treeview>
    </div>
    <div class="controls flex-shrink-0 p-2 flex space-x-2">
      <button
        class="flex justify-center items-center h-9 w-9 bg-black-medium"
        v-tooltip="'New playlist'"
      >
        <svg-icon
          class=""
          type="mdi"
          :path="iconNewPlaylist"
          size="21"
        ></svg-icon>
      </button>
      <button
        class="flex justify-center items-center h-9 w-9 bg-black-medium"
        v-tooltip="'New Folder'"
      >
        <svg-icon
          class=""
          type="mdi"
          :path="iconNewFolder"
          size="21"
        ></svg-icon>
      </button>
    </div>
  </div>
</template>
<script>
import { TreeViewComponent } from "@syncfusion/ej2-vue-navigations";
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiArchiveMusic } from "@mdi/js";
import { mdiFolderPlusOutline } from "@mdi/js";
import { mdiPlaylistPlus } from "@mdi/js";

const cloneDeep = require("lodash.clonedeep");

let cssClassesDefault = "inline-flex";

export default {
  components: {
    "ejs-treeview": TreeViewComponent,
    SvgIcon,
  },
  data() {
    return {
      iconCollection: mdiArchiveMusic,
      iconNewFolder: mdiFolderPlusOutline,
      iconNewPlaylist: mdiPlaylistPlus,
      sorting: "Ascending",
      animation: {
        expand: { effect: "SlideDown", duration: 100, easing: "linear" },
        collapse: { effect: "SlideUp", duration: 100, easing: "linear" },
      },
      cssClasses: cssClassesDefault,
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
    // > ContextMenu
    nodeclick(args) {
      console.log("nodeClicked");
      console.log(args.node.dataset.uid);
      if (args.event.which === 3) {
        let val = {};
        val.x = args.event.clientX;
        val.y = args.event.clientY;
        val.show = true;
        this.$store.commit("setContextMenu", val);
      }
    },

    // > Treeview Init
    created(args) {
      let excluded = [];
      let d = this.$refs.treeview.getTreeData();
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
      // > Sort new treedata after update by setting Vuex var
      let d = this.$refs.treeview.getTreeData();
      this.$store.commit("setTreeViewData", d);
    },

    // > Limit Drag & Drop for playlist and smartlist items
    dragCondition(args) {
      if (args.droppedNode != null) {
        return (
          // Cancel drag & drop for Preparation List
          (args.draggedNodeData.text === "Preparation" &&
            args.draggedNodeData.parentID.includes("ROOT")) ||
          // Prevent playlists getting child items
          (args.droppedNodeData.id.includes("list") && // playlist or smartlist
            args.position == "Inside") || // inside
          // Prevent playlist inside playlist bug
          (args.droppedNodeData.id.includes("list") &&
            args.droppedNode.classList.contains(
              "e-level-" + (args.dropLevel - 1)
            ))
        );
      } else {
        return false;
      }
    },
    dragNode(args) {
      if (this.dragCondition(args)) {
        args.dropIndicator = "e-no-drop";
      }

      if (args.position == "Before" || args.position == "After") {
        this.cssClasses = cssClassesDefault + " hide-hover";
      } else {
        this.cssClasses = cssClassesDefault;
      }
    },
    dragStop(args) {
      console.log(args);
      if (this.dragCondition(args)) {
        args.cancel = true;
        console.log("cancel");
      }
      this.cssClasses = cssClassesDefault;
    },
  },

  mounted() {},
};
</script>
<style lang="scss">
@import "~@syncfusion/ej2-base/styles/material-dark.css";
@import "~@syncfusion/ej2-vue-navigations/styles/material-dark.css";

// .control_wrapper {
//   display: block;
//   max-width: 350px;
//   max-height: 350px;
//   margin: auto;
//   overflow: auto;
//   border: 1px solid #dddddd;
//   border-radius: 3px;
// }
#treeview.e-treeview {
  // Main padding
  > .e-list-parent.e-ul {
    @apply pl-1;
  }
  .e-list-item {
    // Hover & Active
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

    // Icon Preparation
    &.preparation .e-text-content {
      &:not(.e-icon-wrapper) .e-list-text::before {
        mask-image: url("../assets/svg/playlist-plus.svg");
      }
    }

    .e-text-content {
      @apply pl-0; // Remove icon padding

      .e-icons,
      .e-checkbox-wrapper {
        @apply hidden; // Hide icon completely
      }

      // Icons
      &:not(.e-icon-wrapper) .e-list-text::before {
        mask-image: url("../assets/svg/playlist-music.svg");
      }
      .e-icon-expandable ~ .e-list-text::before {
        mask-image: url("../assets/svg/folder-outline.svg");
      }
      .e-icon-collapsible ~ .e-list-text:before {
        mask-image: url("../assets/svg/folder-open-outline.svg");
      }
      &:not(.e-icon-wrapper) .e-list-text::before {
        mask-image: url("../assets/svg/playlist-music.svg");
      }

      &:not(.e-icon-wrapper) .e-list-text::before,
      .e-icon-expandable ~ .e-list-text::before,
      .e-icon-collapsible ~ .e-list-text::before {
        content: "";
        mask-size: contain;
        width: 17px;
        height: 17px;
        @apply fill-current bg-white block mr-1;
      }
      .e-list-text {
        @apply flex items-center font-sans;
      }
    }

    &.e-disable {
      @apply hidden;
    }
  }

  // Cancel hover when sibling is present
  &.hide-hover {
    .e-list-item {
      &.e-hover > .e-fullrow {
        @apply bg-transparent border-transparent;
      }
    }
  }
}
</style>
