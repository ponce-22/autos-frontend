import { useState, useEffect } from 'react';
import axios from 'axios';
import MapaGeolocalizacion from '../MapaGeolocalizacion';
import './Modulos.css';

const API_BASE_URL = 'https://autos-backend-ea86.onrender.com/api';

function Inventario({ user }) {
  const [autos, setAutos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("inventario");
  const [autoSeleccionado, setAutoSeleccionado] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/autos`).then(res => setAutos(res.data));
  }, []);

  useEffect(() => {
    document.body.style.overflow = autoSeleccionado ? 'hidden' : '';
  }, [autoSeleccionado]);

  const agendarCita = async (auto) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/citas`, {
        autoNombre: auto.nombre,
        nombre: user.displayName,
        telefono: '',
        fecha: new Date().toISOString()
      });
      alert(res.data.mensaje);
      setAutoSeleccionado(null);
    } catch (error) {
      console.error('Error al agendar cita:', error);
      alert('No se pudo agendar la cita. Intenta de nuevo.');
    }
  };

  const filtrados = autos.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <>
      {vista === "inventario" && (
        <>
          <div className="ptitle-sec">
            <h2>Inventario de Seminuevos</h2>
            <div className="pdivider"></div>
            <p className="psubtitle">Mostrando {filtrados.length} vehículos disponibles</p>
          </div>

          {/* Buscador solo en inventario */}
          <div className="inv-search-bar">
            <input
              className="psearch"
              type="text"
              placeholder="Buscar por marca, modelo o año..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>

          <main className="pgrid">
            {filtrados.map(auto => (
              <div className="pcard" key={auto._id} onClick={() => setAutoSeleccionado(auto)}>
                <div className="pcard-img">
                  <img src={auto.imagen} alt={auto.nombre} />
                  <div className="overlay"></div>
                </div>
                <div className="pcard-info">
                  <h3 className="pcard-name">{auto.nombre}</h3>
                  <p className="pcard-carac">{auto.color} · {auto.transmision}</p>
                  <div className="pcard-price">
                    ${auto.precio.toLocaleString()} <span>MXN</span>
                  </div>
                  <button className="pcard-btn">Ver más información</button>
                </div>
              </div>
            ))}
          </main>
        </>
      )}

      {vista === "mapa" && (
        <div className="mapa-container">
          <div className="ptitle-sec">
            <h2>Mapa de Tiendas</h2>
            <div className="pdivider"></div>
            <p className="psubtitle">Encuentra nuestras sucursales</p>
          </div>
          <div className="mapa-wrapper">
            <MapaGeolocalizacion />
          </div>
        </div>
      )}

      {/* Modal detalles */}
      {autoSeleccionado && (
        <div className="modal-overlay" onClick={() => setAutoSeleccionado(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-cerrar" onClick={() => setAutoSeleccionado(null)}>✕</button>
            <div className="modal-img">
              <img src={autoSeleccionado.imagen} alt={autoSeleccionado.nombre} />
            </div>
            <div className="modal-body">
              <div className="modal-header">
                <div>
                  <h2 className="modal-nombre">{autoSeleccionado.nombre}</h2>
                  <p className="modal-sub">{autoSeleccionado.año} · {autoSeleccionado.color}</p>
                </div>
                <div className="modal-precio">
                  ${autoSeleccionado.precio.toLocaleString()}
                  <span>MXN</span>
                </div>
              </div>
              <div className="modal-divider"></div>
              <p className="modal-descripcion">{autoSeleccionado.caracteristicas}</p>
              <div className="modal-specs">
                {[
                  ['Kilometraje', autoSeleccionado.km],
                  ['Transmisión', autoSeleccionado.transmision],
                  ['Motor', autoSeleccionado.motor],
                  ['Dueños', autoSeleccionado.duenos],
                ].map(([label, val]) => (
                  <div className="modal-spec" key={label}>
                    <span className="spec-label">{label}</span>
                    <span className="spec-val">{val || 'N/D'}</span>
                  </div>
                ))}
              </div>
              <button className="modal-btn" onClick={() => agendarCita(autoSeleccionado)}>
                Agendar Cotización
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Inventario;
