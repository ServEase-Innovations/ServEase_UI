import React, { useEffect, useRef, useId } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Search, X } from "lucide-react";
import { useLanguage } from "src/context/LanguageContext";

const PAC_ZINDEX_STYLE_ID = "servase-google-places-pac-zindex";

interface GooglePlacesAutocompleteProps {
  onSelectPlace: (place: google.maps.places.PlaceResult) => void;
  placeholder: string;
}

const GooglePlacesAutocomplete: React.FC<GooglePlacesAutocompleteProps> = ({
  onSelectPlace,
  placeholder,
}) => {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const onSelectRef = useRef(onSelectPlace);
  onSelectRef.current = onSelectPlace;
  const clearId = useId();

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (!document.getElementById(PAC_ZINDEX_STYLE_ID)) {
      const style = document.createElement("style");
      style.id = PAC_ZINDEX_STYLE_ID;
      style.textContent = `
        .pac-container { z-index: 2000 !important; border-radius: 12px; margin-top: 4px; box-shadow: 0 10px 40px rgba(15, 23, 42, 0.12) !important; }
        .pac-item { font-size: 0.875rem; padding: 0.5rem 0.75rem !important; }
        .pac-item:hover { background: #f8fafc !important; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  useEffect(() => {
    let ac: google.maps.places.Autocomplete | null = null;
    let poller: ReturnType<typeof setInterval> | undefined;

    const tryBind = () => {
      if (!inputRef.current || !window.google?.maps?.places) return false;
      if (ac) return true;
      ac = new window.google.maps.places.Autocomplete(inputRef.current);
      ac.addListener("place_changed", () => {
        const place = ac!.getPlace();
        if (place?.geometry) {
          onSelectRef.current(place);
        }
      });
      return true;
    };

    if (tryBind()) {
      // ok
    } else {
      poller = setInterval(() => {
        if (tryBind() && poller) {
          clearInterval(poller);
          poller = undefined;
        }
      }, 200);
    }

    return () => {
      if (poller) clearInterval(poller);
      if (ac) {
        google.maps.event.clearInstanceListeners(ac);
      }
      ac = null;
    };
  }, []);

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }
  };

  return (
    <TextField
      size="small"
      fullWidth
      placeholder={placeholder}
      name={`map-autocomplete-${clearId}`}
      id={`map-search-${clearId}`}
      inputRef={inputRef}
      autoComplete="off"
      inputProps={{ "aria-label": placeholder }}
      InputProps={{
        className: "!bg-white !rounded-2xl !pl-0.5",
        startAdornment: (
          <InputAdornment position="start" className="!ml-1">
            <Search className="h-4 w-4 text-slate-400" aria-hidden />
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end" className="!mr-0.5">
            <button
              type="button"
              onClick={clearInput}
              className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              title={t("mapClearSearch")}
              aria-label={t("mapClearSearch")}
              tabIndex={-1}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </InputAdornment>
        ),
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: 2.5,
          pl: 0.5,
          pr: 0.5,
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgba(15, 23, 42, 0.12)",
        },
        "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "rgb(2, 132, 199)",
          boxShadow: "0 0 0 1px rgba(2, 132, 199, 0.25)",
        },
      }}
    />
  );
};

export default GooglePlacesAutocomplete;
