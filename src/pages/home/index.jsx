import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import Profile from "../profile";
import Recetas from "../recetas";
import { LogOut, Home as HomeIcon, BookOpen, User, Compass, Star, Share2 } from "lucide-react";

function Home({ user, onLogout }) {
  const [showProfile, setShowProfile] = useState(false);
  const [view, setView] = useState("inicio");

  const [nombre, setNombre] = useState(user.nombre || "");
  const [descripcion, setDescripcion] = useState(user.descripcion || "");
  const [foto, setFoto] = useState(user.avatar || "");
  const [email, setEmail] = useState(user.email || "");

  useEffect(() => {
    if (!user.id) return;

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3001/usuarios/${user.id}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Error al cargar usuario");

        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setFoto(data.foto || "");
        setEmail(data.email || "");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo cargar el perfil",
        });
      }
    };

    fetchUser();
  }, [user]);

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>🍲 Mikens</div>
        <ul className={styles.menu}>
          <li>
            <button
              className={`${styles.linkButton} ${view === "inicio" ? styles.active : ""}`}
              onClick={() => setView("inicio")}
            >
              <HomeIcon size={18} /> Inicio
            </button>
          </li>
          <li>
            <button
              className={`${styles.linkButton} ${view === "recetas" ? styles.active : ""}`}
              onClick={() => setView("recetas")}
            >
              <BookOpen size={18} /> Recetas
            </button>
          </li>
        </ul>

        <div className={styles.userSection}>
          <img
            src={foto || "https://via.placeholder.com/40"}
            alt="User Avatar"
            className={styles.avatar}
            onClick={() => setShowProfile(true)}
          />
          <button onClick={onLogout} className={styles.logoutButton}>
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        {view === "inicio" && (
          <div className={styles.welcomeSection}>
            <div className={styles.banner}>
              <h1 className={styles.welcomeTitle}>
                ¡Bienvenido {nombre}! 👋
              </h1>
              <p className={styles.welcomeText}>
                Aquí podrás descubrir nuevas recetas, guardar tus favoritas y compartir tus propias creaciones con la comunidad.
              </p>
            </div>

            <div className={styles.cardsContainer}>
              <div className={styles.card}>
                <Compass size={28} className={styles.icon} />
                <h3>Explora recetas</h3>
                <p>Descubre una gran variedad de platos de todo el mundo.</p>
              </div>
              <div className={styles.card}>
                <Star size={28} className={styles.icon} />
                <h3>Tus favoritas</h3>
                <p>Guarda recetas para verlas más tarde cuando quieras.</p>
              </div>
              <div className={styles.card}>
                <Share2 size={28} className={styles.icon} />
                <h3>Comparte tu sazón</h3>
                <p>Sube tus propias recetas y deja que otros disfruten tu estilo.</p>
              </div>
            </div>
          </div>
        )}

        {view === "recetas" && <Recetas user={user} />}
      </main>

      {showProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <Profile
              user={{ id: user.id, nombre, descripcion, foto, email }}
            />
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
