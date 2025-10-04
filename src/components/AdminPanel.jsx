import { useState, useEffect } from 'react';
import { 
  LogOut, 
  Home as HomeIcon, 
  Shield, 
  Users, 
  BookOpen,
  Settings,
  AlertTriangle,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Star
} from 'lucide-react';
import styles from './AdminPanel.module.css';
import { useRole } from './RoleManager';

function AdminPanel() {
  const { user, logout } = useRole();
  const [view, setView] = useState('inicio');
  const [recetas, setRecetas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (view === 'recetas') {
      fetchRecetas();
    } else if (view === 'usuarios') {
      fetchUsuarios();
    }
  }, [view]);

  const fetchRecetas = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/recipes');
      const data = await response.json();
      
      if (response.ok) {
        setRecetas(data);
      } else {
        setMensaje(data.error || 'Error al cargar recetas');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/usuarios');
      const data = await response.json();
      
      if (response.ok) {
        setUsuarios(data);
      } else {
        setMensaje(data.error || 'Error al cargar usuarios');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const toggleRecetaPublica = async (receta) => {
    try {
      const response = await fetch(`http://localhost:3001/recipes/${receta.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comunidad: !receta.comunidad }),
      });

      if (response.ok) {
        setMensaje(`Receta ${receta.comunidad ? 'ocultada' : 'publicada'} exitosamente`);
        fetchRecetas();
      } else {
        setMensaje('Error al actualizar la receta');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    }
  };

  const eliminarReceta = async (recetaId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta receta?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/recipes/${recetaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMensaje('Receta eliminada exitosamente');
        fetchRecetas();
      } else {
        const data = await response.json();
        setMensaje(data.error || 'Error al eliminar la receta');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    }
  };

  const eliminarUsuario = async (userId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este usuario?')) return;

    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:3001/usuarios/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setMensaje('Usuario eliminado exitosamente');
        fetchUsuarios();
      } else {
        const data = await response.json();
        setMensaje(data.error || 'Error al eliminar el usuario');
      }
    } catch {
      setMensaje('Error de conexión con el servidor');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderDashboard = () => {
    if (view === 'recetas') {
      return (
        <div className={styles.adminSection}>
          <h2 className={styles.sectionTitle}>Gestión de Recetas</h2>
          <p className={styles.sectionSubtitle}>Modera y gestiona el contenido de la comunidad</p>
          
          {loading ? (
            <div className={styles.loading}>Cargando recetas...</div>
          ) : (
            <div className={styles.recipesGrid}>
              {recetas.map((receta) => (
                <div key={receta.id} className={styles.recipeCard}>
                  <div className={styles.recipeHeader}>
                    <h3>{receta.titulo}</h3>
                    <div className={styles.recipeActions}>
                      <span className={`${styles.status} ${receta.comunidad ? styles.published : styles.private}`}>
                        {receta.comunidad ? 'Pública' : 'Privada'}
                      </span>
                    </div>
                  </div>
                  <p className={styles.recipeDescription}>
                    {receta.descripcion.length <= 100 
                      ? receta.descripcion 
                      : `${receta.descripcion.substring(0, 100)}...`
                    }
                  </p>
                  <div className={styles.recipeInfo}>
                    <span>Por: {receta.autor}</span>
                  </div>
                  <div className={styles.recipeActions}>
                    <button
                      onClick={() => toggleRecetaPublica(receta)}
                      className={`${styles.actionBtn} ${receta.comunidad ? styles.hideBtn : styles.showBtn}`}
                    >
                      {receta.comunidad ? <Eye size={16} /> : <CheckCircle size={16} />}
                      {receta.comunidad ? 'Ocultar' : 'Publicar'}
                    </button>
                    <button
                      onClick={() => eliminarReceta(receta.id)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (view === 'usuarios') {
      return (
        <div className={styles.adminSection}>
          <h2 className={styles.sectionTitle}>Gestión de Usuarios</h2>
          <p className={styles.sectionSubtitle}>Administra la comunidad de usuarios</p>
          
          {loading ? (
            <div className={styles.loading}>Cargando usuarios...</div>
          ) : usuarios.length === 0 ? (
            <div className={styles.emptyState}>
              <Users size={48} className={styles.emptyIcon} />
              <h3>No hay usuarios registrados</h3>
              <p>Todavía no se han registrado usuarios en el sistema.</p>
            </div>
          ) : (
            <div className={styles.usersGrid}>
              {usuarios.map((usuario) => (
                <div key={usuario.id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div className={styles.userAvatar}>
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3>{usuario.nombre}</h3>
                      <p>{usuario.email}</p>
                      <span className={styles.userDate}>
                        Registro: {formatDate(usuario.creado_en)}
                      </span>
                    </div>
                  </div>
                  <div className={styles.userStatus}>
                    <span className={`${styles.status} ${usuario.email === 'admin@mikens.com' ? styles.adminStatus : styles.userStatus}`}>
                      {usuario.email === 'admin@mikens.com' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                  <div className={styles.userActions}>
                    <button 
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                      onClick={() => eliminarUsuario(usuario.id)}
                      disabled={usuario.email === 'admin@mikens.com'}
                    >
                      <Trash2 size={16} />
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className={styles.welcomeSection}>
        <div className={styles.banner}>
          <Shield size={48} className={styles.adminIcon} />
          <h1 className={styles.welcomeTitle}>
            Panel de Administrador 🛡️
          </h1>
          <p className={styles.welcomeText}>
            Bienvenido, {user?.nombre}. Desde aquí puedes moderar contenidos, 
            gestionar usuarios y administrar la comunidad.
          </p>
        </div>

        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <BookOpen size={28} className={styles.icon} />
            <h3>Gestión de Recetas</h3>
            <p>Modera recetas, aprueba contenido y gestiona la publicación.</p>
            <button 
              className={styles.cardBtn}
              onClick={() => setView('recetas')}
            >
              Ver recetas
            </button>
          </div>
          
          <div className={styles.card}>
            <Users size={28} className={styles.icon} />
            <h3>Gestión de Usuarios</h3>
            <p>Administra usuarios, revisa perfiles y gestiona permisos.</p>
            <button 
              className={styles.cardBtn}
              onClick={() => setView('usuarios')}
            >
              Ver usuarios
            </button>
          </div>

          <div className={styles.card}>
            <AlertTriangle size={28} className={styles.icon} />
            <h3>Reportes y Moderación</h3>
            <p>Revisa contenido reportado y actividades sospechosas.</p>
          </div>

          <div className={styles.card}>
            <Settings size={28} className={styles.icon} />
            <h3>Configuración del Sistema</h3>
            <p>Configura parámetros globales y ajustes de la aplicación.</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>🍲 Mikens</div>
          <div className={styles.adminBadge}>
            <Shield size={16} />
            Administrador
          </div>
        </div>
        
        <ul className={styles.menu}>
          <li>
            <button
              className={`${styles.linkButton} ${view === 'inicio' ? styles.active : ''}`}
              onClick={() => setView('inicio')}
            >
              <HomeIcon size={18} /> Panel
            </button>
          </li>
          <li>
            <button
              className={`${styles.linkButton} ${view === 'recetas' ? styles.active : ''}`}
              onClick={() => setView('recetas')}
            >
              <BookOpen size={18} /> Recetas
            </button>
          </li>
          <li>
            <button
              className={`${styles.linkButton} ${view === 'usuarios' ? styles.active : ''}`}
              onClick={() => setView('usuarios')}
            >
              <Users size={18} /> Usuarios
            </button>
          </li>
        </ul>

        <div className={styles.userSection}>
          <div className={styles.adminInfo}>
            <Shield size={16} />
            <span>{user?.nombre}</span>
          </div>
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        {mensaje && (
          <div className={styles.message}>
            {mensaje}
            <button onClick={() => setMensaje('')}>✖</button>
          </div>
        )}
        {renderDashboard()}
      </main>
    </div>
  );
}

export default AdminPanel;
