import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';

export async function menuSistema() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.blue.bold('============================================='));
        console.log(chalk.blue.bold('             MÓDULO DE SISTEMA               '));
        console.log(chalk.blue.bold('============================================='));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Informações do Sistema:',
                choices: [
                    '🆔 Hostname e Usuário Atual',
                    '🔢 Serial Number (BIOS)',
                    '🪟 Versão do Windows',
                    '📂 Listar Discos/Partições',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ])

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runSystemCommand(answer.action);
    }
}

async function runSystemCommand(action) {
    console.log('');

    switch (action) {
        case '🆔 Hostname e Usuário Atual':
            console.log(chalk.cyan('Obtendo identificação...'));
            // whoami mostra dominio\usuario
            shell.exec('hostname');
            shell.exec('whoami');
            break;

        case '🔢 Serial Number (BIOS)':
            console.log(chalk.cyan('Lendo BIOS...'));
            // Comando WMIC para pegar o serial da máquina (Dell/HP/Lenovo)
            shell.exec('wmic bios get serialnumber');
            break;

        case '🪟 Versão do Windows':
            console.log(chalk.cyan('Verificando build do Windows...'));
            // Pega o nome amigável do OS
            shell.exec('wmic os get caption, version');
            break;

        case '📂 Listar Discos/Partições':
            console.log(chalk.cyan('Listando volumes lógicos...'));
            // Mostra C:, D:, etc e espaço livre
            shell.exec('wmic logicaldisk get deviceid, volumename, size, freespace');
            break;
    }

    await waitPressEnter();
}

async function waitPressEnter() {
    console.log('');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: 'Pressione ENTER para continuar...',
        }
    ]);
}
