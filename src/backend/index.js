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
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length > 0) return res.status(400).json({ error: "El email ya está registrado" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query("INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)", [
      nombre,
      email,
      hashedPassword,
    ]);
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
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "Usuario no encontrado" });

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login exitoso", token, user: { id: user.id, nombre: user.nombre, email: user.email } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el login" });
  }
});

// Servidor
app.listen(3001, () => {
  console.log("Servidor corriendo en http://localhost:3001");
});
