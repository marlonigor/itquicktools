import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
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
                    '🛡️  Atualizar Definições de Vírus (Defender)',
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
        console.log(chalk.cyan('Iniciando Winget Upgrade All...'));
        console.log(chalk.gray('--------------------------------------------------'));
        shell.exec('winget upgrade --all --include-unknown');
        console.log(chalk.gray('--------------------------------------------------'));
        console.log(chalk.green('✔ Processo do Winget finalizado.'));
    }
    else if (action.includes('Defender')) {
        console.log(chalk.cyan('Contatando Microsoft Protection Center...'));
        console.log(chalk.gray('Executando MpCmdRun.exe -SignatureUpdate'));

        // Tenta rodar o utilitário do Defender.
        // O caminho geralmente é padrão, mas usamos aspas por causa dos espaços.
        const cmd = '"%ProgramFiles%\\Windows Defender\\MpCmdRun.exe" -SignatureUpdate';

        const res = shell.exec(cmd, { silent: false });

        if (res.code === 0) {
            console.log(chalk.green('\n✔ Definições de vírus atualizadas com sucesso!'));
        } else {
            console.log(chalk.red('\n❌ Falha ao atualizar. Verifique sua conexão ou se é Admin.'));
        }
    }
    else if (action.includes('Windows Update')) {
        console.log(chalk.cyan('Contatando Windows Update Agent (USOClient)...'));
        const res = shell.exec('usoclient StartScan');

        if (res.code === 0) {
            console.log(chalk.green('✔ Sinal de verificação enviado com sucesso.'));
            console.log(chalk.yellow('Nota: O Windows Update fará o download em segundo plano.'));
        } else {
            console.log(chalk.red('❌ Erro ao invocar o cliente de update.'));
        }
    }

    await waitPressEnter();
}