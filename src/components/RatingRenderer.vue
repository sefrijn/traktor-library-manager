<template>
    <div class="rating flex" @mouseleave="resetStar" @click="saveCell">
        <span v-for="star in rating" @mouseenter="setStar" :star="star">
            <svg-icon
                class="inline text-active-orange"
                type="mdi"
                :path="iconStar"
                size="14"
            ></svg-icon>
        </span>
        <span
            v-for="star in 5 - rating"
            @mouseenter="setStar"
            :star="star + rating"
        >
            <svg-icon
                class="inline text-black-light"
                type="mdi"
                :path="iconStar"
                size="14"
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
        saveCell() {
            this.params.setValue(this.rating);
        },
        setStar(e) {
            // console.log(e);
            this.rating = parseInt(e.target.attributes.star.nodeValue);
        },
        resetStar() {
            // console.log("reset");
            this.rating = this.params.value;
        },
    },
};
</script>

<style scoped>
.rating > span > svg {
}
</style>
