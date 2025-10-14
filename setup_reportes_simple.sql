-- Script simple para crear tabla de reportes
-- Si el anterior no funciona, usa este

-- Crear tabla de reportes
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT NOT NULL,
    id_receta INT NOT NULL,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agregar foreign keys después
ALTER TABLE reportes 
ADD CONSTRAINT fk_reportes_usuario 
FOREIGN KEY (id_usuario) REFERENCES usuarios(id) ON DELETE CASCADE;

ALTER TABLE reportes 
ADD CONSTRAINT fk_reportes_receta 
FOREIGN KEY (id_receta) REFERENCES recetas(id) ON DELETE CASCADE;

-- Agregar constraint único
ALTER TABLE reportes 
ADD CONSTRAINT unique_user_recipe_report 
UNIQUE (id_usuario, id_receta);

-- Agregar columna estado a recetas
ALTER TABLE recetas ADD COLUMN estado VARCHAR(20) DEFAULT 'activo';

-- Mostrar tablas creadas
SHOW TABLES;
DESCRIBE reportes;
DESCRIBE recetas;
