import { centerMean, centerMedian, centerOfMass } from "@turf/turf";
import type { Feature, FeatureCollection, Point } from "geojson";
import maplibregl, { LngLat } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";
import { memo, useCallback, useMemo, useState } from "react";
import Map, { Marker, type MapLayerMouseEvent } from "react-map-gl/maplibre";
import mapStyle from "./map-style-protomaps-grayscale";

const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile);

const initialViewState = {
  longitude: 24.9375,
  latitude: 60.170833,
  zoom: 11,
};

interface MyMarker {
  lngLat: LngLat;
}

const calculateTurfForMarkers = (
  markers: MyMarker[],
  method: (json: FeatureCollection<Point>) => Feature<Point>,
) => {
  return method({
    type: "FeatureCollection",
    features: markers.map(({ lngLat }) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: lngLat.toArray(),
      },
      properties: {},
    })),
  });
};

const AppMap = memo(() => {
  const [markers, setMarkers] = useState<MyMarker[]>(() => []);

  const handleClick = useCallback(
    ({ lngLat, originalEvent }: MapLayerMouseEvent) => {
      if (
        originalEvent.target instanceof Element &&
        originalEvent.target.closest(".maplibregl-marker")
      ) {
        return;
      }
      const newMarkers = [...markers, { lngLat }];
      setMarkers(newMarkers);
    },
    [markers],
  );

  const middles = useMemo(
    () =>
      markers.length > 1
        ? {
            median: calculateTurfForMarkers(markers, centerMedian),
            mean: calculateTurfForMarkers(markers, centerMean),
            mass: calculateTurfForMarkers(markers, centerOfMass),
          }
        : null,
    [markers],
  );

  console.log(middles);

  return (
    <Map
      initialViewState={initialViewState}
      mapStyle={mapStyle}
      cursor="default"
      onClick={handleClick}
    >
      {markers.map(({ lngLat }) => (
        <Marker
          latitude={lngLat.lat}
          longitude={lngLat.lng}
          key={lngLat.toString()}
        ></Marker>
      ))}
      {middles &&
        Object.entries(middles).map(([name, feature]) => (
          <Marker
            key={name}
            color={nameToColor[name as "median" | "mean" | "mass"]}
            longitude={feature.geometry.coordinates[0]}
            latitude={feature.geometry.coordinates[1]}
            onClick={() => console.log(name)}
          />
        ))}
    </Map>
  );
});

const nameToColor = {
  median: "red",
  mean: "green",
  mass: "purple",
};

function App() {
  return (
    <>
      <header className="px-20 py-6">
        <h1 className="mb-5 text-3xl">Missä sitä kannattaisi asua?</h1>
        <div className="max-w-2xl">
          <p className="mb-3 text-base">
            Oletko ikinä miettinyt, että missä sitä kannattaisi asua, jotta
            olisi lyhyin mahdollinen matka töihin, harrastuksiin ja tärkeiden
            ihmisten luokse?
          </p>
          <p className="text-base">
            Klikkaa kartalle pisteitä, ja sivu laskee kolme keskipistettä eri
            laskukaavoilla.
          </p>
        </div>
      </header>
      <AppMap />
    </>
  );
}

export default App;
