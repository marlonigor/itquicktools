import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';

/**
 * Checa se o processo atual possui privilegios de Administrador.
 * @returns {boolean} True se tiver privilegios elevados, false caso contrario.
 */
export function isUserAdmin() {
    const result = shell.exec('net session', { silent: true });
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
