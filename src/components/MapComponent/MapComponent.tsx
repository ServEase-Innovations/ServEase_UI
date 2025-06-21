/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import GooglePlacesAutocomplete from './GooglePlacesAutocomplete';

interface Location {
  lat: number;
  lng: number;
}

interface MapComponentProps {
    style: React.CSSProperties;
    onLocationSelect: (data : any) => void; // Callback to pass the selected location
  }

const MapComponent : React.FC<MapComponentProps> = ({ style, onLocationSelect }) => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null); // Location to mark on the map
  const [address, setAddress] = useState<string>(''); // To store the fetched address/pincode

  const defaultCenter: Location = {
    lat: 40.748817, // Default to Bangalore
    lng: -73.985428, // Default to Bangalore
  };



  // Initialize map location when the user selects a place
  const handlePlaceSelect = (place: google.maps.places.PlaceResult, lat: number, lng: number) => {

    setClickedLocation({ lat, lng }); // Set clicked location for marker
    reverseGeocode(lat, lng); // Reverse geocode to fetch the address for the selected location
  };

  // Function to perform reverse geocoding and fetch the address/pincode
  const reverseGeocode = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    const latLng = new google.maps.LatLng(lat, lng);

    geocoder
      .geocode({ location: latLng })
      .then((response) => {
        if (response.results[0]) {
          setAddress(response.results[0].formatted_address);
        } else {
          setAddress('No address found for this location.');
        }
        onLocationSelect(response.results[0])
      })
      .catch((error) => {
        setAddress('Error fetching address.');
      });
  };

  useEffect(() => {
    // If geolocation is available, get the user's current position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setUserLocation(defaultCenter); // Fallback location
        }
      );
    } else {
      setUserLocation(defaultCenter); // Fallback if geolocation is unsupported
    }
  }, []);

  // Handle map click to place a marker
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? 0;
    const lng = e.latLng?.lng() ?? 0;

    // Update clickedLocation state with the new lat/lng
    setClickedLocation({ lat, lng });

    // Reverse geocode to fetch the address for the clicked location
    reverseGeocode(lat, lng);
  };

  return (
    <div style={{ height: '100%', width: '100%' }}>
      {/* Google Places Autocomplete Component */}
      <GooglePlacesAutocomplete onSelectPlace={handlePlaceSelect} />

      {/* Google Map Container */}
      <div style={{ height: 'calc(100% - 80px)', width: '100%' }}>
        <GoogleMap
          mapContainerStyle={{
            height: '100%',
            width: '100%',
            position: 'relative',
          }}
          center={clickedLocation || userLocation || defaultCenter}
          zoom={12}
          onClick={handleMapClick} // Add click handler for the map
        >
          {/* Mark clicked location on the map */}
          {clickedLocation && <Marker position={clickedLocation} />}
        </GoogleMap>
      </div>

      {/* Display the fetched address */}
      <div style={{ padding: '10px' }}>
        <strong>Address: </strong>
        <span>{address}</span>
      </div>
    </div>
  );
};

export default MapComponent;
