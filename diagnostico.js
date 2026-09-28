import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

const diagnosticChoices = [
    { name: '[1] Gerenciador de Tarefas (Task Manager)', value: 'taskmgr' },
    { name: '[2] Visualizador de Eventos (Event Viewer)', value: 'eventvwr' },
    { name: '[3] Diagnostico do DirectX (DxDiag)', value: 'dxdiag' },
    { name: '[4] Gerenciador de Dispositivos (Device Manager)', value: 'devmgmt' },
    { name: '[5] Monitor de Desempenho (PerfMon)', value: 'perfmon' },
    { name: '[6] Diagnostico de Memoria (mdsched)', value: 'mdsched' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

const diagnosticCommands = {
    taskmgr: 'start taskmgr',
    eventvwr: 'start eventvwr',
    dxdiag: 'start dxdiag',
    devmgmt: 'start devmgmt.msc',
    perfmon: 'start perfmon',
    mdsched: 'start mdsched.exe'
};

function launchDiagnosticTool(action) {
    const cmd = diagnosticCommands[action];
    if (!cmd) {
        return;
    }

    console.log(chalk.cyan(`Iniciando utilitario: ${action}...`));
    shell.exec(cmd);
    console.log(chalk.green('[OK] Comando enviado ao sistema operacional.'));
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

        console.log('');
        launchDiagnosticTool(answer.action);
        await waitPressEnter();
    }
}