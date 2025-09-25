import styles from "./profile.module.css";

function Profile({ user }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.avatar}>
          {user.nombre.charAt(0).toUpperCase()}
        </div>
        
        <h2 className={styles.name}>{user.nombre}</h2>
        <p className={styles.email}>{user.email}</p>

        <button className={styles.editButton}>Editar perfil</button>
      </div>
    </div>
  );
}

export default Profile;
