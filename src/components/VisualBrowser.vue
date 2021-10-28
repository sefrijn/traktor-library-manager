<template>
    <div class="visual-browser relative -mb-4" :class="class">
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
                    class="p-2 absolute transition-width hover:bg-black-light cursor-pointer"
                    :class="`w-1/${coverSize}`"
                    :style="{
                        left:
                            'calc(' +
                            (row.rowIndex % coverSize) +
                            '* 100% / ' +
                            coverSize +
                            ')',
                        top:
                            'calc(' +
                            Math.floor(row.rowIndex / coverSize) +
                            '* 100% / ' +
                            wrapperLines +
                            ')',
                    }"
                    v-for="(row, index) in tracks"
                    :key="index"
                >
                    <component
                        :is="image"
                        :artist="row.data.artist"
                        :title="row.data.title"
                        :src="images[row.rowIndex]"
                        :textHeight="coverTextHeight"
                    >
                    </component>
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-0 flex justify-start items-center px-4 h-4 w-full bg-black-dark  z-10"
        >
            <span class="text-xs font-bold tracking-wider mr-5 text-gray-dark"
                >Size</span
            >
            <vue-slider
                v-model="coverSize"
                width="250px"
                :min="3"
                :max="12"
                :adsorb="true"
                :tooltip="'none'"
            />
            <span class="text-xs font-bold tracking-wider ml-5 text-gray-dark"
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
        total: Number,
    },
    data() {
        return {
            // wrapperHeight: "1000%",
            image: "Image",
            images: {},
            coverSize: 5,
            coverTextHeight: 48,
        };
    },
    computed: {
        wrapperLines() {
            return Math.ceil(this.total / this.coverSize);
        },
        scroll() {
            return this.$store.state.scroll.ratio;
        },
    },
    watch: {
        scroll(newscroll, oldscroll) {
            if (
                this.$store.state.scroll.source == "list" &&
                this.$store.state.scroll.human
            ) {
                // console.log("external scroll sync from list");
                let h = this.$refs.hugeWrapper.clientHeight;
                this.$refs.smallWrapper.scrollTop = newscroll * h;
                // this.$store.commit("setHumanScroll", true);
            } else {
                // console.log("human scroll activated!");
                // this.$store.commit("setHumanScroll", false);
            }
        },
    },
    components: {
        Image,
        VueSlider,
    },
    methods: {
        onScroll(event) {
            console.log(this.$store.state.scroll.human);
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
    beforeMount() {
        let self = this;

        window.ipcRenderer.receive("coverArtList", function(picture) {
            const rowIndex = picture[3];
            const src = picture[0];
            self.images[rowIndex] = src;
        });
    },
};
</script>
