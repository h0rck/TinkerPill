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

interface ModelRelation {
    method: string;
    type: string;
    model: string;
}

let config = {
    containerName: '',
    envName: '',
    scanCache: null as {
        data: ModelInfo[];
        timestamp: number;
    } | null
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

            // If we have cache, return it
            if (config.scanCache) {
                return {
                    success: true,
                    data: config.scanCache.data,
                    fromCache: true
                };
            }

            // Only scan if we don't have cache
            const models: ModelInfo[] = [];

            // Lista todos os modelos
            const { stdout: modelsOutput } = await execAsync(
                `docker exec ${config.containerName} find app/Models -name "*.php"`
            );
            const modelFiles = modelsOutput.split('\n').filter(Boolean);

            // Lista todas as migrações
            const { stdout: migrationsOutput } = await execAsync(
                `docker exec ${config.containerName} find database/migrations -name "*.php"`
            );
            const migrations = migrationsOutput.split('\n').filter(Boolean);

            // Processa migrações para extrair colunas
            const tableColumns = new Map<string, string[]>();

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
                const relations: ModelRelation[] = [];
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
                    .map(match => match[0].replace('public function ', '').replace('(', ''))
                    .filter(method => !['__construct', ...relations.map(r => r.method)].includes(method));

                // Adiciona informações do modelo
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
                data: models,
                fromCache: false
            };

        } catch (error) {
            console.error('Erro ao escanear projeto Laravel no container:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    });

    // Evento para limpar cache
    ipcMain.handle('clear-laravel-scan', () => {
        config.scanCache = null;
        return { success: true };
    });

    // Evento para verificar status do cache
    ipcMain.handle('check-laravel-scan-cache', () => {
        return {
            hasCachedData: !!config.scanCache,
            timestamp: config.scanCache?.timestamp || null
        };
    });
}