import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon, DivIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";

const markerIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Live tracking pulse marker
function livePulseIcon() {
  return new DivIcon({
    className: "",
    html: `
      <div style="position:relative;width:20px;height:20px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:rgba(59,130,246,0.3);
          animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
        "></div>
        <div style="
          position:absolute;inset:3px;border-radius:50%;
          background:#3b82f6;border:2px solid white;
        "></div>
      </div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

export interface FieldReport {
  id: number | string;
  latitude: number;
  longitude: number;
  title: string;
  submittedBy: string;
  submittedAt: string;
  status: "submitted" | "approved" | "rejected" | "pending" | string;
}

export interface LiveWorker {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  lastSeen: string;
}

interface FieldReportsMapProps {
  reports: FieldReport[];
  liveWorkers?: LiveWorker[];
  height?: string;
}

// Status colours for report pins
const statusColour: Record<string, string> = {
  approved: "#22c55e",
  rejected: "#ef4444",
  submitted: "#3b82f6",
  pending: "#f59e0b",
};

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Default map center — Uganda
const DEFAULT_CENTER: [number, number] = [1.3733, 32.2903];
const DEFAULT_ZOOM = 6;

export function FieldReportsMap({
  reports,
  liveWorkers = [],
  height = "420px",
}: FieldReportsMapProps) {
  const hasData = reports.length > 0 || liveWorkers.length > 0;

  // Centre on first report if available
  const center: [number, number] =
    reports.length > 0
      ? [reports[0].latitude, reports[0].longitude]
      : DEFAULT_CENTER;

  return (
    <div className="space-y-2">
      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground px-1">
        <span className="font-medium text-foreground">Field Activity Map</span>
        {Object.entries(statusColour).map(([s, colour]) => (
          <span key={s} className="flex items-center gap-1">
            <span
              style={{ background: colour }}
              className="inline-block w-2.5 h-2.5 rounded-full"
            />
            {statusLabel(s)}
          </span>
        ))}
        {liveWorkers.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Live
          </span>
        )}
      </div>

      <div className="rounded-md overflow-hidden border border-border">
        {!hasData ? (
          <div
            style={{ height }}
            className="flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2"
          >
            <MapPin className="h-8 w-8 opacity-30" />
            <p className="text-sm">No field reports with location data yet.</p>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={DEFAULT_ZOOM}
            style={{ height, width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Report pins */}
            {reports.map((report) => (
              <Marker
                key={report.id}
                position={[report.latitude, report.longitude]}
                icon={markerIcon}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-semibold">{report.title}</p>
                    <p className="text-muted-foreground">By: {report.submittedBy}</p>
                    <p className="text-muted-foreground">{report.submittedAt}</p>
                    <span
                      style={{
                        background: statusColour[report.status] || "#6b7280",
                        color: "#fff",
                        padding: "1px 8px",
                        borderRadius: "9999px",
                        fontSize: "11px",
                      }}
                    >
                      {statusLabel(report.status)}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Live worker pins */}
            {liveWorkers.map((worker) => (
              <Marker
                key={`live-${worker.id}`}
                position={[worker.latitude, worker.longitude]}
                icon={livePulseIcon()}
              >
                <Popup>
                  <div className="text-sm space-y-1">
                    <p className="font-semibold">🟢 {worker.name}</p>
                    <p className="text-muted-foreground text-xs">
                      Live — last seen {worker.lastSeen}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {worker.latitude.toFixed(5)}, {worker.longitude.toFixed(5)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>

      <p className="text-xs text-muted-foreground px-1">
        {reports.length} report{reports.length !== 1 ? "s" : ""} with location data
        {liveWorkers.length > 0 && ` · ${liveWorkers.length} worker${liveWorkers.length !== 1 ? "s" : ""} live`}
      </p>
    </div>
  );
}
