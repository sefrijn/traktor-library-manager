<template>
    <div
        class="index-wrapper h-full w-full flex justify-center items-center bg-transparent hover:bg-active"
    >
        <span class="index">{{ value }}</span>
        <div class="icon"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            value: "",
        };
    },
    mounted() {
        this.value = this.params.value;
    },
};
</script>
