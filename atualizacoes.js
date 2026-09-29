import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

export const updateChoices = [
    { name: '[1] Atualizar Todos os Programas (Winget)', value: 'winget' },
    { name: '[2] Atualizar Definicoes de Virus (Windows Defender)', value: 'defender' },
    { name: '[3] Verificar Windows Update (Disparar Scan)', value: 'windows_update' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

/**
 * Dispara a atualizacao de todos os programas via Winget.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos de sistema.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeWingetUpgrade(execFn = shell.exec) {
    console.log(chalk.cyan('Iniciando Winget Upgrade All...'));
    console.log(chalk.gray('--------------------------------------------------'));
    const res = execFn('winget upgrade --all --include-unknown');
    console.log(chalk.gray('--------------------------------------------------'));
    console.log(chalk.green('[OK] Processo do Winget finalizado.'));
    return res?.code ?? 0;
}

/**
 * Dispara a atualizacao das definicoes do Windows Defender via MpCmdRun.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos de sistema.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeDefenderUpdate(execFn = shell.exec) {
    console.log(chalk.cyan('Contatando Microsoft Protection Center...'));
    console.log(chalk.gray('Executando MpCmdRun.exe -SignatureUpdate'));

    const cmd = '"%ProgramFiles%\\Windows Defender\\MpCmdRun.exe" -SignatureUpdate';
    const res = execFn(cmd, { silent: false });

    if (res?.code === 0) {
        console.log(chalk.green('\n[OK] Definicoes de virus atualizadas com sucesso!'));
        return 0;
    }
    console.log(chalk.red('\n[ERRO] Falha ao atualizar. Verifique sua conexao ou privilegios de Administrador.'));
    return res?.code ?? 1;
}

/**
 * Dispara o escaneamento do Windows Update via USOClient.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos de sistema.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeWindowsUpdateScan(execFn = shell.exec) {
    console.log(chalk.cyan('Contatando Windows Update Agent (USOClient)...'));
    const res = execFn('usoclient StartScan');

    if (res?.code === 0) {
        console.log(chalk.green('[OK] Sinal de verificacao enviado com sucesso.'));
        console.log(chalk.yellow('Nota: O Windows Update realizara o download em segundo plano.'));
        return 0;
    }
    console.log(chalk.red('[ERRO] Falha ao invocar o cliente de atualizacao.'));
    return res?.code ?? 1;
}

export const updateActions = {
    winget: executeWingetUpgrade,
    defender: executeDefenderUpdate,
    windows_update: executeWindowsUpdateScan
};

/**
 * Roteia e executa a acao selecionada na Central de Atualizacoes.
 * @param {string} action Identificador da acao.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos.
 * @param {Function} [waitFn=waitPressEnter] Funcao de pausa interativa.
 * @returns {Promise<boolean>} True se acao executada com sucesso, false se desconhecida.
 */
export async function dispatchUpdateAction(action, execFn = shell.exec, waitFn = waitPressEnter) {
    const handler = updateActions[action];
    if (!handler) {
        return false;
    }
    console.log('');
    handler(execFn);
    await waitFn();
    return true;
}

export async function menuAtualizacoes() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Central de Atualizacoes');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione uma acao de atualizacao:',
                pageSize: 10,
                choices: updateChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchUpdateAction(answer.action);
    }
}