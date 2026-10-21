import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { spawnSync } from 'node:child_process';

/**
 * Checa se o processo atual possui privilegios de Administrador.
 * Permite injecao de funcao executora para viabilizar testes unitarios isolados.
 * @param {Function} [execFn=shell.exec] Funcao executora de comandos de sistema.
 * @returns {boolean} True se tiver privilegios elevados, false caso contrario.
 */
export function isUserAdmin(execFn = shell.exec) {
    const result = execFn('net session', { silent: true });
    return result.code === 0;
}

/**
 * Pausa a execucao ate interacao do operador via tecla Enter.
 * @returns {Promise<void>}
 */
export async function waitPressEnter() {
    console.log('');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: 'Pressione ENTER para continuar...',
        }
    ]);
}

/**
 * Renderiza cabecalho padronizado de modulo sem utilizacao de emojis.
 * @param {string} title Titulo do modulo a ser exibido.
 */
export function showModuleHeader(title) {
    console.clear();
    console.log(chalk.blue.bold('============================================='));
    console.log(chalk.blue.bold(`  ${title.toUpperCase()}`));
    console.log(chalk.blue.bold('============================================='));
    console.log('');
}

/**
 * Normaliza o resultado do processo tratando timeout e falhas operacionais.
 * @param {object} result Retorno gerado pelo motor de execucao.
 * @param {number} timeoutMs Limite em milissegundos configurado.
 * @returns {{ code: number, timedOut: boolean }}
 */
function formatProcessResult(result, timeoutMs) {
    if (result?.error?.code === 'ETIMEDOUT') {
        const seconds = Math.round(timeoutMs / 1000);
        console.log(chalk.red(`\n[TIMEOUT] Operacao interrompida apos exceder o limite de ${seconds}s.`));
        return { code: 124, timedOut: true };
    }
    if (result?.error) {
        console.log(chalk.red(`\n[ERRO] Falha ao executar processo: ${result.error.message}`));
        return { code: 1, timedOut: false };
    }
    return { code: result?.status ?? 0, timedOut: false };
}

/**
 * Executa comando do sistema de forma resiliente com protecao contra travamento e timeout.
 * @param {string} command Linha de comando a ser executada no shell.
 * @param {object} [options={}] Parametros de execucao.
 * @param {number} [options.timeoutMs=0] Tempo limite em ms (0 desativa timeout).
 * @param {boolean} [options.silent=false] Silencia a saida padrao no terminal.
 * @param {Function} [spawnEngine=spawnSync] Motor de execucao injetavel para testes.
 * @returns {{ code: number, timedOut: boolean }}
 */
export function executeResilientCommand(command, options = {}, spawnEngine = spawnSync) {
    const { timeoutMs = 0, silent = false } = options;
    const stdio = silent ? 'pipe' : 'inherit';
    const spawnOpts = timeoutMs > 0 ? { shell: true, stdio, timeout: timeoutMs } : { shell: true, stdio };

    try {
        const result = spawnEngine(command, spawnOpts);
        return formatProcessResult(result, timeoutMs);
    } catch (err) {
        console.log(chalk.red(`\n[ERRO INESPERADO] ${err.message}`));
        return { code: 1, timedOut: false };
    }
}
