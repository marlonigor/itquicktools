import inquirer from 'inquirer';
import chalk from 'chalk';
import { menuRede } from './rede.js';
import { menuSistema } from './sistema.js';
import { waitPressEnter } from './utils.js';
import { menuLimpeza } from './limpeza.js';
import { isUserAdmin } from './utils.js';

async function mainMenu() {
    let running = true;

    while (running) {
        console.clear();
        // Renderização Condicional do Cabeçalho
        if (isAdmin) {
            console.log(chalk.green.bold('============================================='));
            console.log(chalk.green.bold('    🚀 IT QUICKTOOLS (MODO ADMINISTRADOR)    '));
            console.log(chalk.green.bold('============================================='));
        } else {
            console.log(chalk.yellow.bold('============================================='));
            console.log(chalk.yellow.bold('    ⚠️  IT QUICKTOOLS (MODO RESTRITO)        '));
            console.log(chalk.yellow.bold('============================================='));
            console.log(chalk.red('Algumas funções de limpeza falharão sem Admin.'));
        }
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
                    isAdmin ? '🧹 Limpeza (Cache, Temp, Lixeira)' : '🧹 Limpeza (⚠️ Limitado)',
                    '🩺 Diagnóstico (Eventos, Memória)',
                    '⚙️  Scripts Avançados (SFC, DISM)',
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

    // Lógica de Limpeza
    if (option.includes('Limpeza')) {
        await menuLimpeza();
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