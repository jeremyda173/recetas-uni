-- Script para configurar las tablas necesarias para el sistema de reportes
-- Ejecutar este script en tu base de datos MySQL

-- Agregar columna estado a la tabla recetas si no existe
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

-- Crear tabla de reportes si no existe
CREATE TABLE IF NOT EXISTS reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (id_receta) REFERENCES recetas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_recipe_report (id_usuario, id_receta)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_reportes_receta ON reportes(id_receta);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_recetas_estado ON recetas(estado);

-- Verificar que las tablas se crearon correctamente
SHOW TABLES;
DESCRIBE reportes;
DESCRIBE recetas;
