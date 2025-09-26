import { useState } from "react";
import styles from "./styles.module.css";

function SubirReceta({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Nueva receta:", { titulo, descripcion, autor: user.nombre });

    setTitulo("");
    setDescripcion("");
    setShowModal(false);
  };

  return (
    <div>
      <button
        className={styles.subirButton}
        onClick={() => setShowModal(true)}
      >
        ➕ Subir receta
      </button>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Subir nueva receta</h3>

            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                type="text"
                placeholder="Título de la receta"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                required
                className={styles.input}
              />
              <textarea
                placeholder="Descripción / pasos"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                className={styles.textarea}
              ></textarea>
              <button type="submit" className={styles.saveButton}>
                Guardar
              </button>
            </form>

            <button
              className={styles.closeButton}
              onClick={() => setShowModal(false)}
            >
              ✖ Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubirReceta;
