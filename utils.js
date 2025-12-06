import inquirer from 'inquirer';

// Verifica se o usuário tem privilégios de administrador
export function isUserAdmin() {
    const result = ShellString.exec('net session', { silent: true });
    return result.code === 0;
}

// Pausa a execução até que o usuário pressione ENTER
export async function waitPressEnter() {
    console.log('');
    await inquirer.prompt([
        {
            type: 'input',
            name: 'enter',
            message: 'Pressione ENTER para continuar...',
        }
    ]);
}


