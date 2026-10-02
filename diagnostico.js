import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

export const diagnosticChoices = [
    { name: '[1] Gerenciador de Tarefas (Task Manager)', value: 'taskmgr' },
    { name: '[2] Visualizador de Eventos (Event Viewer)', value: 'eventvwr' },
    { name: '[3] Diagnostico do DirectX (DxDiag)', value: 'dxdiag' },
    { name: '[4] Gerenciador de Dispositivos (Device Manager)', value: 'devmgmt' },
    { name: '[5] Monitor de Desempenho (PerfMon)', value: 'perfmon' },
    { name: '[6] Diagnostico de Memoria (mdsched)', value: 'mdsched' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

export const diagnosticCommands = {
    taskmgr: 'start taskmgr',
    eventvwr: 'start eventvwr',
    dxdiag: 'start dxdiag',
    devmgmt: 'start devmgmt.msc',
    perfmon: 'start perfmon',
    mdsched: 'start mdsched.exe'
};

/**
 * Dispara utilitario nativo do Windows atraves do shell.
 * @param {string} action Identificador do utilitario.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function launchDiagnosticTool(action, execFn = shell.exec) {
    const cmd = diagnosticCommands[action];
    if (!cmd) {
        return 1;
    }

    console.log(chalk.cyan(`Iniciando utilitario: ${action}...`));
    const result = execFn(cmd);
    console.log(chalk.green('[OK] Comando enviado ao sistema operacional.'));
    return result?.code ?? 0;
}

/**
 * Despacha a acao de diagnostico selecionada.
 * @param {string} action Identificador da ferramenta.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @param {Function} [waitFn=waitPressEnter] Funcao de pausa interativa.
 * @returns {Promise<boolean>} True se executado com sucesso, false caso contrario.
 */
export async function dispatchDiagnosticAction(
    action,
    execFn = shell.exec,
    waitFn = waitPressEnter
) {
    if (!diagnosticCommands[action]) {
        return false;
    }
    console.log('');
    launchDiagnosticTool(action, execFn);
    await waitFn();
    return true;
}

export async function menuDiagnostico() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Modulo de Diagnostico');
        console.log(chalk.gray('Nota: Estas opcoes abrem janelas externas do Windows.\n'));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Diagnostico:',
                pageSize: 10,
                choices: diagnosticChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchDiagnosticAction(answer.action);
    }
}