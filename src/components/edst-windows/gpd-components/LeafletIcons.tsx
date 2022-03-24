import L from "leaflet";
import '../../../css/windows/gpd-styles.scss';

export const trackIcon = L.divIcon({
  className: 'diamond-icon',
  iconSize: [10, 10]
});

export const vorIcon = L.divIcon({
  className: 'circle-icon',
  iconSize: [12, 12]
});

export const trackArrowIcon = L.divIcon({
  className: "aircraft-track-line",
  html: "<div class='line'/>",
});