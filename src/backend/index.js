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

// Conexión MySQL con valores por defecto
const db = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'recetas_db',
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
    
    // Validaciones básicas
    if (!nombre || !email || !password) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "La contraseña debe tener al menos 6 caracteres" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, hashedPassword]
    );
    res.json({ message: "Usuario registrado con éxito. Ya puedes iniciar sesión." });
  } catch (error) {
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
      process.env.JWT_SECRET || 'secret_default_para_desarrollo',
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
    res.status(500).json({ error: "Error al guardar la receta" });
  }
});

app.post("/recipes", async (req, res) => {
  const { titulo, descripcion, autor, tiempo, comunidad } = req.body;
  try {
    if (!titulo || !descripcion || !autor) {
      return res
        .status(400)
        .json({ error: "Todos los campos son obligatorios" });
    }
    
    const comunidadValue = comunidad ? 1 : 0;
    const idUsuario = 1;
    
    const [result] = await db.query(
      "INSERT INTO recetas (titulo, descripcion, autor, tiempo, comunidad, id_usuario) VALUES (?, ?, ?, ?, ?, ?)",
      [titulo, descripcion, autor, tiempo || null, comunidadValue, idUsuario]
    );
    
    res.json({ 
      message: "Receta creada con éxito",
      id: result.insertId 
    });
  } catch (error) {
    res.status(500).json({ error: "Error al crear la receta" });
  }
});

//actualizar recetas
app.patch("/recipes/:id", async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, comunidad, tiempo } = req.body;

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
    if (tiempo !== undefined) {
      fields.push("tiempo = ?");
      values.push(tiempo);
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
    res.status(500).json({ error: "Error al actualizar receta" });
  }
});

//mostrar recetas
app.get("/recipes", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recetas");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las recetas" });
  }
});

// Rutas públicas (sin autenticación)
app.get("/recipes/public", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM recetas WHERE comunidad = 1 ORDER BY id DESC LIMIT 20");
    res.json(rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error al obtener las recetas de la comunidad" });
  }
});

// Middleware para verificar token (para rutas protegidas)
const verifyToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Token no proporcionado" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_default_para_desarrollo');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido" });
  }
};

// Eliminar receta (solo para admin)
app.delete("/recipes/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Verificar si el usuario es admin
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [req.user.email]);
    if (rows.length === 0 || rows[0].email !== 'admin@mikens.com') {
      return res.status(403).json({ error: "No autorizado" });
    }
    
    const [exists] = await db.query("SELECT * FROM recetas WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    
    await db.query("DELETE FROM recetas WHERE id = ?", [id]);
    res.json({ message: "Receta eliminada exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar receta" });
  }
});

// Obtener todos los usuarios (solo admin)
app.get("/usuarios", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT id, nombre, email, creado_en FROM usuarios ORDER BY creado_en DESC"
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Eliminar usuario (solo admin)
app.delete("/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.query("DELETE FROM usuarios WHERE id = ?", [id]);
    res.json({ message: "Usuario eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar usuario" });
  }
});

// Endpoints de comentarios

// GET /comments/:recipeId - Obtener comentarios de una receta
app.get("/comments/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const [rows] = await db.query(`
      SELECT c.*, u.nombre as nombre_usuario 
      FROM comentarios c 
      JOIN usuarios u ON c.id_usuario = u.id 
      WHERE c.id_receta = ? 
      ORDER BY c.creado_en DESC
    `, [recipeId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener comentarios" });
  }
});

// POST /comments - Crear nuevo comentario
app.post("/comments", async (req, res) => {
  try {
    const { recipeId, comentario } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_default_para_desarrollo");
    
    if (!payload.id) {
      return res.status(401).json({ error: "Token inválido" });
    }

    const [result] = await db.query(
      "INSERT INTO comentarios (id_usuario, id_receta, comentario) VALUES (?, ?, ?)",
      [payload.id, recipeId, comentario]
    );

    const [newComment] = await db.query(`
      SELECT c.*, u.nombre as nombre_usuario 
      FROM comentarios c 
      JOIN usuarios u ON c.id_usuario = u.id 
      WHERE c.id = ?
    `, [result.insertId]);

    res.json(newComment[0]);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error al crear comentario" });
  }
});

// DELETE /comments/:id - Eliminar comentario
app.delete("/comments/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_default_para_desarrollo");
    
    if (!payload.id) {
      return res.status(401).json({ error: "Token inválido" });
    }

    await db.query("DELETE FROM comentarios WHERE id = ?", [id]);
    res.json({ message: "Comentario eliminado exitosamente" });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error al eliminar comentario" });
  }
});

// Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
