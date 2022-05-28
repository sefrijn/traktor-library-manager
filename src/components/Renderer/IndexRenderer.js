export class IndexRenderer {
    init(params) {
        this.eGui = document.createElement('div');
        this.eGui.className =
            'index-wrapper relative h-full w-full bg-transparent hover:bg-primary-500';
        this.eGui.innerHTML = `
        <span class="index">${params.value}</span>
        <div class="icon-wrapper cursor-pointer flex items-center justify-center" style="height:34px;min-width:34px;">
        <div class="icon"></div>
        </div>
       `;
    }

    getGui() {
        return this.eGui;
    }
}
