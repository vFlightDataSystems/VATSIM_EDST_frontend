import L from "leaflet";
import '../../../css/windows/gpd-styles.scss';

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
  iconAnchor: [-4, 20]
});