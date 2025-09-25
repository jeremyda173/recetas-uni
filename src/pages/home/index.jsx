import { useState } from "react";
import styles from "./styles.module.css";
import Profile from "../profile";

function Home({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>🍲 Recetas App</div>
        <ul className={styles.menu}>
          <li>
            <button className={styles.linkButton}>Inicio</button>
          </li>
          <li>
            <button className={styles.linkButton}>Recetas</button>
          </li>
          <li>
            <button
              className={styles.linkButton}
              onClick={() => setShowProfile(true)}
            >
              Perfil
            </button>
          </li>
        </ul>
        <button onClick={onLogout} className={styles.logoutButton}>
          Cerrar sesión
        </button>
      </nav>

      <main className={styles.main}>
        <h1 className={styles.welcomeTitle}>Bienvenido {user.nombre} 👋</h1>
        <p className={styles.welcomeText}>
          Disfruta explorando y compartiendo recetas.
        </p>
      </main>

      {showProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <Profile user={user} />
            <button
              className={styles.closeButton}
              onClick={() => setShowProfile(false)}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
