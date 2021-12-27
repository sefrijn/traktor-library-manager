import { IndexRenderer } from "./../components/Renderer/IndexRenderer.js";
import { CoverArtRenderer } from "./../components/Renderer/CoverArtRenderer.js";
import { RatingRenderer } from "./../components/Renderer/RatingRenderer.js";
import { ColorRenderer } from "./../components/Renderer/ColorRenderer.js";
import Genre from "./../components/Editor/Genre.vue";
import Tagging from "./../components/Editor/Tagging.vue";

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
    sort: "desc",
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
    width: 102,
  },
  { headerName: "BPM", field: "bpm", editable: false, width: 102 },
  { headerName: "Import Date", field: "import_date", width: 102 },
  {
    headerName: "Play Count",
    field: "play_count",
    editable: false,
    width: 102,
  },
  { headerName: "Cue Points", field: "cue_points", hide: true },
];
export { column_defs, ag_components };
