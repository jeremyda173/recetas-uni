import { useState, useEffect } from "react";
import { 
  ChefHat, 
  Eye, 
  Users, 
  Star, 
  ArrowRight,
  Coffee,
  Timer,
  Zap,
  Utensils,
  Share,
  UserPlus
} from "lucide-react";
import styles from "./styles.module.css";
import { useRole } from "../../components/RoleManager";

function Landing({ recetasPublicas }) {
  const { openLogin, openRegister } = useRole();
  const [featuredRecipes, setFeaturedRecipes] = useState([]);
  const [stats, setStats] = useState({ recetas: 0, usuarios: 0 });

  useEffect(() => {
    if (recetasPublicas && recetasPublicas.length > 0) {
      setFeaturedRecipes(recetasPublicas.slice(0, 6));
    }
  }, [recetasPublicas]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const recetasResponse = await fetch('http://localhost:3001/recipes');
        const recetasData = await recetasResponse.json();
        const recetasCount = Array.isArray(recetasData) ? recetasData.length : 0;

        const usuariosResponse = await fetch('http://localhost:3001/usuarios');
        const usuariosData = await usuariosResponse.json();
        const usuariosCount = Array.isArray(usuariosData) ? usuariosData.length : 0;

        setStats({ recetas: recetasCount, usuarios: usuariosCount });
      } catch {
        setStats({ recetas: 3, usuarios: 1 });
      }
    };

    fetchStats();
  }, []);

  return (
    <div className={styles.landing}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <ChefHat size={32} className={styles.logoIcon} />
            <span className={styles.logoText}>Mikens</span>
          </div>
          <nav className={styles.nav}>
            <button 
              onClick={openLogin} 
              className={styles.loginBtn}
            >
              Iniciar Sesión
            </button>
            <button 
              onClick={openRegister} 
              className={styles.registerBtn}
            >
              Registrarse
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1 className={styles.heroTitle}>
              Descubre el mundo de la cocina <br />
              <span className={styles.gradient}>sin límites</span>
            </h1>
            <p className={styles.heroSubtitle}>
              Explora miles de recetas deliciosas, desde platos tradicionales hasta 
              creaciones innovadoras. Únete a nuestra comunidad culinaria hoy mismo.
            </p>
            <div className={styles.heroButtons}>
              <button 
                onClick={openRegister} 
                className={styles.ctaPrimary}
              >
                <UserPlus size={20} />
                Registrarme Ahora
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={openLogin} 
                className={styles.ctaSecondary}
              >
                Ya tengo cuenta
              </button>
            </div>
          </div>
          <div className={styles.heroImage}>
            <div className={styles.imageContainer}>
              <Coffee size={200} className={styles.heroIllustration} />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statsContainer}>
          <div className={styles.stat}>
            <Star className={styles.statIcon} />
            <div className={styles.statNumber}>{stats.recetas}</div>
            <div className={styles.statLabel}>Recetas</div>
          </div>
          <div className={styles.stat}>
            <Users className={styles.statIcon} />
            <div className={styles.statNumber}>{stats.usuarios}</div>
            <div className={styles.statLabel}>Usuarios</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>¿Por qué elegir Mikens?</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.feature}>
              <Eye className={styles.featureIcon} />
              <h3>Explora Sin Límites</h3>
              <p>
                Navega por una extensa colección de recetas sin necesidad de registrarte. 
                Descubre nuevos sabores y técnicas desde la comodidad de tu hogar.
              </p>
            </div>
            <div className={styles.feature}>
              <Share className={styles.featureIcon} />
              <h3>Comparte Tu Pasión</h3>
              <p>
                Como usuario registrado, puedes compartir tus propias recetas y 
                conectarte con otros amantes de la cocina.
              </p>
            </div>
            <div className={styles.feature}>
              <Timer className={styles.featureIcon} />
              <h3>Recetas Flexibles</h3>
              <p>
                Adapta recetas según tu tiempo disponible, ingredientes a mano 
                o preferencias dietéticas específicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
      <section className={styles.featuredRecipes}>
        <div className={styles.featuredContainer}>
          <h2 className={styles.sectionTitle}>Recetas Destacadas</h2>
          <p className={styles.sectionSubtitle}>
            Algunas de las recetas más populares de nuestra comunidad
          </p>
          {featuredRecipes.length > 0 ? (
            <div className={styles.recipesGrid}>
              {featuredRecipes.map((receta) => (
                <div key={receta.id} className={styles.recipeCard}>
                  <div className={styles.recipeHeader}>
                    <h3 className={styles.recipeTitle}>{receta.titulo}</h3>
                    <div className={styles.recipeAuthor}>Por {receta.autor}</div>
                  </div>
                  <p className={styles.recipeDescription}>
                    {receta.descripcion.length <= 150 
                      ? receta.descripcion 
                      : `${receta.descripcion.substring(0, 150)}...`
                    }
                  </p>
                  <div className={styles.recipeStats}>
                    <div className={styles.stat}>
                      <Timer size={14} />
                      <span>15 min</span>
                    </div>
                    <div className={styles.stat}>
                      <Users size={14} />
                      <span>4 personas</span>
                    </div>
                    <div className={styles.stat}>
                      <Zap size={14} />
                      <span>Fácil</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.noRecipes}>
              <Utensils size={48} className={styles.noRecipesIcon} />
              <p>¡Próximamente más recetas!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.cta}>
        <div className={styles.ctaContainer}>
          <h2 className={styles.ctaTitle}>¿Listo para comenzar tu viaje culinario?</h2>
          <p className={styles.ctaSubtitle}>
            Únete a nuestra comunidad y descubre un mundo de sabores sin límites
          </p>
          <button 
            onClick={openRegister} 
            className={styles.ctaButton}
          >
            <UserPlus size={20} />
            Registrarme Ahora
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <ChefHat size={24} className={styles.logoIcon} />
            <span className={styles.logoText}>Mikens</span>
          </div>
          <div className={styles.footerLinks}>
            <a href="#">Términos de Servicio</a>
            <a href="#">Privacidad</a>
            <a href="#">Contacto</a>
          </div>
          <div className={styles.footerCopyright}>
            © 2024 Mikens. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
