import inquirer from 'inquirer';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader, executeResilientCommand } from './utils.js';

export const networkChoices = [
    { name: '[1] Mostrar IP (ipconfig)', value: 'ipconfig' },
    { name: '[2] Limpar Cache DNS (flushdns)', value: 'flushdns' },
    { name: '[3] Liberar e Renovar IP (DHCP Release/Renew)', value: 'renew_dhcp' },
    { name: '[4] Redefinir Pilha de Rede (Winsock e TCP/IP)', value: 'reset_network' },
    { name: '[5] Teste de Conexao (Ping Google DNS)', value: 'ping' },
    { name: '[6] Rota de Pacotes (Tracert Google DNS)', value: 'tracert' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

/**
 * Exibe configuracao de rede do host.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeIpConfig(runnerFn = executeResilientCommand) {
    console.log(chalk.cyan('Executando ipconfig...'));
    const result = runnerFn('ipconfig', { timeoutMs: 15000 });
    return result?.code ?? 0;
}

/**
 * Limpa o cache DNS do sistema operacional.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeFlushDns(runnerFn = executeResilientCommand) {
    console.log(chalk.cyan('Limpando cache DNS...'));
    const result = runnerFn('ipconfig /flushdns', { timeoutMs: 15000 });
    if (result?.code === 0) {
        console.log(chalk.green('\n[OK] Cache DNS limpo com sucesso!'));
        return 0;
    }
    console.log(chalk.red('\n[ERRO] Falha ao limpar DNS. Verifique permissoes de Administrador.'));
    return result?.code ?? 1;
}

/**
 * Libera e renova as concessoes DHCP de todos os adaptadores de rede.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeRenewDhcp(runnerFn = executeResilientCommand) {
    console.log(chalk.cyan('Liberando concessao DHCP atual (ipconfig /release)...'));
    const releaseRes = runnerFn('ipconfig /release', { timeoutMs: 20000 });
    if (releaseRes?.code !== 0) {
        console.log(chalk.yellow('[AVISO] Nao foi possivel liberar todos os adaptadores.'));
    }
    console.log(chalk.cyan('\nSolicitando nova concessao DHCP (ipconfig /renew)...'));
    const renewRes = runnerFn('ipconfig /renew', { timeoutMs: 30000 });
    if (renewRes?.code === 0) {
        console.log(chalk.green('\n[OK] Concessao DHCP renovada com sucesso!'));
        return 0;
    }
    console.log(chalk.red('\n[ERRO] Falha ao renovar concessao DHCP.'));
    return renewRes?.code ?? 1;
}

/**
 * Redefine o catalogo Winsock e a pilha de protocolos TCP/IP.
 * Requer privilegios de Administrador e reinicio para efeito total.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeResetNetworkStack(runnerFn = executeResilientCommand) {
    console.log(chalk.yellow('Redefinindo catalogo Winsock...'));
    const winsockRes = runnerFn('netsh winsock reset', { timeoutMs: 15000 });
    console.log(chalk.yellow('\nRedefinindo pilha TCP/IP...'));
    const tcpRes = runnerFn('netsh int ip reset', { timeoutMs: 15000 });
    if (winsockRes?.code === 0 && tcpRes?.code === 0) {
        console.log(chalk.green('\n[OK] Pilha de rede e Winsock resetados com sucesso!'));
        console.log(chalk.cyan('[INFO] E recomendavel reiniciar o computador para concluir a redefinicao.'));
        return 0;
    }
    console.log(chalk.red('\n[ERRO] Falha ao redefinir pilha de rede. Requer privilegios de Administrador.'));
    return (winsockRes?.code !== 0 ? winsockRes?.code : tcpRes?.code) ?? 1;
}

/**
 * Testa latencia e perda de pacotes enviando ping ao DNS do Google.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executePing(runnerFn = executeResilientCommand) {
    console.log(chalk.cyan('Executando ping para Google DNS (8.8.8.8)...'));
    const result = runnerFn('ping 8.8.8.8', { timeoutMs: 20000 });
    return result?.code ?? 0;
}

/**
 * Rastreia saltos de rota ate o destino com timeout de protecao de 45s.
 * @param {Function} [runnerFn=executeResilientCommand] Executor resiliente injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function executeTracert(runnerFn = executeResilientCommand) {
    console.log(chalk.cyan('Rastreando rota ate Google DNS (8.8.8.8)...'));
    console.log(chalk.gray('Limite maximo de 45 segundos. Pressione Ctrl+C para interromper antes.'));
    const result = runnerFn('tracert -d 8.8.8.8', { timeoutMs: 45000 });
    return result?.code ?? 0;
}

export const networkActions = {
    ipconfig: executeIpConfig,
    flushdns: executeFlushDns,
    renew_dhcp: executeRenewDhcp,
    reset_network: executeResetNetworkStack,
    ping: executePing,
    tracert: executeTracert
};

/**
 * Despacha a acao de rede selecionada.
 * @param {string} action Identificador da acao.
 * @param {Function} [runnerFn=executeResilientCommand] Executor injetavel.
 * @param {Function} [waitFn=waitPressEnter] Funcao de espera interativa.
 * @returns {Promise<boolean>} True se acao despachada, false se desconhecida.
 */
export async function dispatchNetworkAction(
    action,
    runnerFn = executeResilientCommand,
    waitFn = waitPressEnter
) {
    const handler = networkActions[action];
    if (!handler) {
        return false;
    }
    console.log('');
    handler(runnerFn);
    await waitFn();
    return true;
}

export async function menuRede() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Modulo de Rede');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Rede:',
                pageSize: 10,
                choices: networkChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchNetworkAction(answer.action);
    }
}