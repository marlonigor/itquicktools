import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildMainMenuChoices, handleChoice } from '../index.js';

describe('index.js - Menu e Roteamento', () => {
    describe('buildMainMenuChoices', () => {
        it('deve exibir rotulo de admin para limpeza quando isAdmin for true', () => {
            const choices = buildMainMenuChoices(true);
            const cleanupItem = choices.find((c) => c.value === 'limpeza');

            assert.ok(cleanupItem);
            assert.equal(cleanupItem.name, '[4] Limpeza (Cache, Temp, Lixeira)');
        });

        it('deve exibir rotulo restrito para limpeza quando isAdmin for false', () => {
            const choices = buildMainMenuChoices(false);
            const cleanupItem = choices.find((c) => c.value === 'limpeza');

            assert.ok(cleanupItem);
            assert.equal(cleanupItem.name, '[4] Limpeza (Modo Restrito - Sem Admin)');
        });

        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const choices = buildMainMenuChoices(true);
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

            choices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter opcao de saida com value sair', () => {
            const choices = buildMainMenuChoices(true);
            const exitItem = choices.find((c) => c.value === 'sair');

            assert.ok(exitItem);
            assert.equal(exitItem.name, '[0] Sair');
        });
    });

    describe('handleChoice', () => {
        it('deve retornar false para interromper o loop ao selecionar sair', async () => {
            const result = await handleChoice('sair');
            assert.equal(result, false);
        });
    });
});
