import styles from "./styles.module.css";

function Profile({ user }) {
  return (
    <div className={styles.profileCard}>
      <div className={styles.avatar}>
        {user.nombre.charAt(0).toUpperCase()}
      </div>

      <h2 className={styles.name}>{user.nombre}</h2>
      <p className={styles.email}>{user.email}</p>
    </div>
  );
}

export default Profile;
