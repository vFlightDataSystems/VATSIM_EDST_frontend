import L from "leaflet";
import '../../../css/windows/gpd-styles.scss';
import {GpdDataBlock} from "./GpdDataBlock";
import ReactDOMServer from 'react-dom/server';
import {LocalEdstEntryType} from "../../../types";
import {aclRowFieldEnum} from "../../../enums";

export const trackIcon = L.divIcon({
  className: 'diamond-icon',
  iconSize: [10, 10]
});

export const vorIcon = L.divIcon({
  className: 'circle-icon',
  iconSize: [14, 14]
});

export const trackArrowIcon = L.divIcon({
  className: "aircraft-track-line",
  html: "<div class='line'/>",
  iconAnchor: [-4, 20],
})

export const dataBlockIcon = (entry: LocalEdstEntryType, selectedField: aclRowFieldEnum | null) => L.divIcon({
  className: "data-block",
  html: ReactDOMServer.renderToString(<GpdDataBlock entry={entry} selectedField={selectedField}/>),
  iconSize: [60, 50],
  iconAnchor: [-40, 40]
})