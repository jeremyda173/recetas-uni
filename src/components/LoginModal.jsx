import { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import styles from './LoginModal.module.css';
import { useRole } from './RoleManager';

function LoginModal() {
  const { closeModals, login, register, showLogin, showRegister, openLogin, openRegister } = useRole();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const rememberData = localStorage.getItem('rememberMe');
    if (rememberData) {
      try {
        const parsed = JSON.parse(rememberData);
        if (parsed.rememberMe && parsed.email) {
          setFormData(prev => ({ ...prev, email: parsed.email }));
          setRememberMe(true);
        }
      } catch {
        localStorage.removeItem('rememberMe');
      }
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = formData;
    
    const result = await login(email, password);
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem('rememberMe', JSON.stringify({
          email,
          rememberMe: true,
          timestamp: Date.now()
        }));
      } else {
        localStorage.removeItem('rememberMe');
      }
    } else {
      setMensaje(result.error);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { nombre, email, password, confirmPassword } = formData;
    
    if (password !== confirmPassword) {
      setMensaje('Las contraseñas no coinciden');
      return;
    }
    
    const result = await register(nombre, email, password);
    if (result.success) {
      setMensaje(result.message);
      openLogin();
      setFormData({ nombre: '', email: '', password: '', confirmPassword: '' });

    } else {
      setMensaje(result.error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const activeModal = showLogin ? 'login' : showRegister ? 'register' : null;

  if (!activeModal) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={closeModals}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.logo}>
            <User size={32} />
          </div>
          <h2 className={styles.title}>
            {activeModal === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className={styles.subtitle}>
            {activeModal === 'login' 
              ? 'Accede a tu cuenta para disfrutar de todas las funciones'
              : 'Únete a nuestra comunidad culinaria'
            }
          </p>
        </div>

        <form onSubmit={activeModal === 'login' ? handleLogin : handleRegister}>
          <div className={styles.formContent}>
            {activeModal === 'register' && (
              <div className={styles.inputGroup}>
                <Mail className={styles.inputIcon} />
                <input
                  type="text"
                  name="nombre"
                  placeholder="Nombre completo"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <Mail className={styles.inputIcon} />
              <input
                type="email"
                name="email"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock className={styles.inputIcon} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Contraseña"
                value={formData.password}
                onChange={handleInputChange}
                required
                className={styles.input}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className={styles.eyeBtn}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {activeModal === 'register' && (
              <div className={styles.inputGroup}>
                <Lock className={styles.inputIcon} />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirmar contraseña"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className={styles.eyeBtn}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            )}
          </div>

          {activeModal === 'login' && (
            <div className={styles.rememberMeGroup}>
              <label className={styles.rememberMeLabel}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={styles.rememberMeCheckbox}
                />
                <span className={styles.rememberMeText}>Recordarme</span>
              </label>
            </div>
          )}

          {mensaje && (
            <div className={styles.message}>
              {mensaje}
            </div>
          )}

          <button 
            type="submit" 
            className={styles.submitBtn}
          >
            {activeModal === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </button>

          <div className={styles.switchMode}>
            <p>
              {activeModal === 'login' 
                ? "¿No tienes una cuenta?" 
                : "¿Ya tienes una cuenta?"
              }
            </p>
            <button
              type="button"
              onClick={() => {
                if (activeModal === 'login') {
                  openRegister(); // Cambiar a registro
                } else {
                  openLogin(); // Cambiar a login
                }
              }}
              className={styles.switchBtn}
            >
              {activeModal === 'login' 
                ? "Regístrate aquí" 
                : "Inicia sesión"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;