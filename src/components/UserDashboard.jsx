import { useState } from 'react';
import { 
  LogOut, 
  Home as HomeIcon, 
  BookOpen, 
  User, 
  Plus,
  Star,
  Settings
} from 'lucide-react';
import styles from './UserDashboard.module.css';
import Recetas from '../pages/recetas';
import Profile from '../pages/profile';
import { useRole } from './RoleManager';

function UserDashboard() {
  const { user, logout } = useRole();
  const [view, setView] = useState('inicio');
  const [showProfile, setShowProfile] = useState(false);

  const renderDashboard = () => {
    if (view === 'recetas') {
      return <Recetas user={user} />;
    }
    
    return (
      <div className={styles.welcomeSection}>
        <div className={styles.banner}>
          <h1 className={styles.welcomeTitle}>
            ¡Bienvenido de nuevo, {user?.nombre}! 👋
          </h1>
          <p className={styles.welcomeText}>
            Explora nuevas recetas, guarda tus favoritas y comparte tus propias creaciones con la comunidad.
          </p>
        </div>

        <div className={styles.cardsContainer}>
          <div className={styles.card}>
            <BookOpen size={28} className={styles.icon} />
            <h3>Explora recetas</h3>
            <p>Descubre una gran variedad de platos de todo el mundo.</p>
            <button 
              className={styles.cardBtn}
              onClick={() => setView('recetas')}
            >
              Ver recetas
            </button>
          </div>
          
          <div className={styles.card}>
            <Star size={28} className={styles.icon} />
            <h3>Tus favoritas</h3>
            <p>Guarda recetas para verlas más tarde cuando quieras.</p>
          </div>
          
          <div className={styles.card}>
            <Plus size={28} className={styles.icon} />
            <h3>Comparte tu sazón</h3>
            <p>Sube tus propias recetas y deja que otros disfruten tu estilo.</p>
          </div>
         
          <div className={styles.card}>
            <Settings size={28} className={styles.icon} />
            <h3>Personaliza tu perfil</h3>
            <p>Actualiza tu información y configura tus preferencias.</p>
            <button 
              className={styles.cardBtn}
              onClick={() => setShowProfile(true)}
            >
              Configurar perfil
            </button>
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
          <div className={styles.userBadge}>Usuario</div>
        </div>
        
        <ul className={styles.menu}>
          <li>
            <button
              className={`${styles.linkButton} ${view === 'inicio' ? styles.active : ''}`}
              onClick={() => setView('inicio')}
            >
              <HomeIcon size={18} /> Inicio
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
        </ul>

        <div className={styles.userSection}>
          <button 
            onClick={() => setShowProfile(true)}
            className={styles.profileButton}
          >
            <User size={18} />
            {user?.nombre}
          </button>
          <button onClick={logout} className={styles.logoutButton}>
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        {renderDashboard()}
      </main>

      {showProfile && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <Profile user={user} />
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

export default UserDashboard;
