<template>
    <div class="flex flex-col justify-between w-full relative">
        <div class="overflow-auto w-full">
            <div
                class="text-sm flex space-x-1 py-1 px-2 cursor-pointer hover:bg-primary-600 hover:text-white"
                :class="{ active: $store.getters.activePlaylist == null }"
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
                v-if="fieldsReady"
                id="treeview"
                ref="treeview"
                :css-class="cssClasses"
                :fields="fields"
                :node-clicked="nodeclick"
                :allow-drag-and-drop="true"
                :node-drag-stop="dragStop"
                :node-dragging="dragNode"
                :allow-editing="true"
                :node-expanded="expandCollapse"
                :node-collapsed="expandCollapse"
                :node-editing="startedEditing"
                :node-edited="finishedEditing"
                :data-source-changed="update"
                :expand-on="'Click'"
                :sort-order="sorting"
                :created="created"
                :animation="animation"
                :selected-nodes="selectedNodes"
            >
            </ejs-treeview>
        </div>
        <div
            class="absolute bottom-0 controls flex-shrink-0 w-full p-2 flex space-x-2"
        >
            <button
                v-tooltip="'New playlist'"
                class="flex flex-shrink-0 justify-center items-center h-7 w-7 bg-neutral-600 shadow-black-lg"
                @click="showInput('playlist')"
            >
                <svg-icon
                    class=""
                    type="mdi"
                    :path="iconNewPlaylist"
                    size="16"
                ></svg-icon>
            </button>
            <button
                v-tooltip="'New Folder'"
                class="flex flex-shrink-0 justify-center items-center h-7 w-7 bg-neutral-600 shadow-black-lg"
                @click="showInput('folder')"
            >
                <svg-icon
                    class=""
                    type="mdi"
                    :path="iconNewFolder"
                    size="16"
                ></svg-icon>
            </button>
            <form
                v-if="createNodeType"
                class="relative flex-grow"
                @submit="addNode"
            >
                <label
                    for=""
                    class="absolute bottom-full mb-1 left-0 text-neutral-300 uppercase text-xxs"
                    >enter name</label
                >
                <input
                    ref="nodeName"
                    v-model="nodeName"
                    type="text"
                    class="w-full h-7 border-none bg-primary-500 text-sm px-2"
                    @blur="createNodeType = null"
                />
            </form>
        </div>
    </div>
</template>
<script>
import { TreeViewComponent } from '@syncfusion/ej2-vue-navigations';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiArchiveMusic } from '@mdi/js';
import { mdiFolderPlusOutline } from '@mdi/js';
import { mdiPlaylistPlus } from '@mdi/js';

const cloneDeep = require('lodash.clonedeep');

let cssClassesDefault = 'inline-flex';

