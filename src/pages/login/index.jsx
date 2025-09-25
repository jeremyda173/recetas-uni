import { useState } from "react";
import styles from "./styles.module.css";
import Home from "../home";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [user, setUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "login" : "register";

    try {
      const res = await fetch(`http://localhost:3001/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          isLogin ? { email, password } : { nombre, email, password }
        ),
      });

      const data = await res.json();
      if (!res.ok) {
        setMensaje(data.error || `Error en ${isLogin ? "login" : "registro"}`);
        return;
      }

      if (isLogin) {
        setUser(data.user);
        localStorage.setItem("token", data.token);
      } else {
        setMensaje("Registro exitoso 🎉, ahora inicia sesión");
        setIsLogin(true);
      }
    } catch (error) {
      setMensaje("Error de conexión con el servidor");
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setMensaje("Sesión cerrada 🚪");
  };

  if (user) {
    return <Home user={user} onLogout={handleLogout} />;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>🍲 Recetas App</h1>
        <p className={styles.subtitle}>
          {isLogin ? "Inicia sesión para continuar" : "Crea tu cuenta"}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {!isLogin && (
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className={styles.input}
            />
          )}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
          />

          <button type="submit" className={styles.button}>
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </button>
        </form>

        <p className={styles.registerText}>
          {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <span
            onClick={() => setIsLogin(!isLogin)}
            className={styles.registerLink}
          >
            {isLogin ? "Regístrate aquí" : "Inicia sesión"}
          </span>
        </p>

        {mensaje && <p className={styles.message}>{mensaje}</p>}
      </div>
    </div>
  );
}

export default Auth;
