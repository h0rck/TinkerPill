import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import { jsonTransformService } from '../services/jsonTransformService';


// const containerName = 'devlocalhost.php-api';
// const envName = 'nilopoliseduca.dev';

let config = {
  containerName: '',
  envName: '',
};

ipcMain.on('set-config', (_event, newConfig) => {
  config = { ...config, ...newConfig }; 
  console.log('Configurações atualizadas:', config);
});


export function tinkerCommandEvent() {
  ipcMain.handle('execute-tinker', async (_event, command) => {
    console.log('Comando recebido:', config);
    if (!config.containerName || !config.envName) {
      return { error: 'As configurações containerName e envName não estão definidas.' };
    }

    return new Promise((resolve) => {
      command = command.replace(/^\s*<\?php\s*/, '').trim();

      const phpCommand = `
        DB::enableQueryLog();
        $result = ${command};
        $queries = DB::getQueryLog();
        echo json_encode(['result' => $result, 'queries' => $queries], JSON_PRETTY_PRINT);
      `;

      const tinkerProcess = spawn('docker', [
        'exec',
        '-i',
        config.containerName,
        'php',
        'artisan',
        'tinker',
        config.envName,
      ]);

      console.log('Comando PHP:',  'exec -i ' + config.containerName + ' php artisan tinker ' + config.envName);
      let output = '';
      let error = '';

      tinkerProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      tinkerProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      tinkerProcess.on('close', () => {
        if (error) {
          resolve({ error });
        } else {
          try {
            const formattedOutput = jsonTransformService(output);
            console.log('Resultado formatado:', formattedOutput);
            resolve(formattedOutput);
          } catch (err) {
            resolve({ error: `Transform error` });
          }
        }
      });

      tinkerProcess.stdin.write(`${phpCommand}\n`);
      tinkerProcess.stdin.end();
    });
  });
}