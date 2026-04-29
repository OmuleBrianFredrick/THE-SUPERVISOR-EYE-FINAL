import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// Fix default marker icon broken by Webpack/Vite
const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface LocationPickerProps {
  value?: Coordinates | null;
  onChange: (coords: Coordinates | null) => void;
}

// Inner component to handle map click events
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (coords: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    },
  });
  return null;
}

export function LocationPicker({ value, onChange }: LocationPickerProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "denied">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [mapReady, setMapReady] = useState(false);

  // Default center — Kampala, Uganda
  const defaultCenter: [number, number] = [0.3476, 32.5825];
  const center: [number, number] = value
    ? [value.latitude, value.longitude]
    : defaultCenter;

  useEffect(() => {
    // Small delay to ensure map container is mounted before Leaflet initialises
    const timer = setTimeout(() => setMapReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  function captureCurrentLocation() {
    if (!navigator.geolocation) {
      setStatus("error");
      setErrorMessage("Your browser does not support GPS location.");
      return;
    }

    setStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setStatus("success");
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setStatus("denied");
          setErrorMessage("Location access was denied. Please allow location in your browser settings, or pin your location on the map manually.");
        } else {
          setStatus("error");
          setErrorMessage("Could not get your location. Try pinning it manually on the map.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  function clearLocation() {
    onChange(null);
    setStatus("idle");
  }

  return (
    <div className="space-y-3">
      {/* GPS capture button */}
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={captureCurrentLocation}
          disabled={status === "loading"}
          className="flex items-center gap-2"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MapPin className="h-4 w-4" />
          )}
          {status === "loading" ? "Getting location..." : "Use My Current Location"}
        </Button>

        {value && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearLocation}
            className="text-muted-foreground text-xs"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Status messages */}
      {status === "success" && value && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle2 className="h-4 w-4" />
          Location captured: {value.latitude.toFixed(5)}, {value.longitude.toFixed(5)}
        </div>
      )}

      {(status === "error" || status === "denied") && (
        <div className="flex items-start gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Map — click to pin location manually */}
      <div className="rounded-md overflow-hidden border border-border">
        <p className="text-xs text-muted-foreground px-3 py-1.5 bg-muted border-b border-border">
          Or click anywhere on the map to pin your location manually
        </p>
        {mapReady && (
          <MapContainer
            center={center}
            zoom={value ? 14 : 6}
            style={{ height: "260px", width: "100%" }}
            key={`${center[0]}-${center[1]}`}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler
              onLocationSelect={(coords) => {
                onChange(coords);
                setStatus("success");
              }}
            />
            {value && (
              <Marker
                position={[value.latitude, value.longitude]}
                icon={markerIcon}
              />
            )}
          </MapContainer>
        )}
      </div>
    </div>
  );
}

