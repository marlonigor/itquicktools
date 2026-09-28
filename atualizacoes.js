import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

const updateChoices = [
    { name: '[1] Atualizar Todos os Programas (Winget)', value: 'winget' },
    { name: '[2] Atualizar Definicoes de Virus (Windows Defender)', value: 'defender' },
    { name: '[3] Verificar Windows Update (Disparar Scan)', value: 'windows_update' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

function executeWingetUpgrade() {
    console.log(chalk.cyan('Iniciando Winget Upgrade All...'));
    console.log(chalk.gray('--------------------------------------------------'));
    shell.exec('winget upgrade --all --include-unknown');
    console.log(chalk.gray('--------------------------------------------------'));
    console.log(chalk.green('[OK] Processo do Winget finalizado.'));
}

function executeDefenderUpdate() {
    console.log(chalk.cyan('Contatando Microsoft Protection Center...'));
    console.log(chalk.gray('Executando MpCmdRun.exe -SignatureUpdate'));

    const cmd = '"%ProgramFiles%\\Windows Defender\\MpCmdRun.exe" -SignatureUpdate';
    const res = shell.exec(cmd, { silent: false });

    if (res.code === 0) {
        console.log(chalk.green('\n[OK] Definicoes de virus atualizadas com sucesso!'));
        return;
    }
    console.log(chalk.red('\n[ERRO] Falha ao atualizar. Verifique sua conexao ou privilegios de Administrador.'));
}

function executeWindowsUpdateScan() {
    console.log(chalk.cyan('Contatando Windows Update Agent (USOClient)...'));
    const res = shell.exec('usoclient StartScan');

    if (res.code === 0) {
        console.log(chalk.green('[OK] Sinal de verificacao enviado com sucesso.'));
        console.log(chalk.yellow('Nota: O Windows Update realizara o download em segundo plano.'));
        return;
    }
    console.log(chalk.red('[ERRO] Falha ao invocar o cliente de atualizacao.'));
}

const updateActions = {
    winget: executeWingetUpgrade,
    defender: executeDefenderUpdate,
    windows_update: executeWindowsUpdateScan
};

async function dispatchUpdateAction(action) {
    const handler = updateActions[action];
    if (handler) {
        console.log('');
        handler();
        await waitPressEnter();
    }
}

export async function menuAtualizacoes() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Central de Atualizacoes');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Selecione uma acao de atualizacao:',
                pageSize: 10,
                choices: updateChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchUpdateAction(answer.action);
    }
}