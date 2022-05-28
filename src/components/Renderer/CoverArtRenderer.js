export class CoverArtRenderer {
    init(params) {
        if (params.value) {
            this.eGui = document.createElement('img');
            this.eGui.src = 'local-resource://coverart/60/' + params.value;
        }
    }

    getGui() {
        return this.eGui;
    }
}
