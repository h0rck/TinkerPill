import { ipcMain } from 'electron';
import { spawn } from 'child_process';

export function listarContainersEvent() {
    ipcMain.handle('listar-containers', async (_event) => {
        return new Promise((resolve, reject) => {
            const dockerProcess = spawn('docker', ['ps', '--format', '{{.Names}}']);

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
                    const containers = output.split('\n').map(line => line.trim()).filter(line => line);

                    resolve({ containers });
                }
            });
        });
    });
}