/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface Location {
  lat: number;
  lng: number;
}

interface SelectedLocation {
  address: any;
  lat: number;
  lng: number;
}

interface MapComponentProps {
  style: React.CSSProperties;
  onLocationSelect: (data: SelectedLocation) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ style, onLocationSelect }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [address, setAddress] = useState<string>('');

  const defaultCenter: Location = {
    lat: 12.9716, // Default to Bangalore
    lng: 77.5946,
  };

  // Handle place selection from autocomplete
  const handlePlaceSelect = (place: google.maps.places.PlaceResult) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      setClickedLocation({ lat, lng });
      reverseGeocode(lat, lng);
    } else {
      console.warn("Selected place has no geometry");
    }
  };

  // Reverse geocode lat/lng to get a human-readable address
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);

    geocoder
      .geocode({ location: latLng })
      .then((response) => {
        if (response.results && response.results.length > 0) {
          const formatted = response.results[0].formatted_address;
          setAddress(formatted);

          // ✅ Send only the clean object
          onLocationSelect({
            address: response.results,
            lat,
            lng,
          });
        } else {
          setAddress('No address found for this location.');
        }
      })
      .catch((error) => {
        console.error('Geocode error:', error);
        setAddress('Error fetching address.');
      });
  };

  // Detect user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setUserLocation(defaultCenter); // fallback
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  // Handle map clicks
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? 0;
    const lng = e.latLng?.lng() ?? 0;
    setClickedLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Autocomplete Search */}
      <GooglePlacesAutocomplete onSelectPlace={handlePlaceSelect} />

      {/* Map */}
      <div style={{ height: 'calc(100% - 80px)', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{
            height: '100%',
            width: '100%',
            position: 'relative',
          }}
          center={clickedLocation || userLocation || defaultCenter}
          zoom={12}
          onClick={handleMapClick}
        >
          {clickedLocation && <Marker position={clickedLocation} />}
        </GoogleMap>
      </div>

      {/* Address Display */}
      <div style={{ padding: '10px' }}>
        <strong>Address: </strong>
        <span>{address}</span>
      </div>
    </div>
  );
};

export default MapComponent;
