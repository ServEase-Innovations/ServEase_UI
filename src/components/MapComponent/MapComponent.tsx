/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from "react";
import { GoogleMap, Marker } from "@react-google-maps/api";
import { LocateFixed } from "lucide-react";
import { useLanguage } from "src/context/LanguageContext";
import GooglePlacesAutocomplete from "./GooglePlacesAutocomplete";

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
  const { t } = useLanguage();
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [clickedLocation, setClickedLocation] = useState<Location | null>(null);
  const [address, setAddress] = useState<string>("");

  const defaultCenter: Location = {
    lat: 12.9716,
    lng: 77.5946,
  };

  const reverseGeocode = useCallback(
    (lat: number, lng: number) => {
      const geocoder = new google.maps.Geocoder();
      const latLng = new google.maps.LatLng(lat, lng);

      geocoder
        .geocode({ location: latLng })
        .then((response) => {
          if (response.results && response.results.length > 0) {
            const formatted = response.results[0].formatted_address;
            setAddress(formatted);
            onLocationSelect({
              address: response.results,
              lat,
              lng,
            });
          } else {
            setAddress(t("mapGeocodeNotFound"));
          }
        })
        .catch((error) => {
          console.error("Geocode error:", error);
          setAddress(t("mapGeocodeError"));
        });
    },
    [onLocationSelect, t]
  );

  const handlePlaceSelect = useCallback(
    (place: google.maps.places.PlaceResult) => {
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setClickedLocation({ lat, lng });
        reverseGeocode(lat, lng);
      } else {
        console.warn("Selected place has no geometry");
      }
    },
    [reverseGeocode]
  );

  const handleGotoUserLocation = () => {
    const loc = userLocation ?? defaultCenter;
    setClickedLocation(loc);
    reverseGeocode(loc.lat, loc.lng);
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        () => {
          setUserLocation(defaultCenter);
        }
      );
    } else {
      setUserLocation(defaultCenter);
    }
  }, []);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat() ?? 0;
    const lng = e.latLng?.lng() ?? 0;
    setClickedLocation({ lat, lng });
    reverseGeocode(lat, lng);
  };

  return (
    <div
      className="flex h-full min-h-0 w-full flex-col"
      style={style}
    >
      <div className="shrink-0 space-y-2.5 border-b border-slate-200/80 bg-slate-50/90 px-3 py-2.5 sm:px-4 sm:py-3">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch sm:gap-2">
          <div className="min-w-0 flex-1">
            <GooglePlacesAutocomplete
              onSelectPlace={handlePlaceSelect}
              placeholder={t("mapSearchPlaceholder")}
            />
          </div>
          <button
            type="button"
            onClick={handleGotoUserLocation}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:border-sky-200 hover:bg-sky-50/80 hover:text-sky-900"
          >
            <LocateFixed className="h-4 w-4 text-sky-600" aria-hidden />
            {t("useMyCurrentLocation")}
          </button>
        </div>
        <p className="m-0 text-xs leading-relaxed text-slate-500">
          {t("mapAddressEmptyHint")}
        </p>
      </div>

      <div className="min-h-0 min-h-[180px] flex-1">
        <GoogleMap
          mapContainerStyle={{
            height: "100%",
            width: "100%",
            position: "relative",
          }}
          center={clickedLocation || userLocation || defaultCenter}
          zoom={12}
          onClick={handleMapClick}
          options={{
            fullscreenControl: false,
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {clickedLocation && <Marker position={clickedLocation} />}
        </GoogleMap>
      </div>

      <div className="shrink-0 border-t border-slate-200/90 bg-gradient-to-b from-slate-50/95 to-slate-100/80 px-3 py-2.5 sm:px-4 sm:py-3">
        <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
          {t("mapSelectedAddress")}
        </p>
        <p
          className="m-0 mt-1.5 min-h-[2.75rem] text-sm leading-relaxed text-slate-800"
          aria-label={!address ? t("mapAddressEmptyHint") : undefined}
        >
          {address ? (
            address
          ) : (
            <span className="text-slate-400">—</span>
          )}
        </p>
      </div>
    </div>
  );
};

export default MapComponent;
