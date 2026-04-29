import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface ReportMapProps {
  latitude: number;
  longitude: number;
  reportTitle?: string;
  submittedBy?: string;
  submittedAt?: string;
}

export function ReportMap({
  latitude,
  longitude,
  reportTitle,
  submittedBy,
  submittedAt,
}: ReportMapProps) {
  const position: [number, number] = [latitude, longitude];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        <span>
          Report submitted from: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </span>
      </div>

      <div className="rounded-md overflow-hidden border border-border">
        <MapContainer
          center={position}
          zoom={14}
          style={{ height: "280px", width: "100%" }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={markerIcon}>
            <Popup>
              <div className="text-sm space-y-1">
                {reportTitle && <p className="font-semibold">{reportTitle}</p>}
                {submittedBy && <p className="text-muted-foreground">By: {submittedBy}</p>}
                {submittedAt && <p className="text-muted-foreground">{submittedAt}</p>}
                <p className="text-xs text-muted-foreground">
                  {latitude.toFixed(5)}, {longitude.toFixed(5)}
                </p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
}
