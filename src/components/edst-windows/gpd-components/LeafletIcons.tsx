import L from "leaflet";
import '../../../css/styles.scss';
import styled from "styled-components";
import ReactDOMServer from 'react-dom/server';

const TrackLine = styled.div<{anchor: number}>`
  transform-origin: top left;
  transform: translate(5px, 6px) rotate(${props => props.anchor}deg);
  height: 1px;
  width: 30px;
  background-color: #ADADAD;
`;

export const trackIcon = L.divIcon({
  className: 'diamond-icon',
  iconSize: [10, 10]
});

export const vorIcon = L.divIcon({
  className: 'circle-icon',
  iconSize: [12, 12]
});

export const trackArrowIcon = (anchor: number) => L.divIcon({
  className: "aircraft-track-line",
  html: ReactDOMServer.renderToString(<TrackLine anchor={anchor}/>)
});