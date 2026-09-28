import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { execSync } from 'child_process';
import { waitPressEnter, showModuleHeader } from './utils.js';

const cleanupChoices = [
    { name: '[1] Arquivos Temporarios (%TEMP%)', value: 'temp' },
    { name: '[2] Esvaziar Lixeira (PowerShell)', value: 'recycle_bin' },
    { name: '[3] Cache do Windows (Prefetch - Requer Admin)', value: 'prefetch' },
    { name: '[4] Cache do Windows Update (Requer Admin)', value: 'software_distribution' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

function cleanTempFiles() {
    console.log(chalk.yellow('Varrendo pasta temporaria do usuario (%TEMP%)...'));
    try {
        execSync('del /f /s /q %temp%\\*', { stdio: 'inherit' });
    } catch {
        console.log(chalk.gray('[AVISO] Arquivos em uso pelo sistema nao foram removidos.'));
    }
    console.log(chalk.green('\n[OK] Limpeza de temporarios finalizada.'));
}

function cleanRecycleBin() {
    console.log(chalk.cyan('Esvaziando Lixeira...'));
    const command = 'powershell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"';
    shell.exec(command, { silent: false });
    console.log(chalk.green('[OK] Lixeira processada.'));
}

function cleanPrefetch() {
    console.log(chalk.cyan('Limpando pasta Prefetch...'));
    const res = shell.exec('del /f /s /q C:\\Windows\\Prefetch\\*');
    if (res.code !== 0) {
        console.log(chalk.red('\n[ERRO] Falha ao limpar Prefetch. Requer privilegios de Administrador.'));
        return;
    }
    console.log(chalk.green('\n[OK] Prefetch limpo com sucesso.'));
}

function cleanWindowsUpdateCache() {
    console.log(chalk.cyan('--- Parando servico Windows Update ---'));
    shell.exec('net stop wuauserv');

    console.log(chalk.cyan('\n--- Apagando arquivos de cache ---'));
    shell.exec('rd /s /q C:\\Windows\\SoftwareDistribution\\Download');
    shell.exec('mkdir C:\\Windows\\SoftwareDistribution\\Download', { silent: true });

    console.log(chalk.cyan('\n--- Reiniciando servico Windows Update ---'));
    shell.exec('net start wuauserv');

    console.log(chalk.green('\n[OK] Manutencao do Windows Update concluida.'));
}

const cleanupActions = {
    temp: cleanTempFiles,
    recycle_bin: cleanRecycleBin,
    prefetch: cleanPrefetch,
    software_distribution: cleanWindowsUpdateCache
};

async function dispatchCleanupAction(action) {
    const handler = cleanupActions[action];
    if (handler) {
        console.log('');
        handler();
        await waitPressEnter();
    }
}

export async function menuLimpeza() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Modulo de Limpeza');
        console.log(chalk.gray('Nota: Arquivos em uso pelo sistema nao serao apagados.\n'));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione o tipo de limpeza:',
                pageSize: 10,
                choices: cleanupChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchCleanupAction(answer.action);
    }
}