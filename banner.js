import figlet from 'figlet';
import gradient from 'gradient-string';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Hack para ter __dirname em ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function showBanner() {
    const text = 'IT Quick Tools';
    const fontPath = path.join(__dirname, 'assets', 'fonts', '3d.flf');

    try {
        // Carrega a fonte customizada
        const fontContent = fs.readFileSync(fontPath, 'utf8');
        figlet.parseFont('3d', fontContent);

        // Gera o ASCII
        const ascii = figlet.textSync(text, {
            font: '3d',
            horizontalLayout: 'default',
            verticalLayout: 'default'
        });

        // Aplica o gradiente arco-íris e imprime
        console.log(gradient.rainbow.multiline(ascii));
    } catch (err) {
        // Fallback caso a fonte falhe: imprime simples
        console.log(gradient.rainbow(text));
        console.error('Erro ao carregar banner:', err.message);
    }
}