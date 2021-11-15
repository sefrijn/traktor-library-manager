import IndexRenderer from "./Renderer/IndexRenderer.vue";
import CoverArtRenderer from "./Renderer/CoverArtRenderer.vue";
import RatingRenderer from "./Renderer/RatingRenderer.vue";
import ColorRenderer from "./Renderer/ColorRenderer.vue";
import Genre from "./Editor/Genre.vue";
import Tagging from "./Editor/Tagging.vue";

let column_defs = [
  {
    headerName: "#",
    field: "index",
    editable: false,
    width: 58,
    sort: "desc",
    // sort: "asc",
    cellRendererFramework: IndexRenderer,
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
    headerName: "Intensity",
    field: "rating",
    width: 86,
    cellRendererFramework: RatingRenderer,
  },
  {
    headerName: "Color",
    field: "color_code",
    width: 102,
    cellRendererFramework: ColorRenderer,
  },
  {
    headerName: "Artist",
    field: "artist",
    width: 135,
  },
  {
    headerName: "Title",
    field: "title",
    width: 135,
  },
  {
    headerName: "Genre",
    field: "genre",
    width: 135,
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
export { column_defs };
