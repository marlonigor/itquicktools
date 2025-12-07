import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import ora from 'ora';
import { waitPressEnter } from './utils.js';

export async function menuAtualizacoes() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.magenta.bold('============================================='));
        console.log(chalk.magenta.bold('          🔄 CENTRAL DE ATUALIZAÇÕES         '));
        console.log(chalk.magenta.bold('============================================='));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione uma ação:',
                pageSize: 10,
                choices: [
                    '📦 Atualizar Todos os Programas (Winget)',
                    '🪟 Verificar Windows Update (Dispara Scan)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runUpdateCommand(answer.action);
    }
}

async function runUpdateCommand(action) {
    console.log('');

    if (action.includes('Winget')) {
        console.log(chalk.cyan('Verificando pacotes instalados via Winget...'));
        console.log(chalk.gray('O sistema verificará e baixará atualizações para seus programas.'));
        console.log(chalk.gray('Acompanhe o progresso abaixo:'));
        console.log('');

        // Winget roda de forma síncrona aqui para que o usuário veja as barras de progresso nativas
        // --include-unknown tenta atualizar mesmo apps que o winget não tem certeza absoluta da versão
        shell.exec('winget upgrade --all --include-unknown');

        console.log(chalk.green('\n✔ Processo do Winget finalizado.'));
    }
    else if (action.includes('Windows Update')) {
        const spinner = ora('Solicitando verificação ao Windows Update Agent...').start();

        // Dispara o scan em background
        shell.exec('usoclient StartScan', { silent: true });

        // Pausa dramática para UX
        await new Promise(r => setTimeout(r, 2000));

        spinner.succeed(chalk.green('Solicitação enviada com sucesso!'));
        console.log(chalk.yellow('\nNota: O Windows baixará as atualizações em segundo plano.'));
        console.log(chalk.yellow('Verifique as "Configurações > Windows Update" se quiser acompanhar.'));
    }

    await waitPressEnter();
}