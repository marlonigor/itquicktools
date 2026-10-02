import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

export const systemChoices = [
    { name: '[1] Hostname e Usuario Atual', value: 'whoami' },
    { name: '[2] Serial Number (BIOS)', value: 'bios' },
    { name: '[3] Versao do Windows', value: 'os_version' },
    { name: '[4] Listar Discos e Particoes', value: 'disks' },
    { name: '[5] Relatorio de Bateria (Battery Report)', value: 'battery_report' },
    { name: '[6] Estados de Energia Suportados (powercfg /a)', value: 'power_states' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

/**
 * Exibe o nome da maquina e o usuario atualmente autenticado.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function showHostAndUser(execFn = shell.exec) {
    console.log(chalk.cyan('Obtendo identificacao...'));
    execFn('hostname');
    const result = execFn('whoami');
    return result?.code ?? 0;
}

/**
 * Consulta fabricante e numero de serie da BIOS via CIM/WMI.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function showBiosSerial(execFn = shell.exec) {
    console.log(chalk.cyan('Lendo informacoes da BIOS...'));
    const query = 'Get-CimInstance Win32_Bios | Select-Object SerialNumber, Manufacturer | Format-Table -AutoSize';
    const result = execFn(`powershell -Command "${query}"`);
    return result?.code ?? 0;
}

/**
 * Consulta a versao detalhada, edicao e build do Windows.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function showWindowsVersion(execFn = shell.exec) {
    console.log(chalk.cyan('Verificando versao do Windows...'));
    const query = 'Get-CimInstance Win32_OperatingSystem | Select-Object Caption, Version, BuildNumber | Format-Table -AutoSize';
    const result = execFn(`powershell -Command "${query}"`);
    return result?.code ?? 0;
}

/**
 * Lista os volumes de disco e o espaco disponivel.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function showDisks(execFn = shell.exec) {
    console.log(chalk.cyan('Listando volumes logicos...'));
    const query = 'Get-CimInstance Win32_LogicalDisk | Select-Object DeviceID, VolumeName, Size, FreeSpace | Format-Table -AutoSize';
    const result = execFn(`powershell -Command "${query}"`);
    return result?.code ?? 0;
}

/**
 * Gera relatorio HTML de saude da bateria e abre no navegador padrao.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function generateBatteryReport(execFn = shell.exec) {
    console.log(chalk.cyan('Gerando relatorio de saude da bateria (powercfg)...'));
    const outputPath = '%TEMP%\\battery-report.html';
    const result = execFn(`powercfg /batteryreport /output "${outputPath}"`);
    if (result?.code === 0) {
        console.log(chalk.green(`\n[OK] Relatorio salvo em ${outputPath}. Abrindo no navegador...`));
        execFn(`start "" "${outputPath}"`);
        return 0;
    }
    console.log(chalk.yellow('\n[AVISO] Bateria nao detectada ou recurso nao suportado neste hardware.'));
    return result?.code ?? 1;
}

/**
 * Exibe os estados de suspensao e energia disponiveis no sistema.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @returns {number} Codigo de retorno do processo.
 */
export function showPowerStates(execFn = shell.exec) {
    console.log(chalk.cyan('Consultando estados de energia suportados (powercfg /a)...'));
    const result = execFn('powercfg /a');
    return result?.code ?? 0;
}

export const systemActions = {
    whoami: showHostAndUser,
    bios: showBiosSerial,
    os_version: showWindowsVersion,
    disks: showDisks,
    battery_report: generateBatteryReport,
    power_states: showPowerStates
};


/**
 * Despacha a acao de informacoes do sistema solicitada.
 * @param {string} action Identificador da acao.
 * @param {Function} [execFn=shell.exec] Funcao executora injetavel.
 * @param {Function} [waitFn=waitPressEnter] Funcao de espera interativa.
 * @returns {Promise<boolean>} True se acao despachada, false caso contrario.
 */
export async function dispatchSystemAction(
    action,
    execFn = shell.exec,
    waitFn = waitPressEnter
) {
    const handler = systemActions[action];
    if (!handler) {
        return false;
    }
    console.log('');
    handler(execFn);
    await waitFn();
    return true;
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

