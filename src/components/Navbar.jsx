import './Modulos.css';

function Navbar({ user, isAdmin, vista, setVista, onLogout }) {
  return (
    <nav className="pnav">
      <div className="pbrand">Autos <span className="gold">Seminuevos</span></div>

      {isAdmin && (
        <div className="admin-badge">Panel Administrador</div>
      )}

      {!isAdmin && vista === "inventario" && (
        <div className="search-bar-full">
          <input
            className="psearch"
            type="text"
            placeholder="Buscar por marca, modelo o año..."
            onChange={(e) => {/* manejado en Inventario */}}
          />
        </div>
      )}

      <div className="pnav-right">
        {!isAdmin && (
          <>
            <button
              className={`pmenu-btn ${vista === "inventario" ? "active" : ""}`}
              onClick={() => setVista("inventario")}
            >
              Inventario
            </button>
            <button
              className={`pmenu-btn ${vista === "mapa" ? "active" : ""}`}
              onClick={() => setVista("mapa")}
            >
              Mapa de Tiendas
            </button>
          </>
        )}
        <span className="puser-name">{user.displayName}</span>
        <button className="pbtn-salir" onClick={onLogout}>Salir</button>
      </div>
    </nav>
  );
}

export default Navbar;
