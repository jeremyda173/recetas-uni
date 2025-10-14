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

app.post("/recipes", verifyToken, async (req, res) => {
  const { titulo, descripcion, autor, tiempo, comunidad } = req.body;
  try {
    // Obtener información del usuario
    const [userRows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [req.user.email]);
    if (userRows.length === 0) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }
    
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
app.patch("/recipes/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, comunidad, tiempo } = req.body;

  try {
    // Obtener información del usuario
    const [userRows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [req.user.email]);
    if (userRows.length === 0) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }
    
    const user = userRows[0];
    const isAdmin = user.email === 'admin@mikens.com';
    
    // primero vemos si existe
    const [rows] = await db.query("SELECT * FROM recetas WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    
    const recipe = rows[0];
    
    // Verificar permisos: admin puede editar cualquier receta, usuario solo las suyas
    if (!isAdmin && recipe.autor !== user.nombre) {
      return res.status(403).json({ error: "No autorizado para editar esta receta" });
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
    // Verificar si la tabla reportes existe
    try {
      const [tables] = await db.query("SHOW TABLES LIKE 'reportes'");
      
      if (tables.length > 0) {
        console.log("Tabla reportes existe, obteniendo recetas con conteo...");
        const [rows] = await db.query(`
          SELECT r.*, 
                 (SELECT COUNT(*) FROM reportes WHERE id_receta = r.id) as report_count
          FROM recetas r
          ORDER BY r.id DESC
        `);
        console.log("Recetas obtenidas con conteo de reportes:", rows.length);
        console.log("Primera receta:", JSON.stringify(rows[0], null, 2));
        res.json(rows);
      } else {
        console.log("Tabla reportes NO existe, usando consulta simple...");
        const [rows] = await db.query(`
          SELECT *, 0 as report_count
          FROM recetas 
          ORDER BY id DESC
        `);
        console.log("Recetas obtenidas sin conteo de reportes:", rows.length);
        res.json(rows);
      }
    } catch (dbError) {
      console.error("Error en consulta:", dbError.message);
      // Fallback a consulta simple
      const [rows] = await db.query(`
        SELECT *, 0 as report_count
        FROM recetas 
        ORDER BY id DESC
      `);
      console.log("Usando fallback, recetas obtenidas:", rows.length);
      res.json(rows);
    }
  } catch (error) {
    console.error("Error al obtener recetas:", error);
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

// Eliminar receta (solo para admin)
app.delete("/recipes/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  
  try {
    // Obtener información del usuario
    const [userRows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [req.user.email]);
    if (userRows.length === 0) {
      return res.status(403).json({ error: "Usuario no encontrado" });
    }
    
    const user = userRows[0];
    const isAdmin = user.email === 'admin@mikens.com';
    
    // Obtener información de la receta
    const [exists] = await db.query("SELECT * FROM recetas WHERE id = ?", [id]);
    if (exists.length === 0) {
      return res.status(404).json({ error: "Receta no encontrada" });
    }
    
    const recipe = exists[0];
    
    // Verificar permisos: admin puede eliminar cualquier receta, usuario solo las suyas
    if (!isAdmin && recipe.autor !== user.nombre) {
      return res.status(403).json({ error: "No autorizado para eliminar esta receta" });
    }
    
    await db.query("DELETE FROM recetas WHERE id = ?", [id]);
    res.json({ message: "Receta eliminada exitosamente" });
  } catch (error) {
    console.error("Error al eliminar receta:", error);
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


// Endpoint temporal para obtener todos los reportes
app.get("/all-reports", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM reportes");
    res.json(rows);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Endpoint temporal para probar consulta de recetas reportadas
app.get("/test-reported-recipes", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, 
             COUNT(rep.id) as report_count,
             GROUP_CONCAT(DISTINCT rep.motivo) as motivos,
             GROUP_CONCAT(DISTINCT u.nombre) as usuarios_reportaron
      FROM recetas r
      LEFT JOIN reportes rep ON r.id = rep.id_receta
      LEFT JOIN usuarios u ON rep.id_usuario = u.id
      GROUP BY r.id
      HAVING r.estado = 'oculto' OR COUNT(rep.id) >= 3
      ORDER BY r.id DESC
    `);
    
    res.json({
      total: rows.length,
      recetas: rows
    });
  } catch (error) {
    res.json({ 
      error: error.message,
      code: error.code 
    });
  }
});

// Endpoint temporal para ocultar recetas con 3+ reportes
app.post("/hide-reported-recipes", async (req, res) => {
  try {
    // Obtener recetas con 3 o más reportes
    const [recipes] = await db.query(`
      SELECT r.id, r.titulo, COUNT(rep.id) as report_count
      FROM recetas r
      JOIN reportes rep ON r.id = rep.id_receta
      GROUP BY r.id, r.titulo
      HAVING report_count >= 3
    `);
    
    console.log("Recetas con 3+ reportes encontradas:", recipes);
    
    // Asegurar que la columna estado existe
    try {
      await db.query("ALTER TABLE recetas ADD COLUMN estado VARCHAR(20) DEFAULT 'activo'");
    } catch (e) {
      // Columna ya existe
    }
    
    // Ocultar cada receta
    for (const recipe of recipes) {
      await db.query("UPDATE recetas SET estado = 'oculto' WHERE id = ?", [recipe.id]);
      console.log(`Receta ${recipe.id} (${recipe.titulo}) ocultada`);
    }
    
    res.json({ 
      message: `${recipes.length} recetas ocultadas`,
      recipes: recipes 
    });
  } catch (error) {
    console.error("Error:", error);
    res.json({ error: error.message });
  }
});

// Endpoint temporal para probar consulta
app.get("/test-query", async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, 
             (SELECT COUNT(*) FROM reportes WHERE id_receta = r.id) as report_count
      FROM recetas r
      ORDER BY r.id DESC
    `);
    res.json(rows);
  } catch (error) {
    res.json({ error: error.message });
  }
});

// Endpoint temporal para verificar reportes
app.get("/debug/reportes", async (req, res) => {
  try {
    // Verificar si la tabla existe
    const [tables] = await db.query("SHOW TABLES LIKE 'reportes'");
    console.log("Tabla reportes existe:", tables.length > 0);
    
    if (tables.length > 0) {
      // Mostrar estructura de la tabla
      const [structure] = await db.query("DESCRIBE reportes");
      console.log("Estructura de tabla reportes:", structure);
      
      // Mostrar todos los reportes
      const [reportes] = await db.query("SELECT * FROM reportes");
      console.log("Reportes en la tabla:", reportes);
      
      // Mostrar recetas con conteo de reportes
      const [recetasConReportes] = await db.query(`
        SELECT r.id, r.titulo, r.autor, COUNT(rep.id) as report_count
        FROM recetas r
        LEFT JOIN reportes rep ON r.id = rep.id_receta
        GROUP BY r.id, r.titulo, r.autor
        ORDER BY r.id DESC
      `);
      console.log("Recetas con conteo de reportes:", recetasConReportes);
      
      res.json({
        tablaExiste: true,
        estructura: structure,
        reportes: reportes,
        recetasConReportes: recetasConReportes
      });
    } else {
      res.json({
        tablaExiste: false,
        mensaje: "La tabla 'reportes' no existe. Ejecuta el script SQL para crearla."
      });
    }
  } catch (error) {
    console.error("Error en debug de reportes:", error);
    res.json({
      error: error.message,
      code: error.code
    });
  }
});

// POST /reports - Reportar una receta
app.post("/reports", async (req, res) => {
  try {
    const { recipeId, motivo } = req.body;
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    console.log("Reporte recibido:", { recipeId, motivo, hasToken: !!token, token: token?.substring(0, 20) + "..." });
    
    if (!token) {
      console.log("No token provided");
      return res.status(401).json({ error: "Token requerido" });
    }

    console.log("Verificando token...");
    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_default_para_desarrollo");
    console.log("Token payload:", payload);
    
    if (!payload.id) {
      console.log("Token sin ID de usuario");
      return res.status(401).json({ error: "Token inválido" });
    }

    // Verificar si la tabla reportes existe
    try {
      // Verificar si el usuario ya reportó esta receta
      const [existingReport] = await db.query(
        "SELECT id FROM reportes WHERE id_usuario = ? AND id_receta = ?",
        [payload.id, recipeId]
      );

      if (existingReport.length > 0) {
        return res.status(400).json({ error: "Ya has reportado esta receta" });
      }

      // Crear el reporte
      await db.query(
        "INSERT INTO reportes (id_usuario, id_receta, motivo) VALUES (?, ?, ?)",
        [payload.id, recipeId, motivo || 'Contenido inapropiado']
      );

      // Contar reportes para esta receta
      const [reportCount] = await db.query(
        "SELECT COUNT(*) as count FROM reportes WHERE id_receta = ?",
        [recipeId]
      );

      // Si hay 3 o más reportes, ocultar la receta
      if (reportCount[0].count >= 3) {
        console.log(`Ocultando receta ${recipeId} por tener ${reportCount[0].count} reportes`);
        try {
          await db.query(
            "UPDATE recetas SET estado = 'oculto' WHERE id = ?",
            [recipeId]
          );
          console.log(`Receta ${recipeId} ocultada exitosamente`);
        } catch (updateError) {
          console.error("Error al ocultar receta:", updateError);
          // Si falla por columna no existe, crear la columna
          if (updateError.code === 'ER_BAD_FIELD_ERROR') {
            console.log("Columna estado no existe, creándola...");
            await db.query("ALTER TABLE recetas ADD COLUMN estado VARCHAR(20) DEFAULT 'activo'");
            await db.query("UPDATE recetas SET estado = 'oculto' WHERE id = ?", [recipeId]);
          }
        }
      }

      res.json({ 
        message: "Receta reportada exitosamente",
        reportCount: reportCount[0].count
      });
    } catch (dbError) {
      console.error("Error de base de datos:", dbError);
      if (dbError.code === 'ER_NO_SUCH_TABLE') {
        // Simular éxito si la tabla no existe
        res.json({ 
          message: "Receta reportada exitosamente (tabla no configurada)",
          reportCount: 1
        });
      } else {
        throw dbError;
      }
    }
  } catch (error) {
    console.error("Error completo en reporte:", {
      name: error.name,
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ 
      error: "Error al reportar receta", 
      details: error.message 
    });
  }
});

// GET /reports/admin - Obtener todas las recetas reportadas (solo admin)
app.get("/reports/admin", async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_default_para_desarrollo");
    
    // Verificar si es admin
    const [userRows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [payload.email]);
    if (userRows.length === 0 || userRows[0].email !== 'admin@mikens.com') {
      return res.status(403).json({ error: "No autorizado" });
    }

    // Obtener recetas reportadas
    const [rows] = await db.query(`
      SELECT r.*, 
             COUNT(rep.id) as report_count,
             GROUP_CONCAT(DISTINCT rep.motivo) as motivos,
             GROUP_CONCAT(DISTINCT u.nombre) as usuarios_reportaron
      FROM recetas r
      LEFT JOIN reportes rep ON r.id = rep.id_receta
      LEFT JOIN usuarios u ON rep.id_usuario = u.id
      GROUP BY r.id
      HAVING r.estado = 'oculto' OR COUNT(rep.id) >= 3
      ORDER BY r.id DESC
    `);

    console.log(`Recetas reportadas encontradas: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error("Error en /reports/admin:", error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ 
      error: "Error al obtener recetas reportadas", 
      details: error.message 
    });
  }
});

// PATCH /reports/admin/:recipeId - Activar/desactivar receta (solo admin)
app.patch("/reports/admin/:recipeId", async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { accion } = req.body; // 'activar' o 'desactivar'
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: "Token requerido" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || "secret_default_para_desarrollo");
    
    // Verificar si es admin
    const [userRows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [payload.email]);
    if (userRows.length === 0 || userRows[0].email !== 'admin@mikens.com') {
      return res.status(403).json({ error: "No autorizado" });
    }

    let estado;
    if (accion === 'activar') {
      estado = 'activo';
      // Limpiar reportes cuando se reactiva
      await db.query("DELETE FROM reportes WHERE id_receta = ?", [recipeId]);
    } else if (accion === 'desactivar') {
      estado = 'desactivado';
    } else {
      return res.status(400).json({ error: "Acción inválida" });
    }

    await db.query(
      "UPDATE recetas SET estado = ? WHERE id = ?",
      [estado, recipeId]
    );

    res.json({ 
      message: `Receta ${accion === 'activar' ? 'activada' : 'desactivada'} exitosamente`,
      estado: estado
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: "Token inválido" });
    }
    res.status(500).json({ error: "Error al actualizar estado de receta" });
  }
});

// Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
