import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración para crear el archivo `audit.log` en la raíz del proyecto
const logPath = path.join(__dirname, '../../../../../../audit.log'); 
// Subir cinco niveles
// Subir cinco niveles desde el middleware
// Subir cuatro niveles

console.log("Ruta del archivo de log:", logPath); // Verifica la ruta en la consola

// Middleware de auditoría
export const auditLogger = (actionType) => (req, res, next) => {
    const timestamp = new Date().toISOString();
    const log = {
        actionType,
        userIp: req.ip,
        route: req.originalUrl,
        method: req.method,
        timestamp
    };

    // Guardar en el archivo audit.log
    fs.appendFile(logPath, JSON.stringify(log) + '\n', (err) => {
        if (err) {
            console.error('Error al guardar en el archivo de log:', err);
        } else {
            console.log('Registro de auditoría guardado.');
        }
    });

    next();
};
