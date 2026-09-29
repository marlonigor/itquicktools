import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, isUserAdmin, showModuleHeader } from './utils.js';

export const advancedChoices = [
    { name: '[1] Verificar Integridade (SFC Scan)', value: 'sfc' },
    { name: '[2] Verificar Imagem do Windows (DISM Check)', value: 'dism_check' },
    { name: '[3] Reparar Imagem do Windows (DISM Restore)', value: 'dism_restore' },
    { name: '[4] Verificar Disco (CHKDSK - Somente Leitura)', value: 'chkdsk' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

async function notifyAccessDenied() {
    console.clear();
    console.log(chalk.red.bold('[ACESSO NEGADO]'));
    console.log(chalk.yellow('As ferramentas avancadas exigem privilegios de Administrador.'));
    console.log(chalk.gray('Por favor, feche e abra o terminal com "Executar como Administrador".'));
    await waitPressEnter();
}

/**
 * Executa o utilitario SFC (System File Checker) para checagem e reparo de arquivos.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeSfcScan(execFn = shell.exec) {
    console.log(chalk.yellow('Iniciando System File Checker...'));
    console.log(chalk.gray('Isso vai buscar e corrigir arquivos corrompidos do Windows.'));
    console.log(chalk.cyan('Aguarde, este processo pode demorar alguns minutos...'));
    const res = execFn('sfc /scannow');
    return res?.code ?? 0;
}

/**
 * Executa a verificacao da integridade da imagem do Windows com DISM.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeDismCheck(execFn = shell.exec) {
    console.log(chalk.yellow('Verificando saude da imagem do sistema...'));
    const res = execFn('dism /online /cleanup-image /checkhealth');
    return res?.code ?? 0;
}

/**
 * Dispara o procedimento de restauracao e reparo da imagem do Windows com DISM.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeDismRestore(execFn = shell.exec) {
    console.log(chalk.red('[ATENCAO] Este processo baixa arquivos de reparo do Windows Update.'));
    console.log(chalk.yellow('Iniciando reparo profundo da imagem...'));
    const res = execFn('dism /online /cleanup-image /restorehealth');
    return res?.code ?? 0;
}

/**
 * Executa checagem somente leitura do sistema de arquivos com CHKDSK.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeChkdsk(execFn = shell.exec) {
    console.log(chalk.cyan('Verificando sistema de arquivos (modo somente leitura)...'));
    const res = execFn('chkdsk');
    console.log(chalk.gray('\nPara correcao completa agendada, execute "chkdsk /f /r" manualmente.'));
    return res?.code ?? 0;
}

export const advancedActions = {
    sfc: executeSfcScan,
    dism_check: executeDismCheck,
    dism_restore: executeDismRestore,
    chkdsk: executeChkdsk
};

/**
 * Roteia e despacha a execucao da ferramenta avancada escolhida.
 * @param {string} action Identificador da acao.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @param {Function} [waitFn=waitPressEnter] Funcao de pausa interativa.
 * @returns {Promise<boolean>} True se acao despachada com sucesso, false caso contrario.
 */
export async function dispatchAdvancedAction(action, execFn = shell.exec, waitFn = waitPressEnter) {
    const handler = advancedActions[action];
    if (!handler) {
        return false;
    }
    console.log('');
    handler(execFn);
    await waitFn();
    return true;
}

export async function menuAvancado() {
    if (!isUserAdmin()) {
        await notifyAccessDenied();
        return;
    }

    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Scripts Avancados (Administrador)');
        console.log(chalk.gray('Nota: Estes processos podem demorar varios minutos para concluir.\n'));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Reparo:',
                pageSize: 10,
                choices: advancedChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchAdvancedAction(answer.action);
    }
}