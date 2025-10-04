import { useState, useEffect } from "react";
import { 
  Clock, 
  Users, 
  MessageCircle, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  PenTool,
  ChefHat,
  User,
  Calendar,
  Tag,
  Bookmark
} from "lucide-react";
import SubirReceta from "../recetasSubir";
import styles from "./styles.module.css";

function Recetas({ user }) {
  const [activeTab, setActiveTab] = useState("comunidad");
  const [recetas, setRecetas] = useState([]);
  const [misRecetas, setMisRecetas] = useState([]);
  const [editReceta, setEditReceta] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [formTitulo, setFormTitulo] = useState("");
  const [formDescripcion, setFormDescripcion] = useState("");
  const [formTiempo, setFormTiempo] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [recipeStats, setRecipeStats] = useState({});

  const fetchRecetas = async () => {
    try {
      const response = await fetch("http://localhost:3001/recipes");
      const data = await response.json();

      const mis = data.filter((r) => r.autor?.toLowerCase() === user.nombre.toLowerCase());
      const comunidad = data.filter((r) => r.comunidad);

      setRecetas(comunidad);
      setMisRecetas(mis);

      // Cargar estadísticas para cada receta
      const statsPromises = comunidad.map(async (receta) => {
        const stats = await getRealStats(receta.id);
        return { recipeId: receta.id, stats };
      });
      
      const statsResults = await Promise.all(statsPromises);
      const statsMap = statsResults.reduce((acc, { recipeId, stats }) => {
        acc[recipeId] = stats;
        return acc;
      }, {});
      
      setRecipeStats(statsMap);
    } catch {
      // Handle error silently
    }
  };

  useEffect(() => {
    fetchRecetas();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleEdit = (receta) => {
    setFormMode("edit");
    setEditReceta(receta);
    setFormTitulo(receta.titulo);
    setFormDescripcion(receta.descripcion || "");
    setFormTiempo(receta.tiempo || "");
    setShowForm(true);
  };


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
    } catch {
      // Handle error silently
    }
  };

  const handleDelete = async (recetaId) => {
    try {
      const response = await fetch(
        `http://localhost:3001/recipes/${recetaId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Error al eliminar receta");
      await fetchRecetas();
      setShowDeleteConfirm(null);
    } catch {
      // Handle error silently
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formMode === "create") {
        const response = await fetch("http://localhost:3001/recipes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: formTitulo,
            descripcion: formDescripcion,
            tiempo: formTiempo,
            autor: user.nombre,
            comunidad: false
          }),
        });
        
        if (!response.ok) throw new Error("Error al crear receta");
        
      } else if (formMode === "edit") {
        const response = await fetch(`http://localhost:3001/recipes/${editReceta.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: formTitulo,
            descripcion: formDescripcion,
            tiempo: formTiempo
          }),
        });
        
        if (!response.ok) throw new Error("Error al actualizar receta");
      }
      
      await fetchRecetas();
      handleCloseForm();
      
    } catch {
      // Handle error silently
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditReceta(null);
    setFormTitulo("");
    setFormDescripcion("");
    setFormTiempo("");
    setFormMode("create");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRealStats = async (recipeId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments/${recipeId}`);
      const commentCount = response.ok ? (await response.json()).length : 0;
      
      // Por ahora, vamos a usar el ID de la receta como base para generar vistas
      // En un futuro esto podría venir de una tabla de estadísticas
      const views = Math.floor((recipeId || 1) * 47 + Math.random() * 50);
      
      return {
        views,
        comments: commentCount
      };
    } catch {
      return {
        views: Math.floor(Math.random() * 100) + 20,
        comments: 0
      };
    }
  };

  const fetchComments = async (recipeId) => {
    try {
      const response = await fetch(`http://localhost:3001/comments/${recipeId}`);
      const data = await response.json();
      if (response.ok) {
        setComments(data);
      } else {
        setComments([]);
      }
    } catch {
      setComments([]);
    }
  };

  const handleShowComments = (recipe) => {
    setSelectedRecipe(recipe);
    setShowComments(true);
    fetchComments(recipe.id);
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedRecipe) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch('http://localhost:3001/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipeId: selectedRecipe.id,
          comentario: newComment.trim()
        })
      });

      if (!response.ok) {
        return;
      }

      if (response.ok) {
        setNewComment("");
        const data = await response.json();
        setComments(prev => [...prev, data]);
        
        // Actualizar estadísticas después de agregar comentario
        const updatedStats = await getRealStats(selectedRecipe.id);
        setRecipeStats(prev => ({
          ...prev,
          [selectedRecipe.id]: updatedStats
        }));
      }
    } catch {
      // Handle error silently
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`http://localhost:3001/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return;
      }

      if (response.ok) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        
        // Actualizar estadísticas después de eliminar comentario
        if (selectedRecipe) {
          const updatedStats = await getRealStats(selectedRecipe.id);
          setRecipeStats(prev => ({
            ...prev,
            [selectedRecipe.id]: updatedStats
          }));
        }
      }
    } catch {
      // Handle error silently
    }
  };

  return (
    <div className={styles.recipesContainer}>
      {/* Header con tabs */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h2 className={styles.title}>
            <ChefHat size={24} />
            Mi Cocina Digital
          </h2>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${
                activeTab === "comunidad" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("comunidad")}
            >
              <Users size={16} />
              Comunidad
            </button>
            <button
              className={`${styles.tab} ${
                activeTab === "mias" ? styles.active : ""
              }`}
              onClick={() => setActiveTab("mias")}
            >
              <Bookmark size={16} />
              Mis Recetas
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className={styles.content}>
        {activeTab === "comunidad" && (
          <div className={styles.feed}>
            <SubirReceta user={user} />
            
            {recetas.length === 0 ? (
              <div className={styles.emptyState}>
                <ChefHat size={48} />
                <h3>¡Explora nuevas recetas!</h3>
                <p>Comparte tu primera receta para inspirar a otros chefs</p>
              </div>
            ) : (
              <div className={styles.recipesGrid}>
                {recetas.map((receta) => {
                  const stats = recipeStats[receta.id] || { views: 0, comments: 0 };
                  return (
                    <article key={receta.id} className={styles.recipeCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.recipeImage}>
                          <ChefHat size={32} />
                        </div>
                        <div className={styles.recipeInfo}>
                          <h3 className={styles.recipeTitle}>{receta.titulo}</h3>
                          <div className={styles.authorContainer}>
                            <div className={styles.author}>
                              <User size={14} />
                              <span>{receta.autor}</span>
                            </div>
                            <span className={styles.date}>
                              <Calendar size={12} />
                              {formatDate(new Date())}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={styles.description}>
                        <p>{receta.descripcion}</p>
                      </div>

                      <div className={styles.cardFooter}>
                        <div className={styles.stats}>
                          <div className={styles.stat}>
                            <Eye size={14} />
                            <span>{stats.views}</span>
                          </div>
                          <div className={styles.stat} onClick={() => handleShowComments(receta)}>
                            <MessageCircle size={14} />
                            <span>{stats.comments}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "mias" && (
          <div className={styles.myRecipes}>
            <div className={styles.myRecipesHeader}>
              <h3>Gestiona tus recetas</h3>
              <div className={styles.headerActions}>
                <span className={styles.count}>{misRecetas.length} recetas</span>
        <button 
          className={styles.createBtn}
          onClick={() => {
            setFormMode("create");
            setShowForm(true);
          }}
        >
          <PenTool size={16} />
          Nueva Receta
        </button>
              </div>
            </div>

            {misRecetas.length === 0 ? (
              <div className={styles.emptyState}>
                <PenTool size={48} />
                <h3>¡Crea tu primera receta!</h3>
                <p>Comparte tus conocimientos culinarios con la comunidad</p>
                <button 
                  className={styles.emptyCreateBtn}
                  onClick={() => {
                    setFormMode("create");
                    setShowForm(true);
                  }}
                >
                  <PenTool size={16} />
                  Crear Mi Primera Receta
                </button>
              </div>
            ) : (
              <div className={styles.myRecipesGrid}>
                {misRecetas.map((receta) => {
                  const stats = recipeStats[receta.id] || { views: 0, comments: 0 };
                  return (
                    <article key={receta.id} className={styles.myRecipeCard}>
                      <div className={styles.cardHeader}>
                        <div className={styles.recipeImage}>
                          <ChefHat size={24} />
                        </div>
                        <div className={styles.recipeStatus}>
                          <div className={`${styles.statusBadge} ${
                            receta.comunidad ? styles.public : styles.private
                          }`}>
                            {receta.comunidad ? (
                              <>
                                <Eye size={12} />
                                Pública
                              </>
                            ) : (
                              <>
                                <EyeOff size={12} />
                                Privada
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className={styles.recipeContent}>
                        <h4 className={styles.recipeTitle}>{receta.titulo}</h4>
                        <p className={styles.description}>{receta.descripcion}</p>
                        
                        <div className={styles.stats}>
                          <div className={styles.stat}>
                            <Eye size={14} />
                            {stats.views} vistas
                          </div>
                          <div className={styles.stat}>
                            <Users size={14} />
                            {stats.comments} comentarios
                          </div>
                        </div>
                      </div>

                      <div className={styles.cardActions}>
                        <button 
                          onClick={() => handleEdit(receta)}
                          className={styles.actionBtn}
                          title="Editar receta"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleTogglePublica(receta)}
                          className={`${styles.actionBtn} ${styles.toggleBtn}`}
                          title={receta.comunidad ? "Ocultar" : "Publicar"}
                        >
                          {receta.comunidad ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(receta)}
                          className={`${styles.actionBtn} ${styles.deleteBtn}`}
                          title="Eliminar receta"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>


      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal}>
            <div className={styles.confirmContent}>
              <div className={styles.confirmIcon}>
                <Trash2 size={48} />
              </div>
              <h3>¿Eliminar receta?</h3>
              <p>Esta acción no se puede deshacer. La receta será permanentemente eliminada.</p>
              
              <div className={styles.confirmActions}>
                <button
                  onClick={() => handleDelete(showDeleteConfirm.id)}
                  className={styles.confirmDeleteBtn}
                >
                  <Trash2 size={16} />
                  Eliminar
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className={styles.confirmCancelBtn}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal unificado para crear/editar */}
      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>
                {formMode === "create" ? "Crear Nueva Receta" : "Editar Receta"}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={handleCloseForm}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.editForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>Título de la receta</label>
                <input
                  type="text"
                  value={formTitulo}
                  onChange={(e) => setFormTitulo(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: Pasta Italiana Casera"
                  required
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Tiempo de preparación</label>
                <input
                  type="text"
                  value={formTiempo}
                  onChange={(e) => setFormTiempo(e.target.value)}
                  className={styles.input}
                  placeholder="Ej: 30 minutos, 1 hora, 45 min"
                />
              </div>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>Descripción y pasos</label>
                <textarea
                  value={formDescripcion}
                  onChange={(e) => setFormDescripcion(e.target.value)}
                  className={styles.textarea}
                  placeholder="Describe los ingredientes y pasos para preparar tu receta..."
                  rows={6}
                  required
                />
              </div>

              {formMode === "create" && (
                <div className={styles.createFormNote}>
                  <p>
                    <ChefHat size={16} />
                    Tu receta será creada como privada inicialmente. Puedes hacerla pública desde "Mis Recetas".
                  </p>
                </div>
              )}

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveBtn}>
                  {formMode === "create" ? (
                    <>
                      <PenTool size={16} />
                      Crear Receta
                    </>
                  ) : (
                    <>
                      <Edit3 size={16} />
                      Guardar Cambios
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className={styles.cancelBtn}
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Comentarios */}
      {showComments && selectedRecipe && (
        <div className={styles.modalOverlay}>
          <div className={styles.commentsModal}>
            <div className={styles.commentsHeader}>
              <h3 className={styles.commentsTitle}>
                <MessageCircle size={20} />
                Comentarios: {selectedRecipe.titulo}
              </h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setShowComments(false);
                  setSelectedRecipe(null);
                  setComments([]);
                  setNewComment("");
                }}
              >
                ✕
              </button>
            </div>

            <div className={styles.commentsContent}>
              {/* Lista de comentarios */}
              <div className={styles.commentsList}>
                {comments.length === 0 ? (
                  <div className={styles.noComments}>
                    <MessageCircle size={48} />
                    <h4>No hay comentarios aún</h4>
                    <p>¡Sé el primero en comentar!</p>
                  </div>
                ) : (
                  comments.map((comment) => (
                    <div key={comment.id} className={styles.commentItem}>
                      <div className={styles.commentHeader}>
                        <div className={styles.commentAuthor}>
                          <User size={16} />
                          <span>{comment.nombre_usuario || user?.nombre}</span>
                        </div>
                        <span className={styles.commentDate}>
                          {formatDate(comment.creado_en)}
                        </span>
                        {(comment.id_usuario === user?.id || user?.email === 'admin@mikens.com') && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className={styles.deleteCommentBtn}
                            title="Eliminar comentario"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                      <p className={styles.commentText}>{comment.comentario}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Formulario de nuevo comentario */}
              <form onSubmit={handleSubmitComment} className={styles.commentForm}>
                <div className={styles.commentInputGroup}>
                  <MessageCircle size={18} />
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe tu comentario..."
                    className={styles.commentTextarea}
                    rows={3}
                    required
                  />
                </div>
                <div className={styles.commentActions}>
                  <button type="submit" className={styles.submitCommentBtn}>
                    <MessageCircle size={16} />
                    Comentar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowComments(false);
                      setSelectedRecipe(null);
                      setComments([]);
                      setNewComment("");
                    }}
                    className={styles.cancelCommentBtn}
                  >
                    Cerrar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recetas;