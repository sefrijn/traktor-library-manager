<template>
    <div
        class="visual-browser w-full bg-black-dark -mb-4 border-t border-black"
        :class="class"
    >
        <div
            @scroll="onScroll"
            ref="smallWrapper"
            class="overflow-scroll h-full w-full"
        >
            <div
                ref="hugeWrapper"
                class="flex flex-wrap w-full h-0 relative huge-wrapper"
                :style="{
                    paddingTop:
                        'calc((100% / ' +
                        coverSize +
                        ' + ' +
                        coverTextHeight +
                        'px) * ' +
                        wrapperLines +
                        ')',
                }"
            >
                <div
                    v-for="(row, index) in tracks"
                    :key="index"
                    class="p-2 absolute transition-width hover:bg-black-light cursor-pointer"
                    :class="[
                        `w-1/${coverSize}`,
                        trackPlayingIndex == row.data.index ? 'active' : '',
                    ]"
                    :style="{
                        left: `calc(${row.rowIndex %
                            coverSize} * 100% / ${coverSize})`,
                        top: `calc(${Math.floor(
                            row.rowIndex / coverSize
                        )} * 100% / ${wrapperLines})`,
                    }"
                    @click="$emit('playTrack', row.data)"
                >
                    <component
                        :is="image"
                        :artist="row.data.artist"
                        :title="row.data.title"
                        :textHeight="coverTextHeight"
                        :src="'local-resource://coverart/400/' + row.data.image"
                    >
                    </component>
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-0 border-t border-black flex justify-start items-center px-4 h-8 w-full bg-black-medium  z-10"
        >
            <span class="text-xs tracking-wider mr-5 text-gray-dark">Size</span>
            <vue-slider
                v-model="coverSize"
                width="250px"
                :min="4"
                :max="8"
                :adsorb="true"
                :tooltip="'none'"
            />
            <span class="text-xs tracking-wider ml-5 text-gray-dark"
                >{{ coverSize }} per row</span
            >
        </div>
    </div>
</template>

<style></style>

<script>
import Image from "./Image.vue";
import VueSlider from "vue-slider-component";

export default {
    props: {
        tracks: Object,
        class: String,
        filteredSongs: Number,
    },
    data() {
        return {
            images: {},
            image: "Image",
            coverSize: 6,
            coverTextHeight: 48,
        };
    },
    computed: {
        // filteredSongs() {
        //     return this.$store.state.rowData.length;
        // },
        trackPlayingIndex() {
            return this.$store.state.trackPlaying.index;
        },
        wrapperLines() {
            return Math.ceil(this.filteredSongs / this.coverSize);
        },
        scroll() {
            return this.$store.state.scroll.ratio;
        },
    },
    watch: {
        coverSize(newCoverSize, oldCoverSize) {
            console.log(this.filteredSongs);
            let h =
                (this.$refs.hugeWrapper.clientWidth / newCoverSize +
                    this.coverTextHeight) *
                Math.ceil(this.filteredSongs / newCoverSize);

            let newscroll = {};
            newscroll.ratio = this.$store.state.scroll.ratio;
            newscroll.source = "visualbrowser";
            this.$store.commit("setHumanScroll", true);
            this.$store.commit("setScroll", newscroll);
            this.$refs.smallWrapper.scrollTop = newscroll.ratio * h;
        },
        scroll(newscroll, oldscroll) {
            if (
                this.$store.state.scroll.source == "list" &&
                this.$store.state.scroll.human
            ) {
                let h = this.$refs.hugeWrapper.clientHeight;
                this.$refs.smallWrapper.scrollTop = newscroll * h;
            }
        },
    },
    components: {
        Image,
        VueSlider,
    },
    methods: {
        active(index) {
            if (index == trackPlayingIndex) {
                return "active";
            } else {
                return "";
            }
        },
        onScroll(event) {
            if (
                this.$store.state.scroll.source == "list" &&
                this.$store.state.scroll.human
            ) {
                this.$store.commit("setHumanScroll", false);
                return;
            }
            let newScroll = {};
            let h = this.$refs.hugeWrapper.clientHeight;

            newScroll.ratio = this.$refs.smallWrapper.scrollTop / h;
            newScroll.ratio = newScroll.ratio.toFixed(5);

            newScroll.source = "visualbrowser";
            this.$store.commit("setHumanScroll", true);
            this.$store.commit("setScroll", newScroll);
        },
    },
};
</script>
