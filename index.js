import inquirer from 'inquirer';
import chalk from 'chalk';
import { menuRede } from './rede.js';
import { menuSistema } from './sistema.js';
import { waitPressEnter } from './utils.js';
import { menuLimpeza } from './limpeza.js';

async function mainMenu() {
    let running = true;

    while (running) {
        console.clear();
        console.log(chalk.green.bold('============================================='));
        console.log(chalk.green.bold('       🚀 IT QUICKTOOLS - SUPORTE TI         '));
        console.log(chalk.green.bold('============================================='));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list', // Lembre-se: use 'rawlist' se 'list' der bug
                name: 'category',
                message: 'Selecione uma categoria:',
                pageSize: 10,
                choices: [
                    '🌐 Rede (IP, DNS, Ping, Tracert)',
                    '💻 Sistema (Info, Usuários, Domínio)',
                    '🩺 Diagnóstico (Eventos, Memória)',
                    '🧹 Limpeza (Cache, Temp, Lixeira)',
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
        // Não precisamos de pausa aqui pois o próprio menuRede já tem interações
        // e quando ele termina, ele volta para cá
        return true;
    }

    // Lógica de Sistema
    if (option.includes('Sistema')) {
        await menuSistema();
        return true;
    }

    // Lógica Genérica para opções ainda não criadas
    console.log(chalk.yellow(`\nVocê escolheu: ${option}`));
    console.log(chalk.gray('Funcionalidade em desenvolvimento...'));

    // Obrigamos o usuário a confirmar que leu
    await waitPressEnter();

    return true; // Continua o loop
}

mainMenu();