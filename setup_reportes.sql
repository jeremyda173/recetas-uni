-- Script para configurar el sistema de reportes
-- Ejecutar este script en tu base de datos MySQL

-- 1. Verificar si la tabla reportes existe
SELECT 'Verificando tabla reportes...' as status;

-- 2. Crear tabla de reportes si no existe
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

-- 3. Agregar columna estado a recetas si no existe
ALTER TABLE recetas 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

-- 4. Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_reportes_receta ON reportes(id_receta);
CREATE INDEX IF NOT EXISTS idx_reportes_usuario ON reportes(id_usuario);
CREATE INDEX IF NOT EXISTS idx_recetas_estado ON recetas(estado);

-- 5. Verificar que las tablas se crearon correctamente
SELECT 'Tablas creadas exitosamente' as status;

-- 6. Mostrar estructura de la tabla reportes
DESCRIBE reportes;

-- 7. Mostrar estructura de la tabla recetas
DESCRIBE recetas;

-- 8. Verificar reportes existentes
SELECT 'Reportes existentes:' as status;
SELECT * FROM reportes;

-- 9. Verificar recetas con conteo de reportes
SELECT 'Recetas con conteo de reportes:' as status;
SELECT r.id, r.titulo, r.autor, COUNT(rep.id) as report_count
FROM recetas r
LEFT JOIN reportes rep ON r.id = rep.id_receta
GROUP BY r.id, r.titulo, r.autor
ORDER BY r.id DESC;
