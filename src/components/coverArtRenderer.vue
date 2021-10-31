<template>
    <img :src="file" />
</template>

<script>
export default {
    data() {
        return {
            file: "",
            // file: require("../assets/testimage.jpg"),
        };
    },
    beforeMount() {
        let self = this;
        // let index = this.params.data.index;
        let rowIndex = this.params.rowIndex;
        let file = this.params.data.filename;
        window.ipcRenderer.send("coverArtCell", [file, rowIndex]);
        // Detect right IPC event with numbered channel
        let channel = "coverArtCell" + rowIndex;
        window.ipcRenderer.receive(channel, function(message) {
            self.file = message[0];
        });
    },
};
</script>
