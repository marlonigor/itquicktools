import inquirer from 'inquirer';
import chalk from 'chalk';
import { menuRede } from './rede.js';
import { menuSistema } from './sistema.js';
import { menuLimpeza } from './limpeza.js';
import { menuDiagnostico } from './diagnostico.js';
import { menuAvancado } from './avancado.js';
import { menuAtualizacoes } from './atualizacoes.js';
import { waitPressEnter, isUserAdmin } from './utils.js';
import { showBanner } from './banner.js';

async function mainMenu() {

    let running = true;

    const isAdmin = isUserAdmin();

    while (running) {
        console.clear()

        showBanner();

        if (isAdmin) {
            console.log(chalk.green.bold('          🚀 MODO ADMINISTRADOR ATIVO'));
        } else {
            console.log(chalk.yellow.bold('          ⚠️  MODO RESTRITO (SEM ADMIN)'));
            console.log(chalk.red('          Algumas funções falharão.'));
        }
        console.log(chalk.gray('================================================================'));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list',
                name: 'category',
                message: 'Selecione uma categoria:',
                pageSize: 10,
                choices: [
                    '🌐 Rede (IP, DNS, Ping, Tracert)',
                    '💻 Sistema (Info, Usuários, Domínio)',
                    '🔄 Atualizações (Winget, Windows Update)',
                    isAdmin ? '🧹 Limpeza (Cache, Temp, Lixeira)' : '🧹 Limpeza (⚠️ Limitado)',
                    '🩺 Diagnóstico (Eventos, Memória)',
                    '⚙️ Scripts Avançados (SFC, DISM)',
                    new inquirer.Separator(),
                    '❌ Sair'
                ]
            }
        ]);

        // O resultado define se o loop continua (true) ou para (false)
        running = await handleChoice(answer.category);
    }
}

// Roteador de escolhas
async function handleChoice(option) {
    if (option.includes('Sair')) {
        console.log(chalk.red('\nSaindo... Até mais! 👋'));
        return false; // Quebra o while e encerra
    }

    // Lógica de Rede
    if (option.includes('Rede')) {
        await menuRede();
        return true;
    }

    // Lógica de Sistema
    if (option.includes('Sistema')) {
        await menuSistema();
        return true;
    }

    // Lógica de Atualizações
    if (option.includes('Atualizações')) {
        await menuAtualizacoes();
        return true;
    }

    // Lógica de Limpeza
    if (option.includes('Limpeza')) {
        await menuLimpeza();
        return true;
    }

    // Lógica de Diagnóstico
    if (option.includes('Diagnóstico')) {
        await menuDiagnostico();
        return true;
    }

    // Lógica de Scripts Avançados
    if (option.includes('Scripts Avançados')) {
        await menuAvancado();
        return true;
    }

    // Lógica Genérica para opções ainda não criadas
    console.log(chalk.yellow(`\nVocê escolheu: ${option}`));
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));

    // Obriga o usuário a pressionar ENTER para continuar
    await waitPressEnter();

    return true; // Continua o loop
}

mainMenu();