import { ipcMain } from 'electron';
import { spawn } from 'child_process';
import { jsonTransformService } from '../services/jsonTransformService';


const containerName = 'devlocalhost.php-api';

export function tinkerCommandEvent() {
    
    ipcMain.handle('execute-tinker-command', async (_event, command) => {
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
            containerName,
            'php',
            'artisan',
            'tinker',
            '--env=nilopoliseduca.dev'
          ]);
    
          let output = '';
    
          tinkerProcess.stdout.on('data', (data) => {
            output += data.toString();
          });
    
          tinkerProcess.on('close', () => {
            // console.log(jsonTransformService(output).meta)
            const formattedOutput = jsonTransformService(output);
            resolve(formattedOutput);
          });
    
          tinkerProcess.stdin.write(`${phpCommand}\n`);
          tinkerProcess.stdin.end();
        });
      });
    }