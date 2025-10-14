-- Script para crear la tabla de reportes
-- Ejecuta estos comandos uno por uno en tu base de datos MySQL

-- 1. Crear la tabla reportes
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Agregar foreign keys
ALTER TABLE reportes 
ADD FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE reportes 
ADD FOREIGN KEY (id_receta) REFERENCES recetas(id) ON DELETE CASCADE;

-- 3. Agregar constraint único para evitar reportes duplicados
ALTER TABLE reportes 
ADD UNIQUE KEY unique_user_recipe (id_usuario, id_receta);

-- 4. Agregar columna estado a la tabla recetas
ALTER TABLE recetas ADD COLUMN estado VARCHAR(20) DEFAULT 'activo';

-- 5. Verificar que se creó correctamente
SELECT 'Tabla reportes creada exitosamente' as mensaje;
SHOW TABLES LIKE 'reportes';
DESCRIBE reportes;