export default {
    components: {
        'ejs-treeview': TreeViewComponent,
        SvgIcon,
    },
    data() {
        return {
            iconCollection: mdiArchiveMusic,
            iconNewFolder: mdiFolderPlusOutline,
            iconNewPlaylist: mdiPlaylistPlus,
            sorting: 'Ascending',
            animation: {
                expand: {
                    effect: 'SlideDown',
                    duration: 100,
                    easing: 'linear',
                },
                collapse: {
                    effect: 'SlideUp',
                    duration: 100,
                    easing: 'linear',
                },
            },
            cssClasses: cssClassesDefault,
            selectedNodes: [],
            createNodeType: null,
            nodeName: '',
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

    mounted() {},
    methods: {
        showInput(type) {
            this.createNodeType = type;
            this.$nextTick(() => {
                this.$refs.nodeName.focus();
            });
        },
        addNode(e) {
            e.preventDefault();
            let data = {
                id: makeid(32),
                name: this.nodeName,
                type: this.createNodeType,
                selected: this.selectedNodes[0],
            };

            this.$store.commit('addNode', data);

            // Empty input field
            this.createNodeType = null;
            this.nodeName = '';
        },
        openPlaylist(list) {
            console.log('open: ' + list);
            this.$store.commit('setFilter', { rating: 0, color: 0 });
            this.$store.commit('setActivePlaylist', list);

            let entries = this.$store.getters.playlistEntries[list];
            let tracks = [];
            for (const playlistTrack of entries) {
                let filename = playlistTrack.split('/:').pop();
                let index = parseInt(
                    this.$store.getters.filenameToIndex[filename]
                );
                let track = this.$store.getters.collection[index];
                tracks.push(track);
            }
            this.$store.commit('setRowData', tracks);
        },

        // Reset selection and load all data
        openTrackCollection() {
            this.$store.commit('setRowData', this.$store.getters.collection);
            this.$store.commit('setActivePlaylist', null);
            let treeview = document.getElementById('treeview').ej2_instances[0];
            treeview.selectedNodes = [];
        },

        // > Node clicked events
        nodeclick(args) {
            // console.log(args);
            let treeview = document.getElementById('treeview').ej2_instances[0];
            this.selectedNodes = treeview.selectedNodes;
            // console.log(treeview.selectedNodes);

            let id = args.node.dataset.uid;

            // Open playlist
            if (args.event.which === 1 && id.includes('playlist')) {
                if (id.includes('autolist')) {
                    this.$store.commit('setAllowTrackDragDrop', false);
                } else if (!this.$store.getters.allowTrackDragDrop) {
                    this.$store.commit('setAllowTrackDragDrop', true);
                }

                id = id.substr(0, id.indexOf('-'));
                this.openPlaylist(id);
            }

            // ContextMenu
            if (args.event.which === 3) {
                let menu = {
                    x: args.event.clientX,
                    y: args.event.clientY,
                    show: true,
                    source: 'browser',
                    actions: ['delete', 'rename'],
                    id: id,
                };
                this.selectedNodes = [id];
                this.$store.commit('setContextMenu', menu);
            }
        },

        // > Treeview Init
        // Exclude two uneditable playlists
        created(args) {
            let excluded = [];
            let d = this.$refs.treeview.getTreeData();
            d[0].child.forEach((val, index) => {
                if (
                    (val.text === '_RECORDINGS' || val.text === '_LOOPS') &&
                    val.id.includes('playlist')
                )
                    excluded.push(val.id);
            });
            this.$refs.treeview.disableNodes(excluded);
        },

        // Map visual to treedata & playlist
        expandCollapse(args) {
            let d = this.$refs.treeview.getTreeData();
            this.$store.commit('setBrowserData', d);
        },

        // > Update Vuex data after edits
        update(args) {
            this.$store.commit('setSaving', true);
            setTimeout(() => {
                this.updateAfterTimeout();
            }, 25);
        },
        updateAfterTimeout() {
            // Get new treedata
            let d = this.$refs.treeview.getTreeData();
            // Save to JS objects (browser, playlists, playlistEntries)
            this.$store.commit('setBrowserData', d);
            // Rebuild Library JS object
            this.$store.commit('setLibraryPlaylist');
            // Save to XML file
            let libraryObj = cloneDeep(this.$store.getters.libraryFull);
            window.ipcRenderer.send('buildXML', [
                libraryObj,
                localStorage.pathToLibrary,
            ]);
            console.log(this.$store.getters.playlists);
        },

        // > Prevent autolist edit
        startedEditing(args) {
            if (
                args.nodeData.id.includes('autolist') ||
                args.nodeData.text === 'Preparation'
            ) {
                args.cancel = true;
            }
        },
        finishedEditing(args) {
            console.log(args);
            if (args.nodeData.id.includes('-folder-')) {
                // Add space to folders
                args.newText = ' ' + args.newText.trim();
            }
        },

        // > Limit Drag & Drop for playlist and smartlist items
        dragCondition(args) {
            // Prevent Library Manager edit 1
            if (
                args.draggedNodeData.parentID.includes('Library-Manager') ||
                args.draggedNodeData.id.includes('autolist') ||
                args.draggedNodeData.id.includes('autofolder')
            )
                return true;

            if (
                args.droppedNode != null &&
                args.droppedNodeData.parentID != null
            ) {
                return (
                    // Prevent Library Manager edit 2
                    args.droppedNodeData.id.includes('autofolder') ||
                    args.draggedNodeData.id.includes('autolist') ||
                    (args.droppedNodeData.id.includes('Library-Manager') &&
                        args.position === 'Inside') ||
                    args.droppedNodeData.parentID.includes('Library-Manager') ||
                    args.draggedNodeData.parentID.includes('Library-Manager') ||
                    // Prevent drop outside Main folder
                    args.dropLevel == 1 ||
                    // Cancel drag & drop for Preparation List
                    (args.draggedNodeData.text === 'Preparation' &&
                        args.draggedNodeData.parentID.includes('ROOT')) ||
                    // Prevent playlists getting child items
                    (args.droppedNodeData.id.includes('list') && // playlist or smartlist
                        args.position == 'Inside') || // inside
                    // Prevent playlist inside playlist bug
                    (args.droppedNodeData.id.includes('list') &&
                        args.droppedNode.classList.contains(
                            'e-level-' + (args.dropLevel - 1)
                        ))
                );
            } else {
                return false;
            }
        },
        dragNode(args) {
            if (this.dragCondition(args)) {
                args.dropIndicator = 'e-no-drop';
            }

            if (args.position == 'Before' || args.position == 'After') {
                this.cssClasses = cssClassesDefault + ' hide-hover';
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
};

function makeid(length) {
    var result = '';
    var characters =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(
            Math.floor(Math.random() * charactersLength)
        );
    }
    return result;
}
</script>
<style lang="scss">
@import '~@syncfusion/ej2-base/styles/material-dark.css';
@import '~@syncfusion/ej2-vue-navigations/styles/material-dark.css';

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
            @apply bg-neutral-600 border-neutral-600;
        }
        &.e-primary-500 {
            > .e-fullrow {
                @apply bg-primary-500 border-primary-500;
            }
            > .e-text-content .e-list-text {
                @apply text-white;
            }
        }
        &.e-hover.e-primary-500 > .e-fullrow {
            @apply bg-primary-600 border-primary-600;
        }
        // Icon Folder
        &[data-uid*='folder'] > .e-text-content > .e-list-text::before {
            mask-image: url('../assets/svg/folder-outline.svg');
        }
        // Icon Playlist
        &[data-uid*='playlist'] > .e-text-content > .e-list-text::before {
            mask-image: url('../assets/svg/playlist-music.svg');
        }
        &[data-uid*='smartlist'] > .e-text-content > .e-list-text::before {
            mask-image: url('../assets/svg/playlist-music.svg');
        }

        // Icon Preparation
        &.preparation .e-text-content {
            &:not(.e-icon-wrapper) .e-list-text::before {
                mask-image: url('../assets/svg/playlist-plus.svg');
            }
        }
        // Icon Library Manager
        &.library-manager > .e-text-content.e-icon-wrapper {
            > .e-list-text::before {
                mask-image: url('../assets/svg/tag-multiple.svg');
                @apply fill-current bg-primary-500;
            }
        }
        &.e-primary-500.library-manager {
            > .e-text-content.e-icon-wrapper > .e-list-text::before {
                @apply bg-white;
            }
        }
        &.library-manager .e-text-content {
            &:not(.e-icon-wrapper) > .e-list-text::before {
                mask-image: url('../assets/svg/label.svg');
                width: 13px;
                height: 13px;
                @apply fill-current bg-primary-500;
            }
        }
        &.e-primary-500[data-uid*='autolist'] {
            .e-text-content:not(.e-icon-wrapper) > .e-list-text::before {
                @apply text-neutral-400;
            }
        }
        .e-text-content {
            @apply pl-0; // Remove icon padding

            .e-icons,
            .e-checkbox-wrapper {
                @apply hidden; // Hide icon completely
            }

            // Icons
            .e-icon-expandable ~ .e-list-text::before {
                mask-image: url('../assets/svg/folder-outline.svg');
            }
            .e-icon-collapsible ~ .e-list-text:before {
                mask-image: url('../assets/svg/folder-open-outline.svg');
            }
            // &:not(.e-icon-wrapper) .e-list-text::before {
            //   mask-image: url("../assets/svg/playlist-music.svg");
            // }

            &:not(.e-icon-wrapper) .e-list-text::before,
            .e-icon-expandable ~ .e-list-text::before,
            .e-icon-collapsible ~ .e-list-text::before {
                content: '';
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
