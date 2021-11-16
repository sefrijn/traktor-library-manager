<template>
    <div class="rating flex">
        <span
            v-for="star in rating"
            @click="saveCell"
            :star="star"
            class="cursor-pointer"
        >
            <svg-icon
                class="pointer-events-none inline text-active-orange"
                type="mdi"
                :path="iconStar"
                size="13"
            ></svg-icon>
        </span>
        <span
            v-for="star in 5 - rating"
            @click="saveCell"
            :star="star + rating"
            class="cursor-pointer"
        >
            <svg-icon
                class="pointer-events-none inline text-white opacity-20"
                type="mdi"
                :path="iconStar"
                size="13"
            ></svg-icon>
        </span>
    </div>
</template>

<script>
import SvgIcon from "@jamescoyle/vue-icon";
import { mdiStar } from "@mdi/js";
import { mdiStarOutline } from "@mdi/js";

export default {
    components: {
        SvgIcon,
    },
    data() {
        return {
            iconStar: mdiStar,
            iconStarOutline: mdiStarOutline,
            rating: "",
        };
    },
    beforeMount() {
        this.rating = this.params.value;
    },
    methods: {
        saveCell(e) {
            console.log(e);
            // prevent scrolling and set value
            this.rating = parseInt(e.target.attributes.star.nodeValue);
            this.$store.dispatch("setPreventScroll", true).then(() => {
                this.params.setValue(this.rating);
            });
        },
        setStar(e) {},
        resetStar() {
            this.rating = this.params.value;
        },
    },
};
</script>

<style scoped>
.rating > span > svg {
}
</style>
