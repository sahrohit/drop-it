"use client";
import { cn } from "@/lib/utils";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { useEffect } from "react";
import { LatLngBoundsExpression, LatLngExpression } from "leaflet";

// Define interfaces for our data structure
interface PostLocation {
  lat: number;
  long: number;
  content: string;
}

interface ChangeMapViewProps {
  lat: number;
  long: number;
  all: PostLocation[];
}

interface MapProps {
  lat: number;
  long: number;
  all: PostLocation[];
  className?: string;
}

// This component will handle updating the map view when props change
const ChangeMapView = ({ lat, long, all }: ChangeMapViewProps) => {
  const map = useMap();

  useEffect(() => {
    // Update center when lat or long changes
    map.setView([lat, long], map.getZoom());

    // If we have multiple markers, fit bounds to include all markers
    if (all && all.length > 1) {
      const bounds: LatLngExpression[] = all.map((post) => [
        post.lat,
        post.long,
      ]);
      map.fitBounds(bounds as LatLngBoundsExpression);
    }
  }, [map, lat, long, all]);

  return null;
};

const Map = ({ lat, long, all, className }: MapProps) => {
  const center: LatLngExpression = [lat, long];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className={cn("!z-0", className)}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Add the component that will update the map view */}
      <ChangeMapView lat={lat} long={long} all={all} />

      {all?.map((post) => (
        <Marker
          key={post.content}
          position={[post.lat, post.long] as LatLngExpression}
        >
          <Popup>{post.content}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
