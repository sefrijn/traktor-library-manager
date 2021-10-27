<template>
    <div class="visual-browser relative -mb-4" :class="class">
        <div class="overflow-scroll h-full w-full">
            <div class="flex flex-wrap p-2 huge-wrapper">
                <div
                    class="p-2"
                    :class="`w-1/${coverSize}`"
                    v-for="(row, index) in tracks"
                    :key="index"
                >
                    <component
                        :is="image"
                        :artist="row.data.artist"
                        :title="row.data.title"
                        :src="images[row.rowIndex]"
                    >
                    </component>
                </div>
            </div>
        </div>
        <div
            class="absolute bottom-0 flex justify-start items-center px-4 h-4 w-full bg-black-dark  z-10"
        >
            <slider
                v-model="coverSize"
                width="300px"
                color="#2e91a7"
                :min="2"
                :max="12"
                :step="1"
            ></slider
            ><span>{{ coverSize }}</span>
        </div>
    </div>
</template>

<script>
import Image from "./Image.vue";
import slider from "vue3-slider";

export default {
    props: {
        tracks: Object,
        class: String,
    },
    data() {
        return {
            image: "Image",
            images: {},
            coverSize: 5,
        };
    },
    components: {
        Image,
        slider,
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
