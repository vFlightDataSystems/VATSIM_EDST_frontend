import L from "leaflet";
import '../../../css/windows/gpd-styles.scss';
import {LocalEdstEntryType} from "../../../types";

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

export const dataBlockIcon = (entry: LocalEdstEntryType) => L.divIcon({
  className: "data-block",
  html: `${entry.callsign}<br/>${entry.interim ? entry.interim + 'T' + entry.altitude : entry.altitude + 'C'}
<br/>${entry.dest} ${entry.flightplan.ground_speed}`,
  iconSize: [50, 40],
  iconAnchor: [-40, 40]
})