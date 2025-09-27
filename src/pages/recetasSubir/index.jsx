import { useState } from "react";
import styles from "./styles.module.css";

function SubirReceta({ user, token }) {
  const [showModal, setShowModal] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:3001/upload/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          titulo,
          descripcion,
          autor: user.nombre,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.error || "Error al subir la receta");
        return;
      }

      setMensaje(data.message);
      setTitulo("");
      setDescripcion("");
      setShowModal(false);
    } catch (error) {
      console.error("Error:", error);
      setMensaje("Error de conexión con el servidor");
    }
  };

  return (
    <div>
      <button className={styles.subirButton} onClick={() => setShowModal(true)}>
        ➕ Subir receta
      </button>

      {mensaje && <p>{mensaje}</p>}

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
