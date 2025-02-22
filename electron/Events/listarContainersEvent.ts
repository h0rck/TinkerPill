import { ipcMain } from 'electron';
import { spawn } from 'child_process';

export function listarContainersEvent() {
    ipcMain.handle('list-containers', async (_event) => {
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn('docker', ['ps']);

            let output = '';
            let error = '';

            dockerProcess.stdout.on('data', (data) => {
                output += data.toString();
            });

            dockerProcess.stderr.on('data', (data) => {
                error += data.toString();
            });

            dockerProcess.on('close', (code) => {
                if (error) {
                    reject({ error });
                } else {
                    // Processando a saída do comando "docker ps"
                    const containers = output.split('\n').map(line => line.trim()).filter(line => line);
                    resolve({ containers });
                }
            });
        });
    });
}
