import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter } from './utils.js';
import { execSync } from 'child_process';

export async function menuLimpeza() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.yellow.bold('============================================='));
        console.log(chalk.yellow.bold('          🧹 MÓDULO DE LIMPEZA               '));
        console.log(chalk.yellow.bold('============================================='));
        console.log(chalk.gray('Nota: Arquivos em uso pelo sistema não serão apagados.'));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione o tipo de limpeza:',
                pageSize: 10,
                choices: [
                    '🌡️  Arquivos Temporários (%TEMP%)',
                    '🗑️  Esvaziar Lixeira (PowerShell)',
                    '🚀 Cache do Windows (Prefetch - Requer Admin)',
                    '💾 Cache do Windows Update (Requer Admin)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runCleanupCommand(answer.action);
    }
}

async function runCleanupCommand(action) {
    console.log('');

    // Função auxiliar para rodar comandos mostrando tudo na tela
    const runVerbose = (cmd) => shell.exec(cmd, { silent: false });

    switch (action) {
        case '🌡️  Arquivos Temporários (%TEMP%)':
            console.log(chalk.yellow('Varrendo pasta temporária do usuário...'));
            try {
                // Usamos execSync nativo para não criar dependência do ShellJS dentro da pasta Temp
                // O "2>nul" esconde erros de arquivos em uso
                execSync('del /f /s /q %temp%\\*', { stdio: 'inherit' });
            } catch (e) {
                // Ignoramos erros, pois é normal não conseguir deletar alguns arquivos em uso
            }
            console.log(chalk.green('\n✔ Limpeza de temporários finalizada.'));
            break;

        case '🗑️  Esvaziar Lixeira (PowerShell)':
            console.log(chalk.cyan('Esvaziando Lixeira...'));
            // PowerShell não é muito verboso por padrão neste comando, mas vamos executar direto
            runVerbose('powershell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
            console.log(chalk.green('✔ Lixeira processada.'));
            break;

        case '🚀 Cache do Windows (Prefetch - Requer Admin)':
            console.log(chalk.cyan('Limpando pasta Prefetch...'));
            const res = runVerbose('del /f /s /q C:\\Windows\\Prefetch\\*');

            if (res.code !== 0) {
                console.log(chalk.red('\n❌ Erro: Verifique se você está rodando como Administrador.'));
            } else {
                console.log(chalk.green('\n✔ Prefetch limpo.'));
            }
            break;

        case '💾 Cache do Windows Update (Requer Admin)':
            console.log(chalk.cyan('--- Parando serviço Windows Update ---'));
            runVerbose('net stop wuauserv');

            console.log(chalk.cyan('\n--- Apagando arquivos de cache ---'));
            runVerbose('rd /s /q C:\\Windows\\SoftwareDistribution\\Download');
            shell.exec('mkdir C:\\Windows\\SoftwareDistribution\\Download', { silent: true });

            console.log(chalk.cyan('\n--- Reiniciando serviço Windows Update ---'));
            runVerbose('net start wuauserv');

            console.log(chalk.green('\n✔ Manutenção do Windows Update concluída.'));
            break;
    }

    await waitPressEnter();
}