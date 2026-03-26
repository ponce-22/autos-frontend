import { useState, useEffect } from 'react';
import { auth, provider } from './firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import MapaGeolocalizacion from './MapaGeolocalizacion';
import './App.css';

const ADMIN_EMAIL = 'juanescobar2006728@gmail.com';
const API = 'https://autos-backend-ea86.onrender.com/api';

// ─── FORMULARIO DE AUTO (agregar / editar) ───────────────────────────────────
function FormAuto({ inicial, onGuardar, onCancelar }) {
  const vacio = {
    nombre: '', año: '', precio: '', caracteristicas: '',
    km: '', transmision: '', color: '', duenos: '', motor: '', imagen: ''
  };
  const [form, setForm] = useState(inicial || vacio);

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = e => {
    e.preventDefault();
    onGuardar({ ...form, precio: Number(form.precio), año: Number(form.año) });
  };

  return (
    <form className="form-auto" onSubmit={submit}>
      <div className="form-grid">
        {[
          ['nombre', 'Nombre del auto'],
          ['año', 'Año'],
          ['precio', 'Precio (MXN)'],
          ['color', 'Color'],
          ['transmision', 'Transmisión'],
          ['km', 'Kilometraje'],
          ['motor', 'Motor'],
          ['duenos', 'Dueños anteriores'],
          ['imagen', 'URL de imagen'],
        ].map(([name, label]) => (
          <div className="form-field" key={name}>
            <label className="form-label">{label}</label>
            <input
              className="form-input"
              name={name}
              value={form[name]}
              onChange={handle}
              required={['nombre', 'precio', 'imagen'].includes(name)}
            />
          </div>
        ))}
        <div className="form-field form-field--full">
          <label className="form-label">Descripción / Características</label>
          <textarea
            className="form-input form-textarea"
            name="caracteristicas"
            value={form.caracteristicas}
            onChange={handle}
          />
        </div>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary">Guardar</button>
        <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

// ─── APP PRINCIPAL ────────────────────────────────────────────────────────────
function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [autos, setAutos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("inventario");
  const [adminTab, setAdminTab] = useState("autos"); // "autos" | "citas"
  const [autoSeleccionado, setAutoSeleccionado] = useState(null);
  const [modoForm, setModoForm] = useState(null); // null | "agregar" | auto objeto
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargarAutos = () =>
    axios.get(`${API}/autos`).then(res => setAutos(res.data));

  const cargarCitas = () =>
    axios.get(`${API}/citas`).then(res => setCitas(res.data));

  useEffect(() => { cargarAutos(); }, []);

  useEffect(() => {
    if (autoSeleccionado) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
  }, [autoSeleccionado]);

  // ── Login ──
  const loginGoogle = async () => {
    try {
      const resultado = await signInWithPopup(auth, provider);
      const googleUser = resultado.user;
      const admin = googleUser.email === ADMIN_EMAIL;
      setUser(googleUser);
      setIsAdmin(admin);
      if (admin) {
        setVista("dashboard");
        cargarCitas();
      }
      await axios.post(`${API}/usuarios`, {
        nombre: googleUser.displayName,
        correo: googleUser.email,
        foto: googleUser.photoURL
      });
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setVista("inventario");
  };

  // ── Citas ──
  const agendarCita = async (auto) => {
    try {
      const res = await axios.post(`${API}/citas`, {
        autoNombre: auto.nombre,
        nombre: user.displayName,
        telefono: '',
        fecha: new Date().toISOString()
      });
      alert(res.data.mensaje);
      setAutoSeleccionado(null);
    } catch (error) {
      alert('No se pudo agendar la cita.');
    }
  };

  // ── CRUD Autos ──
  const guardarAuto = async (datos) => {
    try {
      if (modoForm === "agregar") {
        await axios.post(`${API}/autos`, datos);
      } else {
        await axios.put(`${API}/autos/${modoForm._id}`, datos);
      }
      await cargarAutos();
      setModoForm(null);
    } catch (error) {
      alert('Error al guardar el auto.');
    }
  };

  const eliminarAuto = async (id) => {
    try {
      await axios.delete(`${API}/autos/${id}`);
      await cargarAutos();
      setConfirmEliminar(null);
    } catch (error) {
      alert('Error al eliminar.');
    }
  };

  const filtrados = autos.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  // ── LOGIN SCREEN ──
  if (!user) {
    return (
      <div className="login-full">
        <div className="login-box">
          <h1 className="login-title">Autos <span className="gold">Seminuevos</span></h1>
          <p className="login-sub">Portal exclusivo de confianza</p>
          <button className="btn-google-simple" onClick={loginGoogle}>
            Iniciar sesión con Google
          </button>
        </div>
      </div>
    );
  }

  // ── DASHBOARD ADMIN ──
  if (isAdmin && vista === "dashboard") {
    return (
      <div className="papp">
        <nav className="pnav">
          <div className="pbrand">Autos <span className="gold">Seminuevos</span></div>
          <div className="admin-badge">Panel Administrador</div>
          <div className="pnav-right">
            <button className={`pmenu-btn ${adminTab === 'autos' ? 'active' : ''}`} onClick={() => setAdminTab('autos')}>
              Gestión de Autos
            </button>
            <button className={`pmenu-btn ${adminTab === 'citas' ? 'active' : ''}`} onClick={() => { setAdminTab('citas'); cargarCitas(); }}>
              Citas
            </button>
            <span className="puser-name">{user.displayName}</span>
            <button className="pbtn-salir" onClick={logout}>Salir</button>
          </div>
        </nav>

        {/* ── TAB: AUTOS ── */}
        {adminTab === 'autos' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div>
                <h2 className="dashboard-title">Gestión de Autos</h2>
                <p className="dashboard-sub">{autos.length} vehículos en inventario</p>
              </div>
              <button className="btn-primary" onClick={() => setModoForm("agregar")}>
                + Agregar Auto
              </button>
            </div>

            {modoForm && (
              <div className="form-container">
                <h3 className="form-title">{modoForm === "agregar" ? "Agregar nuevo auto" : `Editando: ${modoForm.nombre}`}</h3>
                <FormAuto
                  inicial={modoForm !== "agregar" ? modoForm : null}
                  onGuardar={guardarAuto}
                  onCancelar={() => setModoForm(null)}
                />
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Auto</th>
                    <th>Año</th>
                    <th>Precio</th>
                    <th>KM</th>
                    <th>Transmisión</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {autos.map(auto => (
                    <tr key={auto._id}>
                      <td>
                        <div className="table-auto-name">{auto.nombre}</div>
                        <div className="table-auto-color">{auto.color}</div>
                      </td>
                      <td>{auto.año || '—'}</td>
                      <td className="table-price">${auto.precio?.toLocaleString()}</td>
                      <td>{auto.km || '—'}</td>
                      <td>{auto.transmision || '—'}</td>
                      <td>
                        <div className="table-actions">
                          <button className="btn-edit" onClick={() => setModoForm(auto)}>Editar</button>
                          <button className="btn-delete" onClick={() => setConfirmEliminar(auto)}>Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── TAB: CITAS ── */}
        {adminTab === 'citas' && (
          <div className="dashboard">
            <div className="dashboard-header">
              <div>
                <h2 className="dashboard-title">Citas Agendadas</h2>
                <p className="dashboard-sub">{citas.length} citas en total</p>
              </div>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Cliente</th>
                    <th>Auto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.length === 0 && (
                    <tr><td colSpan={3} className="table-empty">No hay citas aún</td></tr>
                  )}
                  {citas.map(cita => (
                    <tr key={cita._id}>
                      <td>{cita.nombre}</td>
                      <td>{cita.autoNombre}</td>
                      <td>{new Date(cita.createdAt).toLocaleDateString('es-MX', {
                        year: 'numeric', month: 'long', day: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Confirmar eliminar */}
        {confirmEliminar && (
          <div className="modal-overlay" onClick={() => setConfirmEliminar(null)}>
            <div className="confirm-box" onClick={e => e.stopPropagation()}>
              <h3 className="confirm-title">¿Eliminar este auto?</h3>
              <p className="confirm-sub">{confirmEliminar.nombre}</p>
              <div className="confirm-actions">
                <button className="btn-delete" onClick={() => eliminarAuto(confirmEliminar._id)}>Sí, eliminar</button>
                <button className="btn-secondary" onClick={() => setConfirmEliminar(null)}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── VISTA CLIENTE ──
  return (
    <div className="papp">
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
          <button className="pbtn-salir" onClick={logout}>Salir</button>
        </div>
      </nav>

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
                  <div className="pcard-price">${auto.precio?.toLocaleString()} <span>MXN</span></div>
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
          <div className="mapa-wrapper"><MapaGeolocalizacion /></div>
        </div>
      )}

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
                  ${autoSeleccionado.precio?.toLocaleString()}
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
    </div>
  );
}

export default App;
