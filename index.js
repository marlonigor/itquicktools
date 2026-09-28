#!/usr/bin/env node
import path from 'path';
import { fileURLToPath } from 'url';
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

const categoryHandlers = {
    rede: menuRede,
    sistema: menuSistema,
    atualizacoes: menuAtualizacoes,
    limpeza: menuLimpeza,
    diagnostico: menuDiagnostico,
    avancado: menuAvancado
};

function renderAdminStatus(isAdmin) {
    if (isAdmin) {
        console.log(chalk.green.bold('          [MODO ADMINISTRADOR ATIVO]'));
        return;
    }
    console.log(chalk.yellow.bold('          [MODO RESTRITO - SEM ADMIN]'));
    console.log(chalk.red('          Algumas funcoes requerem elevacao de privilegios.'));
}

export function buildMainMenuChoices(isAdmin) {
    const cleanupLabel = isAdmin
        ? '[4] Limpeza (Cache, Temp, Lixeira)'
        : '[4] Limpeza (Modo Restrito - Sem Admin)';

    return [
        { name: '[1] Rede (IP, DNS, Ping, Tracert)', value: 'rede' },
        { name: '[2] Sistema (Info, Usuarios, Discos)', value: 'sistema' },
        { name: '[3] Atualizacoes (Winget, Windows Update)', value: 'atualizacoes' },
        { name: cleanupLabel, value: 'limpeza' },
        { name: '[5] Diagnostico (Eventos, Memoria, Desempenho)', value: 'diagnostico' },
        { name: '[6] Scripts Avancados (SFC, DISM, CHKDSK)', value: 'avancado' },
        new inquirer.Separator(),
        { name: '[0] Sair', value: 'sair' }
    ];
}

async function promptCategory(isAdmin) {
    const answer = await inquirer.prompt([
        {
            type: 'list',
            name: 'category',
            message: 'Selecione uma categoria:',
            pageSize: 10,
            choices: buildMainMenuChoices(isAdmin)
        }
    ]);
    return answer.category;
}

export async function handleChoice(category) {
    if (category === 'sair') {
        console.log(chalk.red('\nSaindo... Operacoes finalizadas.'));
        return false;
    }

    const handler = categoryHandlers[category];
    if (handler) {
        await handler();
        return true;
    }

    console.log(chalk.yellow(`\nOpcao nao reconhecida: ${category}`));
    await waitPressEnter();
    return true;
}

function shouldRunDirectly() {
    if (!process.argv[1]) {
        return false;
    }
    const invokedPath = path.resolve(process.argv[1]).toLowerCase();
    const currentPath = fileURLToPath(import.meta.url).toLowerCase();
    return invokedPath === currentPath;
}

export async function mainMenu() {
    let running = true;
    const isAdmin = isUserAdmin();

    while (running) {
        console.clear();
        showBanner();
        renderAdminStatus(isAdmin);
        console.log(chalk.gray('================================================================\n'));

        const category = await promptCategory(isAdmin);
        running = await handleChoice(category);
    }
}

if (shouldRunDirectly()) {
    mainMenu();
}