import track_fields from "./columnHeaders.js";
import CoverArtRenderer from "./CoverArtRenderer.vue";

let column_defs = [
  {
    headerName: "Index",
    field: track_fields[16],
    editable: false,
    width: 80,
    sort: "desc",
  },
  {
    headerName: "Track ID",
    field: track_fields[0],
    hide: true,
    editable: false,
  },
  {
    headerName: "Folder",
    field: track_fields[14],
    hide: true,
    editable: false,
  },
  {
    headerName: "Filename",
    field: track_fields[15],
    hide: false,
    editable: false,
    width: 100,
    cellRendererFramework: CoverArtRenderer,
  },
  {
    headerName: "Artist",
    field: track_fields[1],
  },
  { headerName: "Title", field: track_fields[2] },
  {
    headerName: "Genre",
    field: track_fields[5],
    width: 200,
  },
  {
    headerName: "Style",
    field: track_fields[6],
    width: 240,
  },
  {
    headerName: "Timbre",
    field: track_fields[7],
    width: 240,
  },
  {
    headerName: "Energy Level",
    field: track_fields[8],
    width: 112,
  },
  { headerName: "Feeling", field: track_fields[9][0], width: 240 },
  {
    headerName: "Musical Key",
    field: track_fields[10],
    editable: false,
  },
  { headerName: "BPM", field: track_fields[11], editable: false },
  { headerName: "Import Date", field: track_fields[12] },
  { headerName: "Play Count", field: track_fields[13] },
];
export { column_defs };
