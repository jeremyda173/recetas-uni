import { useState } from "react";
import styles from "./styles.module.css";
import Profile from "../profile";
import Recetas from "../recetas";

function Home({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState("inicio");

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>🍲 Recetas App</div>
        <ul className={styles.menu}>
          <li>
            <button
              className={styles.linkButton}
              onClick={() => setView("inicio")}
            >
              Inicio
            </button>
          </li>
          <li>
            <button
              className={styles.linkButton}
              onClick={() => setView("recetas")}
            >
              Recetas
            </button>
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
        {view === "inicio" && (
          <>
            <h1 className={styles.welcomeTitle}>Bienvenido {user.nombre} 👋</h1>
            <p className={styles.welcomeText}>
              Disfruta explorando y compartiendo recetas.
            </p>
          </>
        )}
        {view === "recetas" && <Recetas user={user} />}
      </main>

      {showProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <Profile user={user} />
            <button
              className={styles.closeButton}
              onClick={() => setShowProfile(false)}
            >
              ✖ Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
