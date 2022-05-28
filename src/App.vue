<template>
    <div
        class="h-screen bg-neutral-800 text-white font-sans flex flex-col-reverse"
        @click="hideContextMenu"
    >
        <about></about>
        <div class="flex-grow">
            <app-header ref="header" style="height: 67px"></app-header>

            <main class="flex relative" @mouseup="endDragging">
                <welcome style="height: calc(100vh - 32px - 134px)"> </welcome>

                <generate-cover-art style="height: calc(100vh - 32px - 134px)">
                </generate-cover-art>

                <aside
                    v-if="sidebar && pathToLibrary"
                    class="max-w-sm flex flex-col justify-between items-start border-r border-black overflow-hidden"
                    :style="{ width: `${asideWidth}%` }"
                    style="height: calc(100vh - 32px - 134px)"
                >
                    <new-browser
                        style="min-height: 0"
                        class="flex-grow"
                    ></new-browser>
                    <browser v-if="false"></browser>
                    <now-playing class="flex-shrink-0"></now-playing>
                </aside>

                <div
                    v-if="sidebar && pathToLibrary"
                    class="divider w-2 flex justify-center items-center bg-neutral-700 hover:bg-neutral-600 cursor-divider-h"
                    @mousedown="startDragging"
                >
                    <img src="./assets/vsizegrip.png" alt="" />
                </div>

                <section
                    v-if="pathToLibrary"
                    class="flex-grow relative border-l border-black"
                    style="height: calc(100vh - 32px - 134px)"
                    @wheel="setScrollSource"
                >
                    <context-menu></context-menu>
                    <ag-grid-vue
                        ref="trackList"
                        class="ag-theme-alpine-dark w-full"
                        :class="classesGrid"
                        :row-buffer="10"
                        :column-defs="columnDefs"
                        :default-col-def="defaultColDef"
                        :suppress-scroll-on-new-data="preventScroll"
                        :row-data="rowData"
                        :row-class-rules="rowClassRules"
                        :grid-options="gridOptions"
                        :row-drag-managed="true"
                        :row-drag-multi-row="false"
                        :animate-rows="true"
                        :row-selection="`multiple`"
                        @grid-ready="onGridReady"
                        @viewport-changed="onViewportChanged"
                        @cell-value-changed="onCellValueChanged"
                        @cell-editing-started="onCellEditingStarted"
                        @cell-editing-stopped="onCellEditingStopped"
                        @cell-clicked="onCellClicked"
                        @cell-context-menu="onCellContextMenu"
                        @body-scroll="onBodyScroll"
                        @grid-size-changed="onGridSizeChanged"
                        @filter-changed="onFilterChanged"
                        @row-drag-end="onRowDragEnd"
                    >
                    </ag-grid-vue>
                    <visual-browser
                        ref="visualbrowser"
                        :class="classesVisualBrowser"
                        :tracks="visibleTracks"
                        :filtered-songs="filteredSongs"
                        @scroll="onBodyScroll"
                        @play-track="playTrack"
                    ></visual-browser>
                </section>
            </main>

            <app-footer
                ref="footer"
                style="height: 67px"
                class="border-t border-black flex justify-center items-center"
                :filtered-songs="filteredSongs"
                :total-songs="totalSongs"
            >
            </app-footer>
        </div>
    </div>
</template>

<script>
window.ipcRenderer.removeAllListeners();

import { AgGridVue } from 'ag-grid-vue3';
import About from './components/About.vue';
import AppHeader from './components/AppHeader.vue';
import AppFooter from './components/AppFooter.vue';
import Browser from './components/Browser.vue';
import NewBrowser from './components/NewBrowser.vue';
import VisualBrowser from './components/VisualBrowser.vue';
import Welcome from './components/Welcome.vue';
import GenerateCoverArt from './components/GenerateCoverArt.vue';
import NowPlaying from './components/NowPlaying.vue';
import ContextMenu from './components/ContextMenu.vue';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiCoffeeOutline } from '@mdi/js';

// Split App.vue into separate files
import appBeforeMount from './mixins/AppBeforeMount.js';
import appMounted from './mixins/AppMounted.js';
import appMethods from './mixins/AppMethods.js';
import fancyTimeFormat from './mixins/FancyTimeFormat.js';

