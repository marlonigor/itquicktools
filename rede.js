import inquirer from 'inquirer';
import shell from 'shelljs';
import chalk from 'chalk';

// Exportamos a função principal deste módulo
export async function menuRede() {
    let inSubMenu = true;

    while (inSubMenu) {
        console.clear();
        console.log(chalk.blue.bold('============================================='));
        console.log(chalk.blue.bold('          🌐 MÓDULO DE REDE                  '));
        console.log(chalk.blue.bold('============================================='));
        console.log('');

        const answer = await inquirer.prompt([
            {
                type: 'list', // Se der bug, mude para 'rawlist'
                name: 'action',
                message: 'Ferramentas de Rede:',
                pageSize: 10,
                choices: [
                    '📝 Mostrar IP (ipconfig)',
                    '🧹 Limpar Cache DNS (flushdns)',
                    '📶 Teste de Conexão (Ping Google)',
                    '🗺️  Rota de Pacotes (Tracert)',
                    new inquirer.Separator(),
                    '🔙 Voltar ao Menu Principal'
                ]
            }
        ]);

        // Se escolher voltar, quebramos o loop deste submenu
        if (answer.action.includes('Voltar')) {
            inSubMenu = false;
            return; // Retorna o controle para o index.js
        }

        // Executa a ação escolhida
        await runNetworkCommand(answer.action);
    }
}

// Função auxiliar para organizar a execução dos comandos
async function runNetworkCommand(action) {
    console.log(''); // Pula linha

    switch (action) {
        case '📝 Mostrar IP (ipconfig)':
            console.log(chalk.cyan('Executando ipconfig...'));
            shell.exec('ipconfig');
            break;

        case '🧹 Limpar Cache DNS (flushdns)':
            console.log(chalk.cyan('Limpando DNS...'));
            // Tenta rodar e verifica se deu erro (código !== 0)
            const result = shell.exec('ipconfig /flushdns');
            if (result.code === 0) {
                console.log(chalk.green('\n✔ Cache DNS limpo com sucesso!'));
            } else {
                console.log(chalk.red('\n❌ Erro: Talvez você precise rodar como Administrador.'));
            }
            break;

        case '📶 Teste de Conexão (Ping Google)':
            console.log(chalk.cyan('Pingando Google DNS (8.8.8.8)...'));
            shell.exec('ping 8.8.8.8');
            break;

        case '🗺️  Rota de Pacotes (Tracert)':
            console.log(chalk.cyan('Rastreando rota até o Google (pode demorar)...'));
            console.log(chalk.gray('Pressione Ctrl+C se quiser cancelar no meio.'));
            shell.exec('tracert -d 8.8.8.8');
            break;
    }

    // Pausa para o usuário ler o resultado antes de limpar a tela
    await waitPressEnter();
}

// Função de pausa (igual a do index.js, mas local aqui)
async function waitPressEnter() {
    console.log('');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: 'Pressione ENTER para continuar...',
        }
    ]);
}