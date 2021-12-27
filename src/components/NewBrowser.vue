<template>
  <div class="flex flex-col justify-between w-full">
    <div class="overflow-auto w-full">
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
        :nodeExpanded="expandCollapse"
        :nodeCollapsed="expandCollapse"
        :dataSourceChanged="update"
        :expandOn="'Click'"
        :sortOrder="sorting"
        :created="created"
        :animation="animation"
        :selectedNodes="selectedNodes"
      >
      </ejs-treeview>
    </div>
    <div class="controls flex-shrink-0 p-2 flex space-x-2">
      <button
        class="flex justify-center items-center h-9 w-9 bg-black-light"
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
        class="flex justify-center items-center h-9 w-9 bg-black-light"
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
      selectedNodes: [],
    };
  },
  computed: {
    fieldsReady() {
      return this.$store.getters.browser.ready;
    },
    fields() {
      return this.$store.getters.browser;
    },
  },
  methods: {
    openPlaylist(list) {
      this.$store.commit("setFilter", { rating: 0, color: 0 });
      this.$store.commit("setActivePlaylist", list);

      let entries = this.$store.getters.playlistEntries[list];
      let tracks = [];
      for (const playlistTrack of entries) {
        let filename = playlistTrack.split("/:").pop();
        let index = parseInt(this.$store.getters.filenameToIndex[filename]);
        let track = this.$store.getters.collection[index];
        tracks.push(track);
      }
      this.$store.commit("setRowData", tracks);
    },

    // Reset selection and load all data
    openTrackCollection() {
      this.$store.commit("setRowData", this.$store.getters.collection);
      this.$store.commit("setActivePlaylist", null);
      let treeview = document.getElementById("treeview").ej2_instances[0];
      treeview.selectedNodes = [];
    },

    // > Node clicked events
    nodeclick(args) {
      let id = args.node.dataset.uid;
      console.log("open: " + id);

      // Open playlist
      if (args.event.which === 1 && id.includes("playlist")) {
        if (id.includes("autolist")) {
          this.$store.commit("setAllowTrackDragDrop", false);
        } else if (!this.$store.getters.allowTrackDragDrop) {
          this.$store.commit("setAllowTrackDragDrop", true);
        }

        id = id.substr(0, id.indexOf("-"));
        this.openPlaylist(id);
      }

      // ContextMenu
      if (args.event.which === 3) {
        let val = {};
        val.x = args.event.clientX;
        val.y = args.event.clientY;
        val.show = true;
        this.$store.commit("setContextMenu", val);
      }
    },

    // > Treeview Init
    // Exclude two uneditable playlists
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

    // Map visual to treedata & playlist
    expandCollapse(args) {
      let d = this.$refs.treeview.getTreeData();
      this.$store.commit("setBrowserData", d);
    },

    // > Update Vuex data after edits
    update(args) {
      this.$store.commit("setSaving", true);
      setTimeout(() => {
        this.updateAfterTimeout();
      }, 25);
    },
    updateAfterTimeout() {
      // Get new treedata
      let d = this.$refs.treeview.getTreeData();
      // Save to JS objects (browser, playlists, playlistEntries)
      this.$store.commit("setBrowserData", d);
      // Rebuild Library JS object
      this.$store.commit("setLibraryPlaylist");
      // Save to XML file
      let libraryObj = cloneDeep(this.$store.getters.libraryFull);
      window.ipcRenderer.send("buildXML", [
        libraryObj,
        localStorage.pathToLibrary,
      ]);
    },

    // > Limit Drag & Drop for playlist and smartlist items
    dragCondition(args) {
      // Prevent Library Manager edit 1
      if (args.draggedNodeData.parentID.includes("Library-Manager"))
        return true;

      if (args.droppedNode != null && args.droppedNodeData.parentID != null) {
        return (
          // Prevent Library Manager edit 2
          args.draggedNodeData.id.includes("autolist") ||
          (args.droppedNodeData.id.includes("Library-Manager") &&
            args.position === "Inside") ||
          args.droppedNodeData.parentID.includes("Library-Manager") ||
          args.draggedNodeData.parentID.includes("Library-Manager") ||
          // Prevent drop outside Main folder
          args.dropLevel == 1 ||
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

#treeview.e-treeview {
  // Main padding
  > .e-list-parent.e-ul {
    @apply pl-1;
  }
  .e-list-item {
    .e-fullrow {
      height: 28px;
    }
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
    // Icon Library Manager
    &.library-manager > .e-text-content.e-icon-wrapper {
      > .e-list-text::before {
        mask-image: url("../assets/svg/tag-multiple.svg");
      }
    }
    &.library-manager .e-text-content {
      &:not(.e-icon-wrapper) > .e-list-text::before {
        mask-image: url("../assets/svg/label.svg");
        width: 14px;
        height: 14px;
        @apply fill-current bg-active-dark;
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
        min-height: 24px;
        line-height: 24px;
        @apply flex items-center font-sans;
        .e-input-group {
          @apply m-0 py-0 border-b border-white;
          height: 24px;
          input {
            @apply bg-transparent m-0 py-0;
            height: 24px;
            line-height: 24px;
          }
        }
      }
    }

    &.e-disable {
      // @apply hidden;
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
