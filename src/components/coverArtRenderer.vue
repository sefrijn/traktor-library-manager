<template>
    <img :src="file" />
</template>

<script>
export default {
    data() {
        return {
            file: "",
        };
    },
    beforeMount() {
        this.file = this.params.value;
    },
};
</script>
