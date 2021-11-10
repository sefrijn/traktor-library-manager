import CoverArtRenderer from "./CoverArtRenderer.vue";
import RatingRenderer from "./RatingRenderer.vue";
import ColorRenderer from "./ColorRenderer.vue";
import Genre from "./Editor/Genre.vue";
import Tagging from "./Editor/Tagging.vue";

let column_defs = [
  {
    headerName: "Index",
    field: "index",
    editable: false,
    width: 80,
    sort: "desc",
    // sort: "asc",
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
    width: 140,
    cellEditorFramework: Genre,
  },
  {
    headerName: "Style",
    field: "comment_1",
    width: 220,
    cellEditorFramework: Tagging,
  },
  {
    headerName: "Timbre",
    field: "comment_2",
    width: 220,
  },
  {
    headerName: "Energy Level",
    field: "rating",
    width: 112,
    cellRendererFramework: RatingRenderer,
  },
  {
    headerName: "Color",
    field: "color_code",
    width: 240,
    cellRendererFramework: ColorRenderer,
  },
  {
    headerName: "Musical Key",
    field: "musical_key",
    editable: false,
  },
  { headerName: "BPM", field: "bpm", editable: false },
  { headerName: "Import Date", field: "import_date" },
  { headerName: "Play Count", field: "play_count" },
  { headerName: "Cue Points", field: "cue_points", hide: true },
];
export { column_defs };
