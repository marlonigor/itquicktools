import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, showModuleHeader } from './utils.js';

const networkChoices = [
    { name: '[1] Mostrar IP (ipconfig)', value: 'ipconfig' },
    { name: '[2] Limpar Cache DNS (flushdns)', value: 'flushdns' },
    { name: '[3] Teste de Conexao (Ping Google DNS)', value: 'ping' },
    { name: '[4] Rota de Pacotes (Tracert Google DNS)', value: 'tracert' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

function executeIpConfig() {
    console.log(chalk.cyan('Executando ipconfig...'));
    shell.exec('ipconfig');
}

function executeFlushDns() {
    console.log(chalk.cyan('Limpando cache DNS...'));
    const result = shell.exec('ipconfig /flushdns');
    if (result.code === 0) {
        console.log(chalk.green('\n[OK] Cache DNS limpo com sucesso!'));
        return;
    }
    console.log(chalk.red('\n[ERRO] Falha ao limpar DNS. Verifique permissoes de Administrador.'));
}

function executePing() {
    console.log(chalk.cyan('Executando ping para Google DNS (8.8.8.8)...'));
    shell.exec('ping 8.8.8.8');
}

function executeTracert() {
    console.log(chalk.cyan('Rastreando rota ate Google DNS (8.8.8.8)...'));
    console.log(chalk.gray('Pressione Ctrl+C se desejar interromper o rastreamento.'));
    shell.exec('tracert -d 8.8.8.8');
}

const networkActions = {
    ipconfig: executeIpConfig,
    flushdns: executeFlushDns,
    ping: executePing,
    tracert: executeTracert
};

async function dispatchNetworkAction(action) {
    const handler = networkActions[action];
    if (handler) {
        console.log('');
        handler();
        await waitPressEnter();
    }
}

export async function menuRede() {
    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Modulo de Rede');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Rede:',
                pageSize: 10,
                choices: networkChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchNetworkAction(answer.action);
    }
}