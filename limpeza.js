import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

export const cleanupChoices = [
    { name: '[1] Arquivos Temporarios (%TEMP%)', value: 'temp' },
    { name: '[2] Esvaziar Lixeira (PowerShell)', value: 'recycle_bin' },
    { name: '[3] Cache do Windows (Prefetch - Requer Admin)', value: 'prefetch' },
    { name: '[4] Cache do Windows Update (Requer Admin)', value: 'software_distribution' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

/**
 * Remove arquivos temporarios do usuario do diretorio %TEMP%.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno.
 */
export function cleanTempFiles(execFn = shell.exec) {
    console.log(chalk.yellow('Varrendo pasta temporaria do usuario (%TEMP%)...'));
    try {
        execFn('del /f /s /q %temp%\\*');
    } catch {
        console.log(chalk.gray('[AVISO] Arquivos em uso pelo sistema nao foram removidos.'));
    }
    console.log(chalk.green('\n[OK] Limpeza de temporarios finalizada.'));
    return 0;
}

/**
 * Dispara o comando PowerShell para esvaziar a Lixeira do Windows.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno.
 */
export function cleanRecycleBin(execFn = shell.exec) {
    console.log(chalk.cyan('Esvaziando Lixeira...'));
    const command = 'powershell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"';
    const res = execFn(command, { silent: false });
    console.log(chalk.green('[OK] Lixeira processada.'));
    return res?.code ?? 0;
}

/**
 * Remove arquivos de cache da pasta Prefetch (requer administrador).
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno.
 */
export function cleanPrefetch(execFn = shell.exec) {
    console.log(chalk.cyan('Limpando pasta Prefetch...'));
    const res = execFn('del /f /s /q C:\\Windows\\Prefetch\\*');
    if (res?.code !== 0) {
        console.log(chalk.red('\n[ERRO] Falha ao limpar Prefetch. Requer privilegios de Administrador.'));
        return res?.code ?? 1;
    }
    console.log(chalk.green('\n[OK] Prefetch limpo com sucesso.'));
    return 0;
}

/**
 * Para o servico wuauserv, limpa a pasta SoftwareDistribution e reinicia o servico.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno.
 */
export function cleanWindowsUpdateCache(execFn = shell.exec) {
    console.log(chalk.cyan('--- Parando servico Windows Update ---'));
    execFn('net stop wuauserv');

    console.log(chalk.cyan('\n--- Apagando arquivos de cache ---'));
    execFn('rd /s /q C:\\Windows\\SoftwareDistribution\\Download');
    execFn('mkdir C:\\Windows\\SoftwareDistribution\\Download', { silent: true });

    console.log(chalk.cyan('\n--- Reiniciando servico Windows Update ---'));
    execFn('net start wuauserv');

    console.log(chalk.green('\n[OK] Manutencao do Windows Update concluida.'));
    return 0;
}

export const cleanupActions = {
    temp: cleanTempFiles,
    recycle_bin: cleanRecycleBin,
    prefetch: cleanPrefetch,
    software_distribution: cleanWindowsUpdateCache
};

/**
 * Roteia e executa o procedimento de limpeza selecionado.
 * @param {string} action Identificador da acao de limpeza.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @param {Function} [waitFn=waitPressEnter] Funcao de pausa interativa.
 * @returns {Promise<boolean>} True se acao despachada com sucesso, false caso contrario.
 */
export async function dispatchCleanupAction(action, execFn = shell.exec, waitFn = waitPressEnter) {
    const handler = cleanupActions[action];
    if (!handler) {
        return false;
    }
    console.log('');
    handler(execFn);
    await waitFn();
    return true;
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