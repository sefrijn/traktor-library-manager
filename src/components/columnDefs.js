import { IndexRenderer } from "./Renderer/IndexRenderer.js";
import { CoverArtRenderer } from "./Renderer/CoverArtRenderer.js";
import { RatingRenderer } from "./Renderer/RatingRenderer.js";
import { ColorRenderer } from "./Renderer/ColorRenderer.js";
import Genre from "./Editor/Genre.vue";
import Tagging from "./Editor/Tagging.vue";

let ag_components = {
  indexRenderer: IndexRenderer,
  coverArtRenderer: CoverArtRenderer,
  ratingRenderer: RatingRenderer,
  colorRenderer: ColorRenderer,
};

let column_defs = [
  {
    headerName: "#",
    rowDrag: true,
    field: "index",
    editable: false,
    width: 84,
    cellRenderer: "indexRenderer",
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
    cellRenderer: "coverArtRenderer",
  },
  {
    headerName: "Intensity",
    field: "rating",
    width: 86,
    cellRenderer: "ratingRenderer",
  },
  {
    headerName: "Color",
    field: "color_code",
    width: 102,
    cellRenderer: "colorRenderer",
  },
  {
    headerName: "Artist",
    field: "artist",
    width: 140,
  },
  {
    headerName: "Title",
    field: "title",
    width: 135,
  },
  {
    headerName: "T",
    field: "length",
    width: 62,
    editable: false,
  },
  {
    headerName: "Genre",
    field: "genre",
    width: 155,
    cellEditorFramework: Genre,
  },
  {
    headerName: "Style",
    field: "comment_1",
    width: 200,
    cellEditorFramework: Tagging,
  },
  {
    headerName: "Timbre",
    field: "comment_2",
    width: 200,
    cellEditorFramework: Tagging,
  },
  {
    headerName: "Key",
    field: "musical_key",
    editable: false,
  },
  { headerName: "BPM", field: "bpm", editable: false },
  { headerName: "Import Date", field: "import_date" },
  { headerName: "Play Count", field: "play_count" },
  { headerName: "Cue Points", field: "cue_points", hide: true },
];
export { column_defs, ag_components };
