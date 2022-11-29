import React, { useEffect, useMemo } from "react";
import { MapContainer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import { entriesSelector } from "~redux/slices/entrySlice";
import {
  GPD_MAX_ZOOM,
  GPD_MIN_ZOOM,
  gpdCenterSelector,
  gpdPlanDataSelector,
  gpdSuppressedSelector,
  gpdZoomLevelSelector,
  setGpdCenter,
  setGpdZoomLevel,
} from "~redux/slices/gpdSlice";
import { useArtccBoundaries } from "api/gpdApi";
import { GpdAircraftTrack, GpdPlanDisplay, GpdPolygon } from "components/GpdMapElements";
import gpdStyles from "css/gpd.module.scss";
import { ZOOM_SNAP } from "components/Gpd";

const MapConfigurator = () => {
  const dispatch = useRootDispatch();
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const map = useMap();

  useEffect(() => {
    map.on("moveend", () => {
      dispatch(setGpdZoomLevel(map.getZoom()));
      dispatch(setGpdCenter(map.getCenter()));
    });
  }, [dispatch, map]);

  useEffect(() => {
    if (map.getZoom() !== zoomLevel) {
      map.setZoom(zoomLevel);
    }
  }, [map, zoomLevel]);

  return null;
};

export const GpdBody = () => {
  const entries = useRootSelector(entriesSelector);
  const displayData = useRootSelector(gpdPlanDataSelector);
  const suppressed = useRootSelector(gpdSuppressedSelector);
  const center = useRootSelector(gpdCenterSelector);
  const zoomLevel = useRootSelector(gpdZoomLevelSelector);
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries();

  const entryList = useMemo(() => Object.values(entries).filter((entry) => entry.status === "Active"), [entries]);

  return (
    <div className={gpdStyles.body}>
      <MapContainer
        center={center}
        preferCanvas
        placeholder
        keyboard={false}
        doubleClickZoom={false}
        zoomControl={false}
        zoomAnimation={false}
        inertia={false}
        zoom={zoomLevel}
        maxZoom={GPD_MAX_ZOOM}
        minZoom={GPD_MIN_ZOOM}
        zoomSnap={ZOOM_SNAP}
        zoomDelta={ZOOM_SNAP}
      >
        <MapConfigurator />
        {isSuccess && artccBoundaries && <GpdPolygon data={artccBoundaries} />}
        {!suppressed && entryList.map((entry) => <GpdAircraftTrack key={entry.aircraftId} aircraftId={entry.aircraftId} />)}
        {displayData && <GpdPlanDisplay displayData={displayData} />}
      </MapContainer>
    </div>
  );
};
