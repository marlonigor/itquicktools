import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, isUserAdmin, showModuleHeader } from './utils.js';

const advancedChoices = [
    { name: '[1] Verificar Integridade (SFC Scan)', value: 'sfc' },
    { name: '[2] Verificar Imagem do Windows (DISM Check)', value: 'dism_check' },
    { name: '[3] Reparar Imagem do Windows (DISM Restore)', value: 'dism_restore' },
    { name: '[4] Verificar Disco (CHKDSK - Somente Leitura)', value: 'chkdsk' },
    new inquirer.Separator(),
    { name: '[0] Voltar ao Menu Principal', value: 'voltar' }
];

async function notifyAccessDenied() {
    console.clear();
    console.log(chalk.red.bold('[ACESSO NEGADO]'));
    console.log(chalk.yellow('As ferramentas avancadas exigem privilegios de Administrador.'));
    console.log(chalk.gray('Por favor, feche e abra o terminal com "Executar como Administrador".'));
    await waitPressEnter();
}

function executeSfcScan() {
    console.log(chalk.yellow('Iniciando System File Checker...'));
    console.log(chalk.gray('Isso vai buscar e corrigir arquivos corrompidos do Windows.'));
    console.log(chalk.cyan('Aguarde, este processo pode demorar alguns minutos...'));
    shell.exec('sfc /scannow');
}

function executeDismCheck() {
    console.log(chalk.yellow('Verificando saude da imagem do sistema...'));
    shell.exec('dism /online /cleanup-image /checkhealth');
}

function executeDismRestore() {
    console.log(chalk.red('[ATENCAO] Este processo baixa arquivos de reparo do Windows Update.'));
    console.log(chalk.yellow('Iniciando reparo profundo da imagem...'));
    shell.exec('dism /online /cleanup-image /restorehealth');
}

function executeChkdsk() {
    console.log(chalk.cyan('Verificando sistema de arquivos (modo somente leitura)...'));
    shell.exec('chkdsk');
    console.log(chalk.gray('\nPara correcao completa agendada, execute "chkdsk /f /r" manualmente.'));
}

const advancedActions = {
    sfc: executeSfcScan,
    dism_check: executeDismCheck,
    dism_restore: executeDismRestore,
    chkdsk: executeChkdsk
};

async function dispatchAdvancedAction(action) {
    const handler = advancedActions[action];
    if (handler) {
        console.log('');
        handler();
        await waitPressEnter();
    }
}

export async function menuAvancado() {
    if (!isUserAdmin()) {
        await notifyAccessDenied();
        return;
    }

    let inSubMenu = true;

    while (inSubMenu) {
        showModuleHeader('Scripts Avancados (Administrador)');
        console.log(chalk.gray('Nota: Estes processos podem demorar varios minutos para concluir.\n'));

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Reparo:',
                pageSize: 10,
                choices: advancedChoices
            }
        ]);

        if (answer.action === 'voltar') {
            inSubMenu = false;
            return;
        }

        await dispatchAdvancedAction(answer.action);
    }
}