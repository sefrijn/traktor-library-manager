export class IndexRenderer {
  init(params) {
    this.eGui = document.createElement("div");
    this.eGui.className =
      "index-wrapper h-full w-full flex justify-center items-center bg-transparent hover:bg-active";
    this.eGui.innerHTML = `
        <span class="index">${params.value}</span>
        <div class="icon"></div>
       `;
  }

  getGui() {
    return this.eGui;
  }
}
