#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { mainMenu } from '../src/modulos/menu.js';

if (process.platform === 'win32') {
    try {
        spawnSync('cmd.exe', ['/c', 'chcp', '65001'], { stdio: 'ignore' });
    } catch {
        // Ignora silenciosamente se o ambiente nao suportar alteracao de codepage
    }
}

mainMenu();
