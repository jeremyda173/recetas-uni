# Sistema de Reportes de Recetas

## Descripción
Se ha implementado un sistema completo de reportes para las recetas que permite a los usuarios reportar contenido inapropiado y a los administradores gestionar estos reportes.

## Características Implementadas

### Para Usuarios:
- **Botón de Reportar**: Cada receta en la vista de comunidad tiene un botón de reportar
- **Modal de Reporte**: Interfaz intuitiva para seleccionar el motivo del reporte
- **Motivos Predefinidos**: 
  - Contenido inapropiado
  - Información falsa
  - Spam o publicidad
  - Contenido ofensivo
  - Violación de derechos de autor
  - Otro

### Para Administradores:
- **Panel de Reportes**: Nueva sección en el AdminPanel para gestionar recetas reportadas
- **Vista Detallada**: Información completa sobre los reportes (motivos, usuarios que reportaron)
- **Acciones de Moderación**:
  - **Activar**: Reactiva la receta y limpia todos los reportes
  - **Desactivar**: Desactiva la receta permanentemente

### Lógica del Sistema:
- **Umbral de Reportes**: Cuando una receta recibe 3 reportes, se oculta automáticamente
- **Prevención de Duplicados**: Un usuario no puede reportar la misma receta múltiples veces
- **Estados de Recetas**:
  - `activo`: Receta visible y disponible
  - `oculto`: Receta oculta por reportes (requiere revisión admin)
  - `desactivado`: Receta desactivada permanentemente por admin

## Configuración de Base de Datos

### 1. Ejecutar el Script SQL
Ejecuta el archivo `database_setup.sql` en tu base de datos MySQL:

```sql
-- Agregar columna estado a la tabla recetas
ALTER TABLE recetas ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'activo';

-- Crear tabla de reportes
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
```

### 2. Verificar la Configuración
Después de ejecutar el script, verifica que las tablas se crearon correctamente:

```sql
SHOW TABLES;
DESCRIBE reportes;
DESCRIBE recetas;
```

## Endpoints de la API

### Reportar Receta
```
POST /reports
Authorization: Bearer <token>
Body: {
  "recipeId": number,
  "motivo": string
}
```

### Obtener Recetas Reportadas (Admin)
```
GET /reports/admin
Authorization: Bearer <admin_token>
```

### Gestionar Receta Reportada (Admin)
```
PATCH /reports/admin/:recipeId
Authorization: Bearer <admin_token>
Body: {
  "accion": "activar" | "desactivar"
}
```

## Flujo de Trabajo

1. **Usuario Reporta**: Un usuario encuentra contenido inapropiado y hace clic en el botón de reportar
2. **Selección de Motivo**: El usuario selecciona el motivo del reporte en el modal
3. **Registro del Reporte**: El sistema registra el reporte en la base de datos
4. **Conteo Automático**: Si la receta llega a 3 reportes, se oculta automáticamente
5. **Notificación al Admin**: La receta aparece en el panel de administración
6. **Revisión del Admin**: El administrador revisa los detalles y toma una decisión
7. **Acción Final**: El admin activa (limpia reportes) o desactiva permanentemente

## Archivos Modificados

### Backend:
- `src/backend/index.js`: Nuevos endpoints para reportes

### Frontend:
- `src/pages/recetas/index.jsx`: Botón de reportar y modal
- `src/components/AdminPanel.jsx`: Panel de gestión de reportes
- `src/pages/recetas/styles.module.css`: Estilos para el modal de reportes
- `src/components/AdminPanel.module.css`: Estilos para el panel de reportes

### Base de Datos:
- `database_setup.sql`: Script de configuración

## Consideraciones de Seguridad

- **Autenticación Requerida**: Todos los endpoints requieren token válido
- **Autorización de Admin**: Solo administradores pueden gestionar reportes
- **Prevención de Spam**: Un usuario no puede reportar la misma receta múltiples veces
- **Validación de Datos**: Se validan todos los inputs del usuario

## Pruebas Recomendadas

1. **Reportar Receta**: Verificar que el modal funciona correctamente
2. **Límite de Reportes**: Crear 3 reportes para una receta y verificar que se oculta
3. **Panel de Admin**: Verificar que las recetas reportadas aparecen en el panel
4. **Acciones de Admin**: Probar activar y desactivar recetas
5. **Prevención de Duplicados**: Intentar reportar la misma receta dos veces

## Notas Adicionales

- El sistema es completamente funcional y listo para producción
- Los estilos son responsivos y se adaptan a dispositivos móviles
- Se mantiene la consistencia visual con el resto de la aplicación
- El código incluye manejo de errores y validaciones apropiadas
