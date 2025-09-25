import { useState } from "react";
import styles from "./styles.module.css";

function Recetas({ user }) {
  const [activeTab, setActiveTab] = useState("comunidad");

  return (
    <div className={styles.feedContainer}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "comunidad" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("comunidad")}
        >
          Comunidad
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "mias" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("mias")}
        >
          Mías / Personal
        </button>
      </div>

      <div className={styles.posts}>
        {activeTab === "comunidad" && (
          <>
            <div className={styles.post}>
              <h3>Arroz con pollo</h3>
              <p>Una receta clásica dominicana para compartir en familia 🍗🍚</p>
            </div>
            <div className={styles.post}>
              <h3>Habichuelas con dulce</h3>
              <p>La receta tradicional de Semana Santa en RD 😋</p>
            </div>
          </>
        )}

        {activeTab === "mias" && (
          <>
            <div className={styles.post}>
              <h3>Mi flan especial 🍮</h3>
              <p>Receta secreta con leche condensada y un toque de vainilla.</p>
            </div>
            <div className={styles.post}>
              <h3>Pollo guisado estilo {user.nombre}</h3>
              <p>Con sazón casero y un poco de amor ❤️</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Recetas;
