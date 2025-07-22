// utils/pythonBridge.js
const { spawn } = require('child_process');
const path = require('path');

/**
 * Ejecuta un script de Python y devuelve su salida JSON.
 * @param {string} scriptName El nombre del script Python (ej. 'predict_and_recommend.py').
 * @param {Object} inputData Los datos a enviar al script Python como JSON.
 * @returns {Promise<Object>} Una promesa que resuelve con el objeto JSON de la salida del script.
 */
async function runPythonScript(scriptName, inputData) {
    return new Promise((resolve, reject) => {
        // La ruta al script Python debe ser relativa al directorio de ejecución del proceso Node.js (generalmente la raíz del proyecto)
        const pythonProcess = spawn('python', [path.join(__dirname, '../python_scripts', scriptName)]);
        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Error en el script Python ${scriptName}: ${errorOutput}`);
                try {
                    const errorJson = JSON.parse(errorOutput);
                    return reject(new Error(errorJson.error || `Script Python ${scriptName} terminó con código ${code}`));
                } catch (e) {
                    return reject(new Error(`Script Python ${scriptName} terminó con código ${code}. Error: ${errorOutput}`));
                }
            }
            try {
                const result = JSON.parse(output);
                if (result.error) {
                    return reject(new Error(result.error));
                }
                resolve(result);
            } catch (e) {
                reject(new Error(`Error al parsear la salida JSON del script Python ${scriptName}: ${e.message}. Salida: ${output}`));
            }
        });

        // Escribir los datos de entrada al stdin del proceso Python
        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();
    });
}

module.exports = { runPythonScript };