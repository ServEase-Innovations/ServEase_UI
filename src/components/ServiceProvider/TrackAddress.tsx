// components/TrackAddress/TrackAddress.tsx
import React, { useState, useEffect } from 'react';

interface Props {
  onClose: () => void;
  googleMapsApiKey: string;
  destinationAddress: string; // Add this prop
}

const TrackAddress: React.FC<Props> = ({ onClose, googleMapsApiKey, destinationAddress }) => {
  const [currentLocation, setCurrentLocation] = useState<{lat: number, lng: number} | null>(null);
  const [destination, setDestination] = useState<{lat: number, lng: number} | null>(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [mapError, setMapError] = useState('');
  const [geocodingError, setGeocodingError] = useState('');

  // Get user's location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Default location (Kolkata)
          setCurrentLocation({ lat: 22.5726, lng: 88.3639 });
        }
      );
    }
  }, []);

  // Load Google Maps script
  useEffect(() => {
    if (!currentLocation) return;

    // Check if script already exists
    if (document.getElementById('google-maps-script')) {
      if (window.google) {
        geocodeAddress();
      }
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      geocodeAddress();
    };
    
    script.onerror = () => {
      setMapError('Failed to load Google Maps. Check your API key.');
    };

    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('google-maps-script');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, [currentLocation, googleMapsApiKey]);

  // Geocode the destination address when Google Maps is loaded
  const geocodeAddress = () => {
    if (!window.google || !destinationAddress) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: destinationAddress }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        setDestination({
          lat: location.lat(),
          lng: location.lng()
        });
        setGeocodingError('');
      } else {
        console.error('Geocoding failed:', status);
        setGeocodingError(`Could not find coordinates for address: ${destinationAddress}`);
      }
    });
  };

  // Initialize map when both locations are available
  useEffect(() => {
    if (currentLocation && destination && window.google) {
      initMap();
    }
  }, [currentLocation, destination]);

  const initMap = () => {
    if (!currentLocation || !destination || !window.google) return;

    const map = new google.maps.Map(document.getElementById('map')!, {
      center: currentLocation,
      zoom: 10,
      mapTypeControl: true,
      fullscreenControl: true,
      streetViewControl: true,
    });

    // Add markers
    new google.maps.Marker({
      position: currentLocation,
      map: map,
      title: 'Your Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png'
      }
    });

    new google.maps.Marker({
      position: destination,
      map: map,
      title: destinationAddress,
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
      }
    });

    // Draw route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#2196F3',
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    directionsService.route(
      {
        origin: currentLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
          
          // Get distance and duration
          const route = result.routes[0].legs[0];
          setDistance(route.distance?.text || '');
          setDuration(route.duration?.text || '');
          
          // Fit map to show entire route
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(currentLocation);
          bounds.extend(destination);
          map.fitBounds(bounds);
        } else {
          console.log('Directions error:', status);
        }
      }
    );
  };

  const openInGoogleMaps = () => {
    if (!currentLocation || !destination) return;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${currentLocation.lat},${currentLocation.lng}&destination=${destination.lat},${destination.lng}`;
    window.open(url, '_blank');
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>Track to Customer</h2>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {/* Location Info */}
        <div style={styles.locationInfo}>
          <div style={styles.locationRow}>
            <span style={styles.locationDot}>📍</span>
            <span style={styles.locationText}>
              From: {currentLocation ? 
                `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 
                'Getting location...'}
            </span>
          </div>
          <div style={styles.locationRow}>
            <span style={styles.locationDot}>🏁</span>
            <span style={styles.locationText}>To: {destinationAddress || 'Loading address...'}</span>
          </div>
        </div>

        {/* Map */}
        <div style={styles.mapContainer}>
          {mapError ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{mapError}</p>
            </div>
          ) : geocodingError ? (
            <div style={styles.errorContainer}>
              <p style={styles.errorText}>{geocodingError}</p>
            </div>
          ) : !destination ? (
            <div style={styles.loadingContainer}>
              <p>Loading destination coordinates...</p>
            </div>
          ) : (
            <div id="map" style={styles.map}></div>
          )}
        </div>

        {/* Stats */}
        <div style={styles.statsContainer}>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{distance || '--'}</span>
            <span style={styles.statLabel}>Distance</span>
          </div>
          <div style={styles.statItem}>
            <span style={styles.statValue}>{duration || '--'}</span>
            <span style={styles.statLabel}>Est. Time</span>
          </div>
        </div>

        {/* Buttons */}
        <div style={styles.buttonContainer}>
          <button 
            onClick={openInGoogleMaps} 
            style={styles.navigateButton} 
            disabled={!destination}
          >
            🗺️ Start Navigation
          </button>
          <button onClick={() => window.location.reload()} style={styles.refreshButton}>
            🔄 Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 10000,
  },
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #eee',
  },
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#666',
  },
  locationInfo: {
    padding: '12px 20px',
    backgroundColor: '#f8f9fa',
    borderBottom: '1px solid #eee',
  },
  locationRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '4px',
  },
  locationDot: {
    marginRight: '8px',
    fontSize: '14px',
  },
  locationText: {
    fontSize: '14px',
    color: '#666',
  },
  mapContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    position: 'relative' as const,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    padding: '20px',
    textAlign: 'center' as const,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: '16px',
    marginBottom: '8px',
  },
  errorSubtext: {
    color: '#666',
    fontSize: '14px',
  },
  loadingContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  statsContainer: {
    display: 'flex',
    padding: '20px',
    borderBottom: '1px solid #eee',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '4px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#666',
  },
  buttonContainer: {
    display: 'flex',
    padding: '20px',
    gap: '12px',
  },
  navigateButton: {
    flex: 2,
    padding: '14px',
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    opacity: 1,
    ':disabled': {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  },
  refreshButton: {
    flex: 1,
    padding: '14px',
    backgroundColor: '#E3F2FD',
    color: '#2196F3',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
};

export default TrackAddress;