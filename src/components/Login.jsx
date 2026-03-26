import { auth, provider } from '../firebaseConfig';
import { signInWithPopup } from 'firebase/auth';
import axios from 'axios';
import './Login.css';

const API_BASE_URL = 'https://autos-backend-ea86.onrender.com/api';

function Login({ onLogin }) {
  const loginGoogle = async () => {
    try {
      const resultado = await signInWithPopup(auth, provider);
      const googleUser = resultado.user;

      await axios.post(`${API_BASE_URL}/usuarios`, {
        nombre: googleUser.displayName,
        correo: googleUser.email,
        foto: googleUser.photoURL
      });

      onLogin(googleUser);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
    }
  };

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

export default Login;
