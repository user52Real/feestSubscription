"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

interface VenueMapProps {
  address: string;
  venue: string;
  onLocationSelected?: (location: { lat: number; lng: number }) => void;
  initialLocation?: { lat: number; lng: number };
  isEditable?: boolean;
}

export function VenueMap({
  address,
  venue,
  onLocationSelected,
  initialLocation,
  isEditable = false,
}: VenueMapProps) {
  const [location, setLocation] = useState(initialLocation);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!initialLocation && address) {
      geocodeAddress();
    }
  }, [address]);

  const geocodeAddress = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          address
        )}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
      );
      const data = await response.json();
      if (data.results[0]) {
        const { lat, lng } = data.results[0].geometry.location;
        setLocation({ lat, lng });
        if (onLocationSelected) {
          onLocationSelected({ lat, lng });
        }
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (isEditable && onLocationSelected) {
      const lat = e.latLng?.lat();
      const lng = e.latLng?.lng();
      if (lat && lng) {
        setLocation({ lat, lng });
        onLocationSelected({ lat, lng });
      }
    }
  };

  if (loading || !location) return <div>Loading map...</div>;

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{ width: "100%", height: "400px" }}
        center={location}
        zoom={15}
        onClick={handleMapClick}
      >
        <Marker
          position={location}
          title={venue}
          draggable={isEditable}
          onDragEnd={(e) => {
            if (onLocationSelected && e.latLng) {
              const newLoc = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              setLocation(newLoc);
              onLocationSelected(newLoc);
            }
          }}
        />
      </GoogleMap>
    </LoadScript>
  );
}