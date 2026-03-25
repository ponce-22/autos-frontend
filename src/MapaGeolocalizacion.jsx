import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const iconoTienda = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const TIENDAS = [
  {
    nombre: "Seminuevos Tapachula Norte",
    direccion: "Av. Central Norte 1204, Tapachula",
    horario: "Lun–Sab 9:00–19:00",
    coords: [14.9150, -92.2600],
  },
  {
    nombre: "Seminuevos Tapachula Sur",
    direccion: "Blvd. Costero 450, Tapachula",
    horario: "Lun–Sab 9:00–18:00",
    coords: [14.8950, -92.2750],
  },
];

function VolarAUbicacion({ posicion }) {
  const map = useMap();
  useEffect(() => {
    if (posicion) {
      map.flyTo([posicion.lat, posicion.lng], 16);
    }
  }, [posicion, map]);
  return null;
}

const MapaGeolocalizacion = () => {
  const [posicion, setPosicion] = useState(null);
  const [estado, setEstado] = useState("idle"); // idle | localizando | ok | error
  const [mensajeError, setMensajeError] = useState("");

  const obtenerUbicacion = () => {
    if (!navigator.geolocation) {
      setEstado("error");
      setMensajeError("Tu navegador no soporta geolocalización");
      return;
    }

    setEstado("localizando");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosicion({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setEstado("ok");
      },
      (err) => {
        setEstado("error");
        setMensajeError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div style={{ height: '100%', width: '100%', position: 'relative' }}>

      {/* Botón flotante */}
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        gap: '0.5rem'
      }}>
        <button
          onClick={obtenerUbicacion}
          style={{
            background: '#0a0a0a',
            border: '0.5px solid #c9a84c',
            color: '#c9a84c',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '0.75rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            padding: '0.6rem 1.2rem',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
          }}
        >
          {estado === "localizando" ? "Localizando..." : "Obtener mi ubicación"}
        </button>

        {estado === "error" && (
          <span style={{ color: '#c0392b', fontSize: '0.75rem', letterSpacing: '0.1em' }}>
            {mensajeError}
          </span>
        )}
      </div>

      <MapContainer
        center={[14.9050, -92.2650]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        <VolarAUbicacion posicion={posicion} />

        {posicion && (
          <Marker position={[posicion.lat, posicion.lng]}>
            <Popup>
              <div style={{ textAlign: 'center', fontFamily: 'serif' }}>
                <strong>Tu ubicación</strong><br />
                {`${posicion.lat.toFixed(5)}, ${posicion.lng.toFixed(5)}`}
              </div>
            </Popup>
          </Marker>
        )}

        {TIENDAS.map((t, i) => (
          <Marker key={i} position={t.coords} icon={iconoTienda}>
            <Popup>
              <div style={{ fontFamily: 'serif', minWidth: '160px' }}>
                <strong style={{ color: '#c9a84c' }}>{t.nombre}</strong><br />
                <span style={{ fontSize: '0.85rem', color: '#555' }}>{t.direccion}</span><br />
                <span style={{ fontSize: '0.8rem', color: '#888' }}>{t.horario}</span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapaGeolocalizacion;