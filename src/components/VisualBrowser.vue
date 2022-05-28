<template>
    <div
        class="visual-browser w-full bg-neutral-800 -mb-4 border-t border-black"
        :class="class"
    >
        <div
            ref="smallWrapper"
            class="overflow-scroll h-full w-full"
            @scroll="$emit('scroll')"
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
                    class="p-2 absolute transition-width hover:bg-neutral-600 cursor-pointer"
                    :class="[
                        `w-1/${coverSize}`,
                        trackPlayingIndex == row.data.index ? 'active' : '',
                    ]"
                    :style="{
                        left: `calc(${
                            row.rowIndex % coverSize
                        } * 100% / ${coverSize})`,
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
                        :text-height="coverTextHeight"
                        :src="'local-resource://coverart/200/' + row.data.image"
                    >
                    </component>
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-0 border-t border-black flex justify-end items-center px-4 h-8 w-full bg-neutral-700 z-10"
        >
            <span class="text-xs tracking-wider mr-5 text-neutral-400"
                >Size</span
            >
            <vue-slider
                v-model="coverSizeLocal"
                width="250px"
                :min="4"
                :max="8"
                :adsorb="true"
                :tooltip="'none'"
            />
            <span class="text-xs tracking-wider ml-5 text-neutral-400"
                >{{ coverSize }} per row</span
            >
        </div>
    </div>
</template>

<script>
import Image from './Image.vue';
import VueSlider from 'vue-slider-component';

export default {
    components: {
        Image,
        VueSlider,
    },
    props: {
        tracks: Array,
        class: String,
        filteredSongs: Number,
    },
    data() {
        return {
            images: {},
            image: 'Image',
            coverSizeLocal: null,
            coverTextHeight: 48,
        };
    },
    computed: {
        coverSize() {
            return this.$store.getters.coverSize;
        },
        trackPlayingIndex() {
            return this.$store.state.trackPlaying.index;
        },
        wrapperLines() {
            return Math.ceil(this.filteredSongs / this.coverSize);
        },
    },
    watch: {
        coverSizeLocal(newCoverSize, oldCoverSize) {
            if (newCoverSize != oldCoverSize) {
                this.$store.commit('setCoverSize', newCoverSize);
            }
        },
    },
    beforeMount() {
        this.coverSizeLocal = this.coverSize;
    },
    methods: {
        active(index) {
            if (index == trackPlayingIndex) {
                return 'active';
            } else {
                return '';
            }
        },
    },
};
</script>

<style></style>
