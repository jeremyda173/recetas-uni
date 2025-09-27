import { useState, useEffect } from "react";
import SubirReceta from "../recetasSubir";
import styles from "./styles.module.css";

function Recetas({ user }) {
  const [activeTab, setActiveTab] = useState("comunidad");
  const [recetas, setRecetas] = useState([]);
  const [misRecetas, setMisRecetas] = useState([]);
  const [editReceta, setEditReceta] = useState(null); // para abrir modal de edición
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const fetchRecetas = async () => {
    try {
      const response = await fetch("http://localhost:3001/recipes");
      const data = await response.json();

      const mis = data.filter((r) => r.autor?.toLowerCase() === user.nombre.toLowerCase());
      const comunidad = data.filter((r) => r.comunidad);

      setRecetas(comunidad);
      setMisRecetas(mis);
    } catch (error) {
      console.error("Error al obtener recetas:", error);
    }
  };

  useEffect(() => {
    fetchRecetas();
  }, [user]);

  // Abrir modal de edición
  const handleEdit = (receta) => {
    setEditReceta(receta);
    setTitulo(receta.titulo);
    setDescripcion(receta.descripcion);
  };

  // Guardar cambios de edición
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(
        `http://localhost:3001/recipes/${editReceta.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo,
            descripcion,
          }),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar receta");
      await fetchRecetas();
      setEditReceta(null);
    } catch (error) {
      console.error(error);
    }
  };

  // Toggle publicar/ocultar
  const handleTogglePublica = async (receta) => {
    try {
      const response = await fetch(
        `http://localhost:3001/recipes/${receta.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ comunidad: !receta.comunidad }),
        }
      );
      if (!response.ok) throw new Error("Error al actualizar receta");
      await fetchRecetas();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className={styles.feedContainer}>
      {/* Tabs */}
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

      {/* Feed */}
      <div className={styles.posts}>
        {activeTab === "comunidad" && (
          <>
            <SubirReceta user={user} />
            {recetas.map((receta) => (
              <div key={receta.id} className={styles.post}>
                <h3>{receta.titulo}</h3>
                <p>{receta.descripcion}</p>
                <small>Por: {receta.autor}</small>
              </div>
            ))}
          </>
        )}

        {activeTab === "mias" && (
          <>
            {misRecetas.map((receta) => (
              <div key={receta.id} className={styles.post}>
                <h3 onClick={() => handleEdit(receta)}>{receta.titulo}</h3>
                <p>{receta.descripcion}</p>
                <button
                  onClick={() => handleTogglePublica(receta)}
                  className={styles.toggleButton}
                >
                  {receta.comunidad
                    ? "Ocultar de comunidad"
                    : "Publicar en comunidad"}
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Modal de edición */}
      {editReceta && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Editar receta</h3>
            <form onSubmit={handleSave} className={styles.form}>
              <input
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className={styles.input}
              />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                className={styles.textarea}
              ></textarea>
              <button type="submit" className={styles.saveButton}>
                Guardar cambios
              </button>
            </form>
            <button
              className={styles.closeButton}
              onClick={() => setEditReceta(null)}
            >
              ✖ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recetas;
