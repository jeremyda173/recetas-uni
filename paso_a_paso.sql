-- PASO 1: Crear tabla básica
CREATE TABLE reportes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_usuario INT,
    id_receta INT,
    motivo TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PASO 2: Verificar que se creó
SHOW TABLES;

-- PASO 3: Ver estructura
DESCRIBE reportes;

-- PASO 4: Agregar foreign keys (opcional, puede fallar)
ALTER TABLE reportes ADD FOREIGN KEY (id_usuario) REFERENCES usuarios(id);
ALTER TABLE reportes ADD FOREIGN KEY (id_receta) REFERENCES recetas(id);

-- PASO 5: Agregar constraint único
ALTER TABLE reportes ADD UNIQUE KEY unique_report (id_usuario, id_receta);

-- PASO 6: Agregar columna estado a recetas
ALTER TABLE recetas ADD COLUMN estado VARCHAR(20) DEFAULT 'activo';