export default {
    name: 'App',
    components: {
        SvgIcon,
        About,
        AgGridVue,
        AppHeader,
        AppFooter,
        VisualBrowser,
        Browser,
        NewBrowser,
        Welcome,
        GenerateCoverArt,
        NowPlaying,
        ContextMenu,
    },
    mixins: [fancyTimeFormat, appBeforeMount, appMounted, appMethods],
    data() {
        return {
            iconCoffee: mdiCoffeeOutline,
            totalSongs: null, // INT - All tracks in collection
            filteredSongs: null, // INT - Tracks within playlist, filter and search
            columnDefs: null, // JS Object - AG Grid column settings
            gridApi: null, // JS Object - AG Grid methods
            gridOptions: null, // JS Object - AG Grid general setings
            defaultColDef: {
                editable: true,
                sortable: true,
                filter: true,
            },
            visibleTracks: [],
            asideWidth: 20, // Number - percentage
            rowClassRules: null, // styling of rows
            unsubscribe: null,
            traktorOpen: null, // Boolean
            scrollSource: null,
        };
    },
    computed: {
        activePlaylist() {
            return this.$store.getters.activePlaylist;
        },
        pathToLibrary() {
            return this.$store.getters.libraryPath;
        },
        preventScroll() {
            return this.$store.getters.preventScroll;
        },
        isSavingEnabled() {
            return this.$store.getters.savingEnabled;
        },
        isStartingUp() {
            return this.$store.getters.startingUp;
        },
        collection() {
            return this.$store.getters.collection;
        },
        rowData() {
            return this.$store.state.rowData;
        },
        sidebar() {
            return this.$store.getters.sidebar;
        },
        query() {
            return this.$store.state.query;
        },
        filter() {
            return this.$store.state.filter;
        },
        display() {
            return this.$store.getters.display;
        },
        contextMenu() {
            return this.$store.getters.contextMenu;
        },
        classesGrid() {
            return {
                'h-full relative z-10': this.display === 'list',
                'h-1/2': this.display === 'split',
                'h-full relative z-0': this.display === 'visualbrowser',
            };
        },
        classesVisualBrowser() {
            return {
                'h-full absolute top-0 z-10': this.display === 'visualbrowser',
                'h-1/2': this.display === 'split',
                'h-full absolute top-0 z-0': this.display === 'list',
            };
        },
        coverSize() {
            return this.$store.getters.coverSize;
        },
        allowTrackDragDrop() {
            return this.$store.getters.allowTrackDragDrop;
        },
    },
    watch: {
        activePlaylist(newval, oldval) {
            setTimeout(() => {
                this.visibleTracks = this.gridApi.getRenderedNodes();
            }, 50);
        },
        allowTrackDragDrop(newval, oldval) {
            this.columnDefs[0].rowDrag = newval;
        },
        isSavingEnabled(newval, oldval) {
            this.columnDefs.forEach((colDef, index) => {
                if (newval && !colDef.hasOwnProperty('editable')) {
                    this.columnDefs[index].editable = true;
                } else {
                    if (this.columnDefs[index].editable) {
                        delete this.columnDefs[index].editable;
                    }
                }
            });
        },
        query(newtext, oldtext) {
            this.gridApi.setQuickFilter(newtext);
        },
        filter(newval, oldval) {
            if (newval.rating <= 0 && newval.color <= 0)
                this.gridApi.setFilterModel(null);
            else {
                let filter = {};
                if (newval.rating > 0) {
                    filter.rating = {
                        type: 'set',
                        filter: newval.rating,
                    };
                }
                if (newval.color > 0) {
                    filter.color_code = {
                        type: 'set',
                        filter: newval.color,
                    };
                }
                this.gridApi.setFilterModel(filter);
            }
            setTimeout(() => {
                this.visibleTracks = this.gridApi.getRenderedNodes();
            }, 50);
        },
        coverSize(newCoverSize, oldCoverSize) {
            if (newCoverSize != oldCoverSize) {
                console.log(
                    'update scroll position of visual browser: ' + newCoverSize
                );
                this.scrollSource = 'coverSize';
                setTimeout(() => {
                    this.onBodyScroll();
                }, 20);
            }
        },
        isStartingUp(newval, oldval) {
            if (oldval == true && newval == false) {
                console.log('finished startup');
                setTimeout(() => {
                    this.addDropZone();
                }, 1500);
            }
        },
    },
    beforeUnmount() {
        console.log('remove watcher and clear traktor check interval');
        clearInterval(this.traktorOpen);
        this.unsubscribe();
    },
};
</script>
