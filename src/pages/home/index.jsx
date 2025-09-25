import styles from "./styles.module.css";

function Home({ user, onLogout }) {
  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logo}>🍲 Recetas App</div>
        <ul className={styles.menu}>
          <li><a href="#">Inicio</a></li>
          <li><a href="#">Recetas</a></li>
          <li><a href="#">Perfil</a></li>
        </ul>
        <button onClick={onLogout} className={styles.logoutButton}>
          Cerrar sesión
        </button>
      </nav>

      <main className={styles.main}>
        <h1>Bienvenido {user.nombre} 👋</h1>
        <p>Disfruta explorando y compartiendo recetas.</p>
      </main>
    </div>
  );
}

export default Home;
