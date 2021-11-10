<template>
    <img v-if="src != ''" :src="src" />
</template>

<script>
export default {
    data() {
        return {
            src: "",
        };
    },
    beforeMount() {
        if (this.params.data.image)
            this.src = "local-resource://coverart/60/" + this.params.data.image;
    },
};
</script>
