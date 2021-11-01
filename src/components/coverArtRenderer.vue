<template>
    <img v-if="src != ''" :src="src" @error="imageUrlAlt" />
</template>

<script>
export default {
    data() {
        return {
            src: "",
        };
    },
    methods: {
        imageUrlAlt(event) {
            this.src = "";
        },
    },
    beforeMount() {
        this.src = "local-resource://coverart/60/" + this.params.data.image;
    },
};
</script>
