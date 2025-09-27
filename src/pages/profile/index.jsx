import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import styles from "./styles.module.css";

function Profile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [foto, setFoto] = useState("");
  const [email, setEmail] = useState("");

  console.log(user.id, "user profile");

  useEffect(() => {
    if (!user.id) return;
    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:3001/usuarios/${user.id}`);
        const data = await res.json();
        console.log(data, "data user fetch");
        if (!res.ok) throw new Error(data.error || "Error al cargar usuario");
        setNombre(data.nombre || "");
        setDescripcion(data.descripcion || "");
        setFoto(data.foto || "");
        setEmail(data.email || "");
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo cargar el perfil",
        });
      }
    };
    fetchUser();
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
      }).then(() => {
        window.location.reload();
      });

      setIsEditing(false);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Error al actualizar perfil",
      });
    }
  };

  return (
    <div className={styles.profileCard}>
      <div className={styles.avatar}>
        {foto ? (
          <img
            src={foto}
            alt={nombre}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://via.placeholder.com/100?text=User";
            }}
          />
        ) : (
          <span>{nombre ? nombre.charAt(0).toUpperCase() : "U"}</span>
        )}
      </div>

      {isEditing ? (
        <div className={styles.editForm}>
          <input
            className={styles.input}
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
          />
          <textarea
            className={styles.input}
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Descripción"
          />
          <input
            className={styles.input}
            value={foto}
            onChange={(e) => setFoto(e.target.value)}
            placeholder="URL de foto"
          />
          <div className={styles.buttons}>
            <button onClick={handleSave} className={styles.saveBtn}>
              Guardar
            </button>
            <button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <h2 className={styles.name}>{nombre}</h2>
          <p className={styles.email}>{email}</p>
          <p className={styles.bio}>{descripcion || "Sin descripción aún."}</p>
          <button onClick={() => setIsEditing(true)} className={styles.editBtn}>
            Editar
          </button>
        </>
      )}

    </div>
  );
}

export default Profile;
