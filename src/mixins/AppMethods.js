import { throttle } from "throttle-debounce";
import { nmlCollection, nmlPlaylist } from "./../config/paths.js";
const cloneDeep = require("lodash.clonedeep");

let prevHover = undefined;
let dropZoneParams;

export default {
  methods: {
    // > Scroll
    setScrollSource: throttle(20, function(event) {
      let splitHeight = (window.innerHeight - 134) / 2 + 67;
      if (this.display === "list" && this.scrollSource !== "list") {
        this.scrollSource = "list";
      }
      if (
        this.display === "visualbrowser" &&
        this.scrollSource !== "visualbrowser"
      ) {
        this.scrollSource = "visualbrowser";
      }
      if (this.display === "split") {
        if (event.clientY < splitHeight && this.scrollSource !== "list") {
          this.scrollSource = "list";
        }
        if (
          event.clientY > splitHeight &&
          this.scrollSource !== "visualbrowser"
        ) {
          this.scrollSource = "visualbrowser";
        }
      }
    }),
    onBodyScroll: throttle(20, function(event) {
      // Throttle scroll to 60 FPS to optimise scrolling visual browser
      if (this.scrollSource == "list" || this.scrollSource == "coverSize") {
        // Scrolled from tracklist
        // Calculate ratio
        let h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;
        let newScrollRatio =
          this.gridApi.gridBodyCon.eBodyViewport.scrollTop / h;
        // Apply ratio
        h = this.$refs.visualbrowser.$refs.hugeWrapper.clientHeight;
        this.$refs.visualbrowser.$refs.smallWrapper.scrollTop =
          newScrollRatio * h;
      }
      if (this.scrollSource == "visualbrowser") {
        // Scrolled from visual browser
        // Calculate ratio
        let h = this.$refs.visualbrowser.$refs.hugeWrapper.clientHeight;
        let newScrollRatio =
          this.$refs.visualbrowser.$refs.smallWrapper.scrollTop / h;
        // Apply ratio
        h = this.gridApi.gridBodyCon.eBodyViewport.children[1].clientHeight;
        this.gridApi.gridBodyCon.eBodyViewport.scrollTop = newScrollRatio * h;
      }
    }),

    // > Drag
    onRowDragEnd(event) {
      this.$store.commit("setSaving", true);
      let index = null;

      // >>> Reset index only at Track Collection
      // If variable is null, set index to 0, in order to rebuild new index
      if (!this.activePlaylist) {
        index = 0;
      }
      // >>> Update rowData after drag
      let itemsToUpdate = [];
      let libraryUpdated = [];
      this.gridApi.forEachNodeAfterFilterAndSort((rowNode) => {
        // Set new index if at Track Collection
        if (!this.activePlaylist) {
          libraryUpdated[index] = this.$store.getters.library(
            `${nmlCollection}.${rowNode.data.index}`
          );
          rowNode.data.index = index;
          index++;
        }
        // If at playlist, only update position in Row Data
        itemsToUpdate.push(rowNode.data);
      });
      this.$store.commit("setRowData", itemsToUpdate);

      // >>> Store Track Collection in XML
      if (!this.activePlaylist) {
        this.$store.commit("setLibraryValue", {
          path: nmlCollection,
          value: libraryUpdated,
        });
      }

      // >>> Playlist edit
      if (this.activePlaylist) {
        let entries = this.$store.getters.playlistEntries[this.activePlaylist];
        // Single element to swap
        let el = entries[parseInt(event.node.id)];
        entries.splice(parseInt(event.node.id), 1);
        entries.splice(event.overIndex, 0, el);

        this.$store.commit("setLibraryPlaylist");
      }

      //  >>> Save changes
      let libraryObj = cloneDeep(this.$store.getters.libraryFull);
      window.ipcRenderer.send("buildXML", [
        libraryObj,
        localStorage.pathToLibrary,
      ]);
    },
    // > Resize sidebar
    handleDragging(e) {
      const percentage = (e.pageX / window.innerWidth) * 100;
      if (percentage >= 10 && percentage <= 90) {
        this.asideWidth = percentage.toFixed(2);
      }
    },
    startDragging(event) {
      document.addEventListener("mousemove", this.handleDragging);
    },
    endDragging() {
      document.removeEventListener("mousemove", this.handleDragging);
    },

    // > Tracklist updates
    onGridReady(params) {
      console.log("AG Grid is READY");
      this.gridApi = params.api;
      this.visibleTracks = this.gridApi.getRenderedNodes();

      setTimeout(() => {
        // define drop zone
        const targetContainer = document.querySelector("#treeview");
        dropZoneParams = {
          getContainer: () => targetContainer,
          onDragging: (params) => {
            const elements = document.elementsFromPoint(
              params.event.clientX,
              params.event.clientY
            );
            if (elements[2].dataset.uid) {
              // Initial hover, add class
              if (!prevHover) {
                elements[2].classList.add("e-hover");
              }

              if (
                // New hover, element changed, remove old hover
                prevHover &&
                prevHover.dataset.uid != elements[2].dataset.uid
              ) {
                prevHover.classList.remove("e-hover");
                elements[2].classList.add("e-hover");
              }

              // After hovering over disabled items, add class to current hover item
              if (!elements[2].classList.contains("e-hover")) {
                elements[2].classList.add("e-hover");
              }

              prevHover = elements[2];
            } else {
              if (prevHover) prevHover.classList.remove("e-hover");
              prevHover = undefined;
            }
          },
          onDragStop: (params) => {
            const elements = document.elementsFromPoint(
              params.event.clientX,
              params.event.clientY
            );
            let id = elements[2].dataset.uid;
            if (id.includes("playlist")) {
              this.$store.commit("setSaving", true);
              id = id.substr(0, id.indexOf("-"));
              this.$store.commit("addtoPlaylistEntries", {
                id: id,
                index: params.node.data.index,
              });
              // Update after adding track
              this.$store.commit("setLibraryPlaylist");
              // Save to XML file
              let libraryObj = cloneDeep(this.$store.getters.libraryFull);
              window.ipcRenderer.send("buildXML", [
                libraryObj,
                localStorage.pathToLibrary,
              ]);
            }
          },
        };
        this.gridApi.addRowDropZone(dropZoneParams);
        this.gridApi.redrawRows(); // force redraw after adding dropzone
      }, 1000);
    },
    onGridSizeChanged(params) {
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    onFilterChanged(params) {
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
    },
    onViewportChanged(params) {
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },

    // > Clipboard on Cell Clicked
    onCellClicked(params) {
      if (params.data.index != this.$store.state.trackPlaying.index) {
        let clipboardVal = params.data.artist + " - " + params.data.title;
        this.copyToClipboard(clipboardVal);
      }
      if (params.colDef.field == "index") {
        this.playTrack(params.data);
      }
    },
    copyToClipboard(text) {
      window.ipcRenderer.send("toClipboard", text);
      this.$store.commit("setClipboardMessage", true);
      setTimeout(() => {
        this.$store.commit("setClipboardMessage", false);
      }, 1400);
    },
    // > Play a track
    playTrack(track) {
      if (track.index != this.$store.state.trackPlaying.index) {
        let node = this.gridApi.getRowNode(track.index);
        if (!node.isSelected()) {
          node.setSelected(true, true);
          if (track.index != this.$store.state.trackPlaying.index) {
            let clipboardVal = track.artist + " - " + track.title;
            this.copyToClipboard(clipboardVal);
          }
        }
        this.$store.commit("setTrackPlaying", track);
        this.$store.commit("setLoading", true);
        this.$store.commit("setSpotifyArtist", true);
        window.ipcRenderer.send("loadAudio", track.path + track.filename);
      }
    },

    // > Context menu
    onCellContextMenu(params) {
      if (this.activePlaylist) {
        let menu = {
          x: params.event.clientX,
          y: params.event.clientY,
          show: true,
          source: "grid",
          actions: ["add_to_preparation", "delete_from_playlist"],
          artist: params.data.artist,
          title: params.data.title,
          playlist: this.activePlaylist,
        };
        this.$store.commit("setContextMenu", menu);
      }
    },
    hideContextMenu() {
      let val = this.contextMenu;
      if (val.show) {
        val.show = false;
        this.$store.commit("setContextMenu", val);
      }
    },

    // > During Editing, stop scroll
    onCellEditingStarted(params) {
      this.$store.commit("setPreventScroll", true);
    },
    onCellEditingStopped(params) {
      if (params.newValue == params.oldValue) {
        this.$store.commit("setPreventScroll", false);
      }
    },

    // > Save changes
    onCellValueChanged(params) {
      this.$store.commit("setSaving", true);
      console.log("You'v edited a cell");
      setTimeout(() => {
        this.save(params);
      }, 25);
    },
    save(params) {
      // Save changes to Traktor XML
      let i = "." + params.data.index;

      // Intensity
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".INFO.0.$.RANKING",
        value: params.data.rating * 51,
      });
      // Color
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".INFO.0.$.COLOR",
        value: params.data.color_code,
      });
      // Artist
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".$.ARTIST",
        value: params.data.artist,
      });
      // Title
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".$.TITLE",
        value: params.data.title,
      });
      // Genre
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".INFO.0.$.GENRE",
        value: params.data.genre,
      });
      // Comment 1
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".INFO.0.$.COMMENT",
        value: params.data.comment_1,
      });
      // Comment 2
      this.$store.commit("setLibraryValue", {
        path: nmlCollection + i + ".INFO.0.$.RATING",
        value: params.data.comment_2,
      });

      // Update Genre list
      if (params.column.colId == "genre") {
        this.$store.commit("clearAllGenres");
        let collection = this.$store.getters.library(nmlCollection);
        collection.forEach((track, index) => {
          let genre = track["INFO"][0]["$"]["GENRE"];
          if (
            this.$store.getters.genres.indexOf(genre) < 0 &&
            genre != undefined &&
            genre != ""
          )
            this.$store.commit("addGenre", genre);
        });
      }
      // Update Tag list
      if (
        params.column.colId == "comment_1" ||
        params.column.colId == "comment_2"
      ) {
        this.$store.commit("clearTags");
        let collection = this.$store.getters.library(nmlCollection);
        collection.forEach((track, index) => {
          let tags1 = track["INFO"][0]["$"]["COMMENT"];
          if (tags1 != undefined && tags1 != "") {
            tags1 = tags1.split(/[;,]+/).map((item) => item.trim());
          } else {
            tags1 = [];
          }
          let tags2 = track["INFO"][0]["$"]["RATING"];
          if (tags2 != undefined && tags2 != "") {
            tags2 = tags2.split(/[;,]+/).map((item) => item.trim());
          } else {
            tags2 = [];
          }
          let tags = [...tags1, ...tags2];
          if (tags.length > 0) {
            tags.forEach((tag, index) => {
              if (
                this.$store.getters.tags.indexOf(tag) < 0 &&
                tag != undefined &&
                tag != ""
              )
                this.$store.commit("addTag", tag);
            });
          }
        });
        // Write autoplaylist data to library (and XML file)
        this.$store.commit("setTagList");
        this.$store.commit("updateBrowserData");
      }

      let libraryObj = cloneDeep(this.$store.getters.libraryFull);
      window.ipcRenderer.send("buildXML", [
        libraryObj,
        localStorage.pathToLibrary,
      ]);
    },

    // > Poll Traktor is running
    pollTraktorOpen() {
      window.ipcRenderer.send("traktorOpen", "");
      this.traktorOpen = setInterval(() => {
        window.ipcRenderer.send("traktorOpen", "");
      }, 4000);
    },
  },
};
