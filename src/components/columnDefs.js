import CoverArtRenderer from "./CoverArtRenderer.vue";

let column_defs = [
  {
    headerName: "Index",
    field: "index",
    editable: false,
    width: 80,
    // sort: "desc",
    sort: "asc",
  },
  {
    headerName: "Track ID",
    field: "track_id",
    hide: true,
    editable: false,
  },
  {
    headerName: "Path",
    field: "path",
    hide: true,
    editable: false,
  },
  {
    headerName: "Filename",
    field: "filename",
    hide: true,
    editable: false,
  },
  {
    headerName: "Image",
    field: "image",
    hide: false,
    editable: false,
    width: 84,
    cellRendererFramework: CoverArtRenderer,
  },
  {
    headerName: "Artist",
    field: "artist",
  },
  { headerName: "Title", field: "title" },
  {
    headerName: "Genre",
    field: "genre",
    width: 200,
  },
  {
    headerName: "Style",
    field: "comment_1",
    width: 240,
  },
  {
    headerName: "Timbre",
    field: "comment_2",
    width: 240,
  },
  {
    headerName: "Energy Level",
    field: "rating",
    width: 112,
  },
  { headerName: "Color", field: "color_code", width: 240 },
  {
    headerName: "Musical Key",
    field: "musical_key",
    editable: false,
  },
  { headerName: "BPM", field: "bpm", editable: false },
  { headerName: "Import Date", field: "import_date" },
  { headerName: "Play Count", field: "play_count" },
];
export { column_defs };
