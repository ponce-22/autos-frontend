import { useState } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Inventario from './components/Inventario';
import Dashboard from './components/Dashboard';
import MapaGeolocalizacion from './MapaGeolocalizacion';
import './App.css';

const ADMIN_EMAIL = 'juanescobar2006728@gmail.com';

function App() {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [vista, setVista] = useState("inventario");

  const handleLogin = (googleUser) => {
    const admin = googleUser.email === ADMIN_EMAIL;
    setUser(googleUser);
    setIsAdmin(admin);
    if (admin) setVista("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setIsAdmin(false);
    setVista("inventario");
  };

  if (!user) return <Login onLogin={handleLogin} />;

  return (
    <div className="papp">
      <Navbar
        user={user}
        isAdmin={isAdmin}
        vista={vista}
        setVista={setVista}
        onLogout={handleLogout}
      />

      {isAdmin && <Dashboard />}

      {!isAdmin && vista === "inventario" && <Inventario user={user} />}

      {!isAdmin && vista === "mapa" && (
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
    </div>
  );
}

export default App;
