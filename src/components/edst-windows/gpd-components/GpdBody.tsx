import '../../../css/windows/gpd-styles.scss';
import React, {useMemo} from "react";
import {MapContainer} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {useAppSelector} from "../../../redux/hooks";
import {
  sectorPolygonSelector,
  vorHighListSelector,
  vorLowListSelector
} from "../../../redux/slices/sectorSlice";
import {GpdAircraftTrack, GpdFix, GpdMapSectorPolygon} from "./GpdMapElements";
import {LocalEdstEntryType} from "../../../types";
import {entriesSelector} from "../../../redux/slices/entriesSlice";

const center = {lat: 42.362944444444445, lng: -71.00638888888889};

export const GpdBody: React.FC = () => {
  const vorHighList = useAppSelector(vorHighListSelector);
  const vorLowList = useAppSelector(vorLowListSelector);
  const sectors = useAppSelector(sectorPolygonSelector);
  const entries = useAppSelector(entriesSelector);
  const entryList = useMemo(() => Object.values(entries)?.filter((entry: LocalEdstEntryType) => entry.aclDisplay), [entries]);

  const vorHighNames = useMemo(() => vorHighList.map(fix => fix.name), [vorHighList]);

  return (<div className="gpd-body">
    <MapContainer center={center} zoom={7} placeholder={true} zoomControl={false}>
      {Object.values(sectors).map((sector) => <GpdMapSectorPolygon sector={sector}/>)}
      {vorHighList.map(fix => <GpdFix {...fix}/>)}
      {vorLowList.map(fix => (!vorHighNames.includes(fix.name) && <GpdFix {...fix}/>))}
      {entryList.map(entry => <GpdAircraftTrack cid={entry.cid}/>)}
    </MapContainer>
  </div>);
}