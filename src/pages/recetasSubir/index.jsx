import { useState, useEffect } from "react";
import { 
  Plus, 
  ChefHat, 
  Clock, 
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Lock,
  Globe
} from "lucide-react";
import styles from "./styles.module.css";

function SubirReceta({ user, token }) {
  const [showModal, setShowModal] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [mensajeType, setMensajeType] = useState("");
  const [misRecetas, setMisRecetas] = useState([]);
  const [selectedReceta, setSelectedReceta] = useState(null);
  const [modalMode, setModalMode] = useState("new");

  useEffect(() => {
    if (user?.nombre) {
      fetchMisRecetas();
    }
  }, [user]);

  const fetchMisRecetas = async () => {
    try {
      const response = await fetch("http://localhost:3001/recipes");
      const data = await response.json();
      // Filtrar solo las recetas del usuario actual
      const miasRecetas = data.filter((r) => 
        r.autor?.toLowerCase() === user.nombre.toLowerCase()
      );
      setMisRecetas(miasRecetas);
    } catch {
    }
  };

  const handlePublishReceta = async () => {
    if (!selectedReceta) return;

    try {
      const response = await fetch(`http://localhost:3001/recipes/${selectedReceta.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          comunidad: true 
        }),
      });

      if (!response.ok) {
        throw new Error("Error al publicar la receta");
      }

      setMensaje("¡Receta publicada exitosamente en la comunidad!");
      setMensajeType("success");
      
      // Actualizar la lista de recetas
      await fetchMisRecetas();
      
      setTimeout(() => {
        setShowModal(false);
        setMensaje("");
        setMensajeType("");
        setSelectedReceta(null);
      }, 2000);

    } catch (error) {
      setMensaje(error.message || "Error al publicar la receta");
      setMensajeType("error");
    }
  };

  const resetForm = () => {
    setMensaje("");
    setMensajeType("");
    setSelectedReceta(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
    setModalMode("new");
  };

  const openModal = () => {
    setShowModal(true);
    fetchMisRecetas();
  };

  return (
    <div className={styles.uploadContainer}>
      {/* Botones para compartir */}
      <div className={styles.actionButtons}>
        <button 
          className={styles.uploadBtn}
          onClick={() => {
            setModalMode("new");
            openModal();
          }}
        >
          <Plus size={18} />
          Nueva Receta
        </button>
        {misRecetas.filter(r => !r.comunidad).length > 0 && (
          <button 
            className={styles.selectBtn}
            onClick={() => {
              setModalMode("select");
              openModal();
            }}
          >
            <BookOpen size={18} />
            Publicar Existente
          </button>
        )}
      </div>

      {/* Modal común para ambos modos */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div className={styles.headerIcon}>
                <ChefHat size={24} />
              </div>
              <h3 className={styles.modalTitle}>
                Publicar Receta Privada
              </h3>
              <button
                className={styles.closeBtn}
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            <div className={styles.selectForm}>
              <div className={styles.selectionInstructions}>
                <p>Selecciona una de tus recetas privadas y publícala en la comunidad</p>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <BookOpen size={14} />
                  Mis Recetas Privadas
                </label>
                <select
                  value={selectedReceta?.id || ''}
                  onChange={(e) => {
                    const recetaId = e.target.value;
                    const receta = misRecetas.find(r => r.id === parseInt(recetaId));
                    setSelectedReceta(receta || null);
                  }}
                  className={styles.select}
                >
                  <option value={''}>-- Selecciona una receta para publicar --</option>
                  {misRecetas.filter(r => !r.comunidad).map((receta) => (
                    <option key={receta.id} value={receta.id}>
                      {receta.titulo} {receta.tiempo ? `(${receta.tiempo})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Vista previa de la receta seleccionada */}
              {selectedReceta && (
                <div className={styles.selectedRecipePreview}>
                  <h4 className={styles.previewTitle}>
                    Receta a Publicar:
                  </h4>
                  <div className={styles.previewCard}>
                    <div className={styles.previewHeader}>
                      <ChefHat size={20} />
                      <div className={styles.previewInfo}>
                        <h5 className={styles.previewRecipeTitle}>{selectedReceta.titulo}</h5>
                        {selectedReceta.tiempo && (
                          <div className={styles.previewTime}>
                            <Clock size={12} />
                            <span>{selectedReceta.tiempo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.previewDescription}>
                      <p>{selectedReceta.descripcion}</p>
                    </div>
                    <div className={styles.publicationNotice}>
                      <Globe size={14} />
                      <span>Esta receta será visible para toda la comunidad</span>
                    </div>
                  </div>
                </div>
              )}

              {misRecetas.filter(r => !r.comunidad).length === 0 && (
                <div className={styles.noRecipes}>
                  <Lock size={48} />
                  <h4>No tienes recetas privadas</h4>
                  <p>Todas tus recetas ya están publicadas en la comunidad</p>
                </div>
              )}

              {/* Mensaje de estado */}
              {mensaje && (
                <div className={`${styles.message} ${styles[mensajeType]}`}>
                  {mensajeType === "success" ? (
                    <CheckCircle size={16} />
                  ) : (
                    <AlertCircle size={16} />
                  )}
                  <span>{mensaje}</span>
                </div>
              )}

              {/* Acciones del formulario */}
              {misRecetas.filter(r => !r.comunidad).length > 0 && (
                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={closeModal}
                    className={styles.cancelBtn}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="button"
                    onClick={handlePublishReceta}
                    className={styles.submitBtn}
                    disabled={!selectedReceta}
                  >
                    <Globe size={16} />
                    Publicar en Comunidad
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SubirReceta;