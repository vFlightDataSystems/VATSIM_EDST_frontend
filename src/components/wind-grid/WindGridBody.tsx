import React, { createContext, useRef, useEffect } from "react";
import { useRootDispatch, useRootSelector } from "~redux/hooks";
import type { Coordinate } from "types/gpd/coordinate";
import {
  WIND_GRID_MIN_ZOOM,
  WIND_GRID_MAX_ZOOM,
  windGridCenterSelector,
  windGridZoomLevelSelector,
  setWindGridCenter,
  setWindGridZoomLevel,
  setWindGridDateTime,
  windGridFlightLevelSelector,
  windGridShowTempsSelector,
} from "~redux/slices/windGridSlice";
import { useArtccBoundaries } from "api/gpdApi";
import gpdStyles from "css/gpd.module.scss";
import * as d3 from "d3";
import { useResizeDetector } from "react-resize-detector";
import { useEventListener } from "usehooks-ts";
import { useOnUnmount } from "hooks/useOnUnmount";
import { anyDraggingSelector } from "~redux/slices/appSlice";
import { useWindsGrid } from "~/api/weatherApi";

const initialProjection = d3.geoMercator();

const WindGridContext = createContext<d3.GeoProjection>(initialProjection);
export const useWindGridContext = () => React.useContext(WindGridContext);

export const WindGridBody = () => {
  const dispatch = useRootDispatch();
  const ref = useRef<HTMLDivElement>(null);
  const { width, height } = useResizeDetector({ targetRef: ref });
  const initialCenter = useRootSelector(windGridCenterSelector);
  const zoomLevel = useRootSelector(windGridZoomLevelSelector);
  const flightLevel = useRootSelector(windGridFlightLevelSelector);
  const tempsShown = useRootSelector(windGridShowTempsSelector);
  const { data: artccBoundaries, isSuccess } = useArtccBoundaries();
  const [center, setCenter] = React.useState<Coordinate>(initialCenter);
  const anyDragging = useRootSelector(anyDraggingSelector);
  const [dragging, setDragging] = React.useState(false);

  const translate = (width && height ? [width / 2, height / 2] : [0, 0]) as Coordinate;

  const projection = initialProjection.center(center).translate(translate).scale(zoomLevel);

  const pathGenerator = d3.geoPath(projection);

  useEventListener("mousemove", (e) => {
    if (e.buttons === 1 && dragging && !anyDragging) {
      const newCenter = projection.invert?.([translate[0] - e.movementX, translate[1] - e.movementY]);
      if (newCenter) {
        setCenter(newCenter);
      }
    }
  });

  // Fetch the wind data from the api
  // get top left and bottom right coords
  const topLeft = projection.invert?.([0, 0]) ?? [0, 0];
  const bottomRight = projection.invert?.([width, height]) ?? [0, 0];
  const { data: windGrid } = useWindsGrid({
    toplat: topLeft[1],
    toplong: topLeft[0],
    bottomlat: bottomRight[1],
    bottomlong: bottomRight[0],
    fl: flightLevel,
  });

  // Update the date/time metadata from the API response
  useEffect(() => {
    if (windGrid) {
      dispatch(
        setWindGridDateTime({
          date: windGrid.metadata.String,
          time: windGrid.metadata["Forecast Hour"],
        })
      );
    }
  }, [windGrid, dispatch]);

  // update the wind grid center in redux when the component unmounts
  useOnUnmount(() => {
    dispatch(setWindGridCenter(center));
  });

  useEventListener("mouseup", () => {
    if (dragging) {
      setDragging(false);
    }
  });

  const handleMouseDown = () => {
    setDragging(true);
  };

  const wheelHandler: React.WheelEventHandler = (e) => {
    const sign = Math.sign(e.deltaY);
    if ((zoomLevel < WIND_GRID_MAX_ZOOM && sign < 0) || (zoomLevel > WIND_GRID_MIN_ZOOM && sign > 0)) {
      dispatch(setWindGridZoomLevel(zoomLevel - sign * 500));
    }
  };

  return (
    <div className={gpdStyles.body} ref={ref} onMouseDown={handleMouseDown} onWheel={wheelHandler}>
      <WindGridContext.Provider value={projection}>
        <svg width={width} height={height}>
          <g>
            {isSuccess &&
              artccBoundaries.features.map((shape, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <path key={index} d={pathGenerator(shape) ?? undefined} fill="none" stroke="#adadad" />
              ))}
          </g>

          {/* WIND GRID LAYER */}
          <g>
            {windGrid?.points.map((pt, idx) => {
              const coords = projection([pt.longitude, pt.latitude]);
              if (!coords) return null;

              const [x, y] = coords;

              // Fixed length line (e.g. 20px)
              const arrowLength = 20;
              const angleRad = ((pt.wind_direction_deg_true + 180) * Math.PI) / 180;

              const x2 = x + arrowLength * Math.sin(angleRad);
              const y2 = y - arrowLength * Math.cos(angleRad);

              // unit vector of arrow (dx/len, dy/len)
              const ux = Math.sin(angleRad);
              const uy = -Math.cos(angleRad);

              // base label offset, push further down if arrow points downward (uy > 0)
              const baseLabelOffset = 12;
              const extraDownOffset = uy > 0 ? Math.round(Math.abs(uy) * 20) : 0;
              const labelYOffset = baseLabelOffset + extraDownOffset;

              return (
                <g key={idx}>
                  {/* Dot at wind grid point */}
                  <circle cx={x} cy={y} r={2} fill="white" />

                  {/* Wind direction arrow */}
                  <line x1={x} y1={y} x2={x2} y2={y2} stroke="white" strokeWidth={1} markerEnd="url(#arrowhead)" />

                  {/* Label below: either speed or temperature */}
                  <text
                    x={x}
                    y={y + labelYOffset} // place text just below dot, push further if arrow points down
                    fontSize="12px"
                    textAnchor="middle"
                    fill="white"
                  >
                    {tempsShown ? `${pt.temperature_c}` : `${pt.wind_speed_kt}`}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Arrowhead marker definition */}
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill="white" />
            </marker>
          </defs>
        </svg>
      </WindGridContext.Provider>
    </div>
  );
};
