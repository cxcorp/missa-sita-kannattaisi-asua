import type { StyleSpecification } from "react-map-gl/maplibre";
import json from "./map-style-protomaps-grayscale.json";

json.sprite = new URL(json.sprite, location.origin).toString();

export default json as StyleSpecification;
