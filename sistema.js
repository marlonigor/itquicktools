import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

const systemChoices = [
    { name: '[1] Hostname e Usuario Atual', value: 'whoami' },
    { name: '[2] Serial Number (BIOS)', value: 'bios' },
    { name: '[3] Versao do Windows', value: 'os_version' },
    { name: '[4] Listar Discos e Particoes', value: 'disks' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

function showHostAndUser() {
    console.log(chalk.cyan('Obtendo identificacao...'));
    shell.exec('hostname');
    shell.exec('whoami');
}

function showBiosSerial() {
    console.log(chalk.cyan('Lendo informacoes da BIOS...'));
    const query = 'Get-CimInstance Win32_Bios | Select-Object SerialNumber, Manufacturer | Format-Table -AutoSize';
    shell.exec(`powershell -Command "${query}"`);
}

function showWindowsVersion() {
    console.log(chalk.cyan('Verificando versao do Windows...'));
    const query = 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber | Format-Table -AutoSize';
    shell.exec(`powershell -Command "${query}"`);
}

function showDisks() {
    console.log(chalk.cyan('Listando volumes logicos...'));
    const query = 'Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, Size, FreeSpace | Format-Table -AutoSize';
    shell.exec(`powershell -Command "${query}"`);
}

const systemActions = {
    whoami: showHostAndUser,
    bios: showBiosSerial,
    os_version: showWindowsVersion,
    disks: showDisks
};

async function dispatchSystemAction(action) {
    const handler = systemActions[action];
    if (handler) {
        console.log('');
        handler();
        await waitPressEnter();
    }
}

export async function menuSistema() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Modulo de Sistema');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Informacoes do Sistema:',
                pageSize: 10,
                choices: systemChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchSystemAction(answer.action);
    }
}
