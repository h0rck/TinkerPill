import { ipcMain } from 'electron';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface ModelInfo {
    name: string;
    tableName: string;
    columns: string[];
    relations: Array<{
        type: string;
        method: string;
        model: string;
    }>;
    methods: string[];
}

let config = {
    containerName: '',
    envName: '',
};

ipcMain.on('set-config', (_event, newConfig) => {
    config = { ...config, ...newConfig };
});

export function setupLaravelScanner() {
    ipcMain.handle('scan-laravel-project', async () => {
        try {
            if (!config.containerName) {
                throw new Error('Container name not configured');
            }

            const models: ModelInfo[] = [];

            // Comando para listar todos os modelos no container
            const { stdout: modelsOutput } = await execAsync(
                `docker exec ${config.containerName} find app/Models -name "*.php"`
            );
            const modelFiles = modelsOutput.split('\n').filter(Boolean);

            // Comando para listar todas as migrações
            const { stdout: migrationsOutput } = await execAsync(
                `docker exec ${config.containerName} find database/migrations -name "*.php"`
            );
            const migrations = migrationsOutput.split('\n').filter(Boolean);

            // Mapa para armazenar colunas das tabelas
            const tableColumns = new Map<string, string[]>();

            // Processa migrações para extrair colunas
            for (const migration of migrations) {
                const { stdout: content } = await execAsync(
                    `docker exec ${config.containerName} cat ${migration}`
                );

                const tableMatch = content.match(/Schema::create\(['"](.+?)['"]/);
                if (tableMatch) {
                    const tableName = tableMatch[1];
                    const columns = content.match(/\$table->\w+\(['"](\w+)['"]/g)?.map(col => {
                        const match = col.match(/['"](.*?)['"]/);
                        return match ? match[1] : '';
                    }).filter(Boolean) || [];

                    tableColumns.set(tableName, columns);
                }
            }

            // Processa cada modelo
            for (const modelFile of modelFiles) {
                const { stdout: content } = await execAsync(
                    `docker exec ${config.containerName} cat ${modelFile}`
                );

                const modelName = modelFile.split('/').pop()?.replace('.php', '');
                if (!modelName) continue;

                // Extrai nome da tabela
                const tableMatch = content.match(/protected \$table = ['"](.+?)['"];/);
                const tableName = tableMatch?.[1] || modelName.toLowerCase() + 's';

                // Extrai relacionamentos
                const relations = [];
                const relationRegex = /public function (\w+)\(\)\s*\{[\s\n]*return \$this->(hasMany|belongsTo|hasOne|belongsToMany)\(([^)]+)\)/g;
                let relationMatch;

                while ((relationMatch = relationRegex.exec(content)) !== null) {
                    relations.push({
                        method: relationMatch[1],
                        type: relationMatch[2],
                        model: relationMatch[3].split(',')[0].trim().replace(/['"]/g, '')
                    });
                }

                // Extrai métodos personalizados
                const methodRegex = /public function (?!__)\w+\(/g;
                const methods = Array.from(content.matchAll(methodRegex))
                    .map(match => match[0].replace('public function ', '').replace('(', ''));

                models.push({
                    name: modelName,
                    tableName,
                    columns: tableColumns.get(tableName) || [],
                    relations,
                    methods
                });
            }

            return {
                success: true,
                data: models
            };

        } catch (error) {
            console.error('Erro ao escanear projeto Laravel no container:', error);
            return {
                success: false,
                error: error || 'Unknown error'
            };
        }
    });
}