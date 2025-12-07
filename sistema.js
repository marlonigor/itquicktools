import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter } from './utils.js';

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
                pageSize: 10,
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

    const runPS = (cmd) => shell.exec(`powershell -Command "${cmd}"`);

    switch (action) {
        case '🆔 Hostname e Usuário Atual':
            console.log(chalk.cyan('Obtendo identificação...'));
            // whoami mostra dominio\usuario
            shell.exec('hostname');
            shell.exec('whoami');
            break;

        case '🔢 Serial Number (BIOS)':
            console.log(chalk.cyan('Lendo BIOS...'));
            runPS('Get-CimInstance Win32_Bios | Select-Object SerialNumber, Manufacturer | Format-Table -AutoSize');
            break;

        case '🪟 Versão do Windows':
            console.log(chalk.cyan('Verificando build do Windows...'));
            runPS('Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber | Format-Table -AutoSize');
            break;

        case '📂 Listar Discos/Partições':
            console.log(chalk.cyan('Listando volumes lógicos...'));
            runPS('Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, Size, FreeSpace | Format-Table -AutoSize');
            break;
    }

    await waitPressEnter();
}
