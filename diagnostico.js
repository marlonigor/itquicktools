import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter } from './utils.js';

export async function menuDiagnostico() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.cyan.bold('============================================='));
        console.log(chalk.cyan.bold('         🩺 MÓDULO DE DIAGNÓSTICO            '));
        console.log(chalk.cyan.bold('============================================='));
        console.log(chalk.gray('Nota: Estas opções abrem janelas externas do Windows.'));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramenta de Diagnóstico:',
                pageSize: 10,
                choices: [
                    '📊 Gerenciador de Tarefas (Task Manager)',
                    '📜 Visualizador de Eventos (Event Viewer)',
                    '🎮 Diagnóstico do DirectX (DxDiag)',
                    '🔌 Gerenciador de Dispositivos (Device Manager)',
                    '📈 Monitor de Desempenho (PerfMon)',
                    '🧠 Teste de Memória (Requer Reinício)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runDiagnosticTool(answer.action);
    }
}

async function runDiagnosticTool(action) {
    console.log('');

    // O comando 'start' abre a janela e libera o terminal imediatamente
    let cmd = '';

    switch (action) {
        case '📊 Gerenciador de Tarefas (Task Manager)':
            console.log(chalk.cyan('Abrindo Task Manager...'));
            cmd = 'start taskmgr';
            break;

        case '📜 Visualizador de Eventos (Event Viewer)':
            console.log(chalk.cyan('Abrindo Logs do Windows...'));
            cmd = 'start eventvwr';
            break;

        case '🎮 Diagnóstico do DirectX (DxDiag)':
            console.log(chalk.cyan('Carregando DxDiag (pode demorar)...'));
            cmd = 'start dxdiag';
            break;

        case '🔌 Gerenciador de Dispositivos (Device Manager)':
            console.log(chalk.cyan('Abrindo Gerenciador de Dispositivos...'));
            // devmgmt.msc é um snap-in do console, precisa rodar direto
            cmd = 'start devmgmt.msc';
            break;

        case '📈 Monitor de Desempenho (PerfMon)':
            console.log(chalk.cyan('Abrindo Monitor de Desempenho...'));
            cmd = 'start perfmon';
            break;

        case '🧠 Teste de Memória (Requer Reinício)':
            console.log(chalk.yellow('Atenção: Isso abrirá a janela de agendamento de verificação.'));
            cmd = 'start mdsched.exe';
            break;
    }

    if (cmd) {
        shell.exec(cmd);
        console.log(chalk.green('✔ Comando enviado ao sistema.'));
    }

    // Pausa curta só para ler a mensagem de sucesso
    await waitPressEnter();
}