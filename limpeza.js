import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import ora from 'ora';
import { waitPressEnter } from './utils.js';
import { execSync } from 'child_process';

export async function menuLimpeza() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.yellow.bold('============================================='));
        console.log(chalk.yellow.bold('          🧹 MÓDULO DE LIMPEZA               '));
        console.log(chalk.yellow.bold('============================================='));
        console.log(chalk.gray('Nota: Arquivos em uso pelo sistema não serão apagados.'));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione o tipo de limpeza:',
                pageSize: 10,
                choices: [
                    '🌡️  Arquivos Temporários (%TEMP%)',
                    '🗑️  Esvaziar Lixeira (PowerShell)',
                    '🚀 Cache do Windows (Prefetch - Requer Admin)',
                    '💾 Cache do Windows Update (Requer Admin)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runCleanupCommand(answer.action);
    }
}

async function execWithSpinner(command, startText, successText) {
    const spinner = ora(startText).start();

    return new Promise((resolve) => {
        // { async: true } permite que o Node continue rodando a animação do spinner
        // silent: true esconde o output feio do comando (ex: "deleted file x...")
        shell.exec(command, { async: true, silent: true }, (code, stdout, stderr) => {
            if (code === 0) {
                spinner.succeed(chalk.green(successText));
            } else {
                spinner.fail(chalk.red('Ocorreu um erro ou falta permissão.'));
                // Opcional: mostrar o erro se falhar
                // console.error(stderr); 
            }
            resolve(code);
        });
    });
}

async function runCleanupCommand(action) {
    console.log('');

    switch (action) {
        case '🌡️  Arquivos Temporários (%TEMP%)':
            await execWithSpinner(
                'del /f /s /q %temp%\\*',
                'Varrendo e deletando arquivos temporários...',
                'Limpeza de temporários concluída!'
            );
            break;

        case '🗑️  Esvaziar Lixeira (PowerShell)':
            await execWithSpinner(
                'powershell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"',
                'Esvaziando a lixeira...',
                'Lixeira esvaziada com sucesso.'
            );
            break;

        case '🚀 Cache do Windows (Prefetch - Requer Admin)':
            await execWithSpinner(
                'del /f /s /q C:\\Windows\\Prefetch\\*',
                'Limpando pasta Prefetch...',
                'Cache Prefetch limpo.'
            );
            break;

        case '💾 Cache do Windows Update (Requer Admin)':
            console.log(chalk.cyan('Iniciando manutenção do Windows Update...'));

            // Aqui usamos sequencialmente pois um depende do outro
            await execWithSpinner('net stop wuauserv', 'Parando serviço Windows Update...', 'Serviço parado.');
            await execWithSpinner('rd /s /q C:\\Windows\\SoftwareDistribution\\Download', 'Apagando arquivos de cache...', 'Cache deletado.');
            shell.exec('mkdir C:\\Windows\\SoftwareDistribution\\Download', { silent: true }); // recria pasta rapidinho
            await execWithSpinner('net start wuauserv', 'Reiniciando serviço...', 'Serviço reiniciado.');

            console.log(chalk.green('✔ Processo completo.'));
            break;
    }

    await waitPressEnter();


}