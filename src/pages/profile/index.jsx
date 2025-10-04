import { useEffect, useState } from "react";
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Crown, 
  Shield,
  Mail,
  Calendar,
  MapPin,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import Swal from "sweetalert2";
import styles from "./styles.module.css";
import { useRole } from "../../components/RoleManager";

function Profile({ user }) {
  const { isAdmin, isUser } = useRole();
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    
    const loadUserData = () => {
      setNombre(user.nombre || "");
      setEmail(user.email || "");
      
      if (user.id) {
        fetchUpdatedData();
      }
    };

    const fetchUpdatedData = async () => {
      try {
        const res = await fetch(`http://localhost:3001/usuarios/${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Error al cargar usuario");
        
        setNombre(data.nombre || user.nombre || "");
        setDescripcion(data.descripcion || "");
        setFoto(data.foto || "");
        setEmail(data.email || user.email || "");
      } catch {
        setDescripcion(user.descripcion || "");
        setFoto(user.foto || "");
      }
    };
    
    loadUserData();
  }, [user]);

  const handleSave = async () => {
    try {
      const res = await fetch(`http://localhost:3001/usuarios/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, descripcion, foto }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");

      Swal.fire({
        icon: "success",
        title: "Perfil actualizado",
        text: "Tus cambios se han guardado correctamente",
        timer: 2000,
        showConfirmButton: false
      });
      
      setIsEditing(false);
      
      const updatedUser = { ...user, nombre, descripcion, foto };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al actualizar perfil",
      });
    }
  };

  const getRoleConfig = () => {
    if (isAdmin) {
      return {
        icon: Crown,
        label: "Administrador",
        color: "#ef4444",
        background: "rgba(239, 68, 68, 0.1)",
        description: "Acceso completo al sistema"
      };
    } else if (isUser) {
      return {
        icon: User,
        label: "Usuario Registrado",
        color: "#3b82f6",
        background: "rgba(59, 130, 246, 0.1)",
        description: "Crear, compartir y guardar recetas"
      };
    } else {
      return {
        icon: AlertCircle,
        label: "Invitado",
        color: "#6b7280",
        background: "rgba(107, 114, 128, 0.1)",
        description: "Solo visualización de contenido"
      };
    }
  };

  const roleConfig = getRoleConfig();
  const RoleIcon = roleConfig.icon;

  return (
    <div className={styles.profileCard}>
      {/* Header con avatar y información básica */}
      <div className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.avatar}>
            {foto ? (
              <img
                src={foto}
                alt={nombre}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://via.placeholder.com/120?text=User";
                }}
              />
            ) : (
              <div className={styles.avatarPlaceholder}>
                <User size={32} />
              </div>
            )}
          </div>
          <button 
            className={styles.changePhotoBtn}
            onClick={() => setIsEditing(true)}
            title="Cambiar foto de perfil"
          >
            <Edit3 size={14} />
          </button>
        </div>
        
        <div className={styles.userInfo}>
          <div className={styles.nameSection}>
            <h2 className={styles.name}>{nombre || "Usuario"}</h2>
            <div className={styles.roleBadge} style={{ 
              color: roleConfig.color, 
              backgroundColor: roleConfig.background 
            }}>
              <RoleIcon size={14} />
              <span>{roleConfig.label}</span>
            </div>
          </div>
          <div className={styles.emailSection}>
            <Mail size={14} />
            <span>{email}</span>
          </div>
          <p className={styles.roleDescription}>{roleConfig.description}</p>
        </div>
      </div>

      {/* Contenido principal */}
      {isEditing ? (
        <div className={styles.editForm}>
          <h3 className={styles.formTitle}>Editar Perfil</h3>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>Nombre completo</label>
            <input
              className={styles.input}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>Descripción</label>
            <textarea
              className={styles.input}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Cuéntanos algo sobre ti..."
              rows={3}
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label}>URL de foto</label>
            <input
              className={styles.input}
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
              placeholder="https://ejemplo.com/foto.jpg"
            />
          </div>

          <div className={styles.formActions}>
            <button onClick={handleSave} className={styles.saveBtn}>
              <Save size={16} />
              Guardar cambios
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className={styles.cancelBtn}
            >
              <X size={16} />
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <div className={styles.profileContent}>
          <div className={styles.bioSection}>
            <h4 className={styles.sectionTitle}>Descripción</h4>
            <p className={styles.bio}>
              {descripcion || "Aún no has agregado una biografía. ¡Cuéntanos algo sobre ti!"}
            </p>
          </div>

          <div className={styles.statsSection}>
            <h4 className={styles.sectionTitle}>Estadísticas</h4>
            <div className={styles.stats}>
              <div className={styles.stat}>
                <CheckCircle size={16} />
                <div>
                  <span className={styles.statNumber}>25</span>
                  <span className={styles.statLabel}>Recetas creadas</span>
                </div>
              </div>
              <div className={styles.stat}>
                <Calendar size={16} />
                <div>
                  <span className={styles.statNumber}>12</span>
                  <span className={styles.statLabel}>Días activo</span>
                </div>
              </div>
            </div>
          </div>

          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            <Edit3 size={16} />
            Editar perfil
          </button>
        </div>
      )}
    </div>
  );
}

export default Profile;