import { useState, useEffect } from 'react';
import { auth, provider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import MapaGeolocalizacion from './MapaGeolocalizacion';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [autos, setAutos] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("inventario");
  const [autoSeleccionado, setAutoSeleccionado] = useState(null); // modal

  useEffect(() => {
    axios.get('http://localhost:5000/api/autos').then(res => setAutos(res.data));
  }, []);

  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (autoSeleccionado) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [autoSeleccionado]);

  const loginGoogle = async () => {
    try {
      const resultado = await signInWithPopup(auth, provider);
      const googleUser = resultado.user;
      setUser(googleUser);
      await axios.post('http://localhost:5000/api/usuarios', {
        nombre: googleUser.displayName,
        correo: googleUser.email,
        foto: googleUser.photoURL
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const agendarCita = async (auto) => {
    try {
      const res = await axios.post('http://localhost:5000/api/citas', {
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

  if (!user) {
    return (
      <div className="login-full">
        <div className="login-box">
          <h1 className="login-title">Autos <span className="gold">Seminuevos</span></h1>
          <p className="login-sub">Portal exclusivo de confianza en Tapachula</p>
          <button className="btn-google-simple" onClick={loginGoogle}>
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="papp">
      {/* NAV */}
      <nav className="pnav">
        <div className="pbrand">Autos <span className="gold">Seminuevos</span></div>
        {vista === "inventario" && (
          <div className="search-bar-full">
            <input
              className="psearch"
              type="text"
              placeholder="Buscar por marca, modelo o año..."
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
        )}
        <div className="pnav-right">
          <button className={`pmenu-btn ${vista === "inventario" ? "active" : ""}`} onClick={() => setVista("inventario")}>
            Inventario
          </button>
          <button className={`pmenu-btn ${vista === "mapa" ? "active" : ""}`} onClick={() => setVista("mapa")}>
            Mapa de Tiendas
          </button>
          <span className="puser-name">{user.displayName}</span>
          <button className="pbtn-salir" onClick={() => setUser(null)}>Salir</button>
        </div>
      </nav>

      {/* INVENTARIO */}
      {vista === "inventario" && (
        <>
          <div className="ptitle-sec">
            <h2>Inventario de Seminuevos</h2>
            <div className="pdivider"></div>
            <p className="psubtitle">Mostrando {filtrados.length} vehículos disponibles</p>
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
                  <button className="pcard-btn">
                    Ver más información
                  </button>
                </div>
              </div>
            ))}
          </main>
        </>
      )}

      {/* MAPA */}
      {vista === "mapa" && (
        <div className="mapa-container">
          <div className="ptitle-sec">
            <h2>Mapa de Tiendas</h2>
            <div className="pdivider"></div>
            <p className="psubtitle">Encuentra nuestras sucursales en Tapachula</p>
          </div>
          <div className="mapa-wrapper">
            <MapaGeolocalizacion />
          </div>
        </div>
      )}

      {/* MODAL DE DETALLES */}
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
                <div className="modal-spec">
                  <span className="spec-label">Kilometraje</span>
                  <span className="spec-val">{autoSeleccionado.km || 'N/D'}</span>
                </div>
                <div className="modal-spec">
                  <span className="spec-label">Transmisión</span>
                  <span className="spec-val">{autoSeleccionado.transmision || 'N/D'}</span>
                </div>
                <div className="modal-spec">
                  <span className="spec-label">Motor</span>
                  <span className="spec-val">{autoSeleccionado.motor || 'N/D'}</span>
                </div>
                <div className="modal-spec">
                  <span className="spec-label">Dueños</span>
                  <span className="spec-val">{autoSeleccionado.duenos || 'N/D'}</span>
                </div>
              </div>

              <button className="modal-btn" onClick={() => agendarCita(autoSeleccionado)}>
                Agendar Cotización
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
