import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';
import { waitPressEnter, isUserAdmin } from './utils.js';

export async function menuAvancado() {
    // 🔒 BLOQUEIO DE SEGURANÇA
    // Se não for Admin, expulsa do menu imediatamente.
    if (!isUserAdmin()) {
        console.clear();
        console.log(chalk.red.bold('⛔ ACESSO NEGADO'));
        console.log(chalk.yellow('As ferramentas avançadas exigem privilégios de Administrador.'));
        console.log(chalk.gray('Por favor, feche e abra o programa como "Executar como Administrador".'));
        await waitPressEnter();
        return; // Volta para o index.js
    }

    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.red.bold('============================================='));
        console.log(chalk.red.bold('       ⚙️  SCRIPTS AVANÇADOS (ADMIN)         '));
        console.log(chalk.red.bold('============================================='));
        console.log(chalk.gray('Nota: Estes processos podem demorar vários minutos.'));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'Ferramentas de Reparo:',
                choices: [
                    '🚑 Verificar Integridade (SFC Scan)',
                    '🏥 Verificar Imagem do Windows (DISM Check)',
                    '💊 Reparar Imagem do Windows (DISM Restore)',
                    '💾 Verificar Disco (CHKDSK - Leitura)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return;
        }

        await runAdvancedCommand(answer.action);
    }
}

async function runAdvancedCommand(action) {
    console.log('');

    switch (action) {
        case '🚑 Verificar Integridade (SFC Scan)':
            console.log(chalk.yellow('Iniciando System File Checker...'));
            console.log(chalk.gray('Isso vai buscar e corrigir arquivos corrompidos do Windows.'));
            console.log(chalk.cyan('Aguarde, isso pode demorar...'));
            // O output do sfc aparecerá em tempo real no terminal
            shell.exec('sfc /scannow');
            break;

        case '🏥 Verificar Imagem do Windows (DISM Check)':
            console.log(chalk.yellow('Verificando saúde da imagem do sistema...'));
            shell.exec('dism /online /cleanup-image /checkhealth');
            break;

        case '💊 Reparar Imagem do Windows (DISM Restore)':
            console.log(chalk.red('⚠ Atenção: Este processo baixa arquivos do Windows Update.'));
            console.log(chalk.yellow('Iniciando reparo profundo...'));
            shell.exec('dism /online /cleanup-image /restorehealth');
            break;

        case '💾 Verificar Disco (CHKDSK - Leitura)':
            console.log(chalk.cyan('Verificando sistema de arquivos (apenas leitura)...'));
            // Rodamos sem /f para não travar pedindo agendamento de reinicialização
            shell.exec('chkdsk');
            console.log(chalk.gray('\nPara correção completa, rode "chkdsk /f /r" manualmente no CMD e reinicie.'));
            break;
    }

    await waitPressEnter();
}