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
            console.log(chalk.yellow('Esvaziando lixeira...'));
            // Chamamos o PowerShell pois ele tem um comando nativo seguro para isso
            shell.exec('powershell.exe -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"');
            console.log(chalk.green('✔ Lixeira processada.'));
            break;

        case '🚀 Cache do Windows (Prefetch - Requer Admin)':
            console.log(chalk.yellow('Limpando pasta Prefetch...'));
            const resPrefetch = shell.exec('del /f /s /q C:\\Windows\\Prefetch\\*');
            if (resPrefetch.code !== 0) {
                console.log(chalk.red('❌ Falha: Provavelmente falta permissão de Administrador.'));
            } else {
                console.log(chalk.green('✔ Prefetch limpo.'));
            }
            break;

        case '💾 Cache do Windows Update (Requer Admin)':
            console.log(chalk.red('⚠ Atenção: Isso reiniciará o serviço do Windows Update.'));
            console.log(chalk.cyan('Parando serviço wuauserv...'));
            shell.exec('net stop wuauserv');

            console.log(chalk.cyan('Apagando cache de downloads...'));
            shell.exec('rd /s /q C:\\Windows\\SoftwareDistribution\\Download');
            // Recria a pasta vazia para evitar erros futuros
            shell.exec('mkdir C:\\Windows\\SoftwareDistribution\\Download');

            console.log(chalk.cyan('Reiniciando serviço wuauserv...'));
            shell.exec('net start wuauserv');
            console.log(chalk.green('✔ Manutenção do Windows Update concluída.'));
            break;
    }

    await waitPressEnter();


}