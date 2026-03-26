import { useState, useEffect } from 'react';
import axios from 'axios';
import './Modulos.css';

const API_BASE_URL = 'https://autos-backend-ea86.onrender.com/api';

// ─── Formulario agregar / editar ─────────────────────────────────────────────
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

// ─── Dashboard principal ──────────────────────────────────────────────────────
function Dashboard() {
  const [autos, setAutos] = useState([]);
  const [citas, setCitas] = useState([]);
  const [adminTab, setAdminTab] = useState("autos");
  const [modoForm, setModoForm] = useState(null);
  const [confirmEliminar, setConfirmEliminar] = useState(null);

  const cargarAutos = () =>
    axios.get(`${API_BASE_URL}/autos`).then(res => setAutos(res.data));

  const cargarCitas = () =>
    axios.get(`${API_BASE_URL}/citas`).then(res => setCitas(res.data));

  useEffect(() => { cargarAutos(); }, []);

  useEffect(() => {
    document.body.style.overflow = confirmEliminar ? 'hidden' : '';
  }, [confirmEliminar]);

  const guardarAuto = async (datos) => {
    try {
      if (modoForm === "agregar") {
        await axios.post(`${API_BASE_URL}/autos`, datos);
      } else {
        await axios.put(`${API_BASE_URL}/autos/${modoForm._id}`, datos);
      }
      await cargarAutos();
      setModoForm(null);
    } catch (error) {
      alert('Error al guardar el auto.');
    }
  };

  const eliminarAuto = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/autos/${id}`);
      await cargarAutos();
      setConfirmEliminar(null);
    } catch (error) {
      alert('Error al eliminar.');
    }
  };

  return (
    <div className="dashboard">
      {/* Tabs */}
      <div className="dashboard-tabs">
        <button
          className={`dash-tab ${adminTab === 'autos' ? 'active' : ''}`}
          onClick={() => setAdminTab('autos')}
        >
          Gestión de Autos
        </button>
        <button
          className={`dash-tab ${adminTab === 'citas' ? 'active' : ''}`}
          onClick={() => { setAdminTab('citas'); cargarCitas(); }}
        >
          Citas Agendadas
        </button>
      </div>

      {/* Tab Autos */}
      {adminTab === 'autos' && (
        <>
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
              <h3 className="form-title">
                {modoForm === "agregar" ? "Agregar nuevo auto" : `Editando: ${modoForm.nombre}`}
              </h3>
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
        </>
      )}

      {/* Tab Citas */}
      {adminTab === 'citas' && (
        <>
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
        </>
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

export default Dashboard;
