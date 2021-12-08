import { throttle } from "throttle-debounce";

export default {
  methods: {
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
      if (this.scrollSource == "list") {
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
    onRowDragEnd(event) {
      this.$store.commit("setSaving", true);
      let self = this;
      let index = null;
      // >>> Reset index only at Track Collection
      if (!this.activePlaylist) {
        index = 0;
      }
      // >>> Update rowData after drag
      let itemsToUpdate = [];
      let libraryUpdated = [];
      this.gridApi.forEachNodeAfterFilterAndSort(function(rowNode) {
        if (index !== null) {
          libraryUpdated[index] =
            self.library["NML"]["COLLECTION"][0]["ENTRY"][rowNode.data.index];
          rowNode.data.index = index;
          index++;
        }
        itemsToUpdate.push(rowNode.data);
      });
      this.$store.commit("setRowData", itemsToUpdate);
      // >>> Store Track Collection in XML
      if (index !== null) {
        this.library["NML"]["COLLECTION"][0]["ENTRY"] = libraryUpdated;
        let updatedLibrary = JSON.parse(JSON.stringify(this.library));
        window.ipcRenderer.send("buildXML", [
          updatedLibrary,
          localStorage.pathToLibrary,
        ]);
      }
      // >>> Playlist edit
      if (index === null) {
        // reference correct playlist up to 5 levels deep, known limitation of manipulating XML with JSON...
        let l;
        if (this.activePlaylistPath.length == 2) {
          l = this.playlists.SUBNODES[0].NODE[this.activePlaylistPath[1]]
            .PLAYLIST[0].ENTRY;
        }
        if (this.activePlaylistPath.length == 3) {
          l = this.playlists.SUBNODES[0].NODE[this.activePlaylistPath[1]]
            .SUBNODES[0].NODE[this.activePlaylistPath[2]].PLAYLIST[0].ENTRY;
        }
        if (this.activePlaylistPath.length == 4) {
          l = this.playlists.SUBNODES[0].NODE[this.activePlaylistPath[1]]
            .SUBNODES[0].NODE[this.activePlaylistPath[2]].SUBNODES[0].NODE[
            this.activePlaylistPath[3]
          ].PLAYLIST[0].ENTRY;
        }
        if (this.activePlaylistPath.length == 5) {
          l = this.playlists.SUBNODES[0].NODE[this.activePlaylistPath[1]]
            .SUBNODES[0].NODE[this.activePlaylistPath[2]].SUBNODES[0].NODE[
            this.activePlaylistPath[3]
          ].SUBNODES[0].NODE[this.activePlaylistPath[4]].PLAYLIST[0].ENTRY;
        }
        if (this.activePlaylistPath.length == 6) {
          l = this.playlists.SUBNODES[0].NODE[this.activePlaylistPath[1]]
            .SUBNODES[0].NODE[this.activePlaylistPath[2]].SUBNODES[0].NODE[
            this.activePlaylistPath[3]
          ].SUBNODES[0].NODE[this.activePlaylistPath[4]].SUBNODES[0].NODE[
            this.activePlaylistPath[5]
          ].PLAYLIST[0].ENTRY;
        }
        // Single element to swap
        let el = l[parseInt(event.node.id)];
        l.splice(parseInt(event.node.id), 1);
        l.splice(event.overIndex, 0, el);
        // library["NML"]["PLAYLISTS"][0]["NODE"][0] = libraryUpdated;
        let updatedLibrary = JSON.parse(JSON.stringify(this.library));
        window.ipcRenderer.send("buildXML", [
          updatedLibrary,
          localStorage.pathToLibrary,
        ]);
      }
    },
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
    onGridReady(params) {
      // console.log("set visibleTracks - onGridReady");
      this.gridApi = params.api;
      this.visibleTracks = this.gridApi.getRenderedNodes();
    },
    onGridSizeChanged(params) {
      // console.log("set visibleTracks - onGridSizeChanged");
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    onFilterChanged(params) {
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
    },
    onViewportChanged(params) {
      // console.log("set visibleTracks - onViewportChanged");
      this.filteredSongs = this.gridOptions.api.getModel().rootNode.childrenAfterFilter.length;
      if (this.gridApi != null) {
        this.visibleTracks = this.gridApi.getRenderedNodes();
      }
    },
    playTrack(track) {
      if (track.index != this.$store.state.trackPlaying.index) {
        this.$store.commit("setTrackPlaying", track);
        this.$store.commit("setLoading", true);
        window.ipcRenderer.send("loadAudio", track.path + track.filename);
      }
    },
    onCellClicked(params) {
      if (params.colDef.field == "index") {
        this.playTrack(params.data);
      }
    },
    onCellContextMenu(params) {
      this.contextMenu.x = params.event.clientX;
      this.contextMenu.y = params.event.clientY;
      this.contextMenu.show = true;
    },
    hideContextMenu() {
      if (this.contextMenu.show) this.contextMenu.show = false;
    },
    onCellEditingStarted(params) {
      this.$store.commit("setPreventScroll", true);
    },
    onCellEditingStopped(params) {
      if (params.newValue == params.oldValue) {
        this.$store.commit("setPreventScroll", false);
      }
    },
    onCellValueChanged(params) {
      this.$store.commit("setSaving", true);
      console.log("You'v edited a cell");
      let self = this;
      setTimeout(function() {
        self.save(params);
      }, 50);
    },
    save(params) {
      // > Save changes to Traktor XML
      let self = this;
      console.log(params.data);
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["COLOR"] = params.data.color_code;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["RANKING"] = params.data.rating * 51;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["GENRE"] = params.data.genre;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["COMMENT"] = params.data.comment_1;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index][
        "INFO"
      ][0]["$"]["RATING"] = params.data.comment_2;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index]["$"][
        "ARTIST"
      ] = params.data.artist;
      this.library["NML"]["COLLECTION"][0]["ENTRY"][params.data.index]["$"][
        "TITLE"
      ] = params.data.title;
      // >> Update Genres
      if (params.column.colId == "genre") {
        console.log("rebuild genre autocomplete");
        self.$store.commit("clearAllGenres");
        let collection = this.library["NML"]["COLLECTION"][0]["ENTRY"];
        collection.forEach(function(track, index) {
          let genre = track["INFO"][0]["$"]["GENRE"];
          if (
            self.$store.state.genres.indexOf(genre) < 0 &&
            genre != undefined &&
            genre != ""
          )
            self.$store.commit("addGenre", genre);
        });
      }
      if (
        params.column.colId == "comment_1" ||
        params.column.colId == "comment_2"
      ) {
        console.log("rebuild tags autocomplete");
        self.$store.commit("clearTags");
        let collection = this.library["NML"]["COLLECTION"][0]["ENTRY"];
        collection.forEach(function(track, index) {
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
            tags.forEach(function(tag, index) {
              if (
                self.$store.state.tags.indexOf(tag) < 0 &&
                tag != undefined &&
                tag != ""
              )
                self.$store.commit("addTag", tag);
            });
          }
        });
      }
      let updatedLibrary = JSON.parse(JSON.stringify(this.library));
      window.ipcRenderer.send("buildXML", [
        updatedLibrary,
        localStorage.pathToLibrary,
      ]);
    },
    pollTraktorOpen() {
      window.ipcRenderer.send("traktorOpen", "");
      this.traktorOpen = setInterval(() => {
        window.ipcRenderer.send("traktorOpen", "");
      }, 4000);
    },
  },
};
