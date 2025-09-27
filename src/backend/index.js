import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Conexión MySQL
const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// Registro
app.post("/register", async (req, res) => {
  const { nombre, email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0)
      return res.status(400).json({ error: "El email ya está registrado" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );
    res.json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el registro" });
  }
});

// Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [
      email,
    ]);
    if (rows.length === 0)
      return res.status(400).json({ error: "Usuario no encontrado" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: user.id, email: user.email, nombre: user.nombre },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login exitoso",
      token,
      user: { id: user.id, nombre: user.nombre, email: user.email },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// Actualizar perfil
app.put("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, foto } = req.body;

  try {
    await db.query(
      "UPDATE usuarios SET nombre = ?, descripcion = ?, foto = ? WHERE id = ?",
      [nombre, descripcion, foto, id]
    );

    const [rows] = await db.query(
      "SELECT id, nombre, email, descripcion, foto FROM usuarios WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }

    res.json({
      message: "Perfil actualizado con éxito",
      user: rows[0]
    });
  } catch (error) {
    console.error("Error al actualizar:", error);
    res.status(500).json({ error: "Error al actualizar perfil" });
  }
});

// Obtener usuario por ID
app.get("/usuarios/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, descripcion, foto FROM usuarios WHERE id = ?",
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado" });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Error en GET usuario:", error);
    res.status(500).json({ error: "Error al obtener usuario" });
  }
});

//Subir recetas
app.post("/upload/recipes", async (req, res) => {
  const { titulo, descripcion, autor } = req.body;
  try {
    if (!titulo || !descripcion || !autor) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    await db.query(
      "INSERT INTO recetas (titulo, descripcion, autor) VALUES (?, ?, ?)",
      [titulo, descripcion, autor]
    );
    res.json({ message: "Receta guardada con exito" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al guardar la receta" });
  }
});

//actualizar recetas
app.patch("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, comunidad } = req.body;

  try {
    // primero vemos si existe
    const [rows] = await db.query("SELECT * FROM recetas WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    const fields = [];
    const values = [];

    if (titulo !== undefined) {
      fields.push("titulo = ?");
      values.push(titulo);
    }
    if (descripcion !== undefined) {
      fields.push("descripcion = ?");
      values.push(descripcion);
    }
    if (comunidad !== undefined) {
      fields.push("comunidad = ?");
      values.push(comunidad ? 1 : 0);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: "No hay cambios para aplicar" });
    }

    values.push(id);

    await db.query(
      `UPDATE recetas SET ${fields.join(", ")} WHERE id = ?`,
      values
    );

    res.json({ message: "Receta actualizada con éxito" });
  } catch (error) {
    console.error("Error al actualizar receta:", error);
    res.status(500).json({ error: "Error al actualizar receta" });
  }
});

//mostrar recetas
app.get("/recipes", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recetas");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener las recetas" });
  }
});

app.get("/recipes/public", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recetas WHERE comunidad = 1 ");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener las recetas de la comunidad " });
  }
});

// Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
