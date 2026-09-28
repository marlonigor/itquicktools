import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUserAdmin, showModuleHeader } from '../utils.js';

describe('utils.js', () => {
    describe('isUserAdmin', () => {
        it('deve retornar true quando o executor retornar codigo 0', () => {
            const fakeExec = (cmd, opts) => {
                assert.equal(cmd, 'net session');
                assert.equal(opts.silent, true);
                return { code: 0 };
            };

            const result = isUserAdmin(fakeExec);
            assert.equal(result, true);
        });

        it('deve retornar false quando o executor retornar codigo diferente de 0', () => {
            const fakeExec = () => ({ code: 1 });
            const result = isUserAdmin(fakeExec);
            assert.equal(result, false);
        });
    });

    describe('showModuleHeader', () => {
        it('deve formatar o titulo do modulo em letras maiusculas', () => {
            const loggedMessages = [];
            const originalLog = console.log;
            const originalClear = console.clear;

            console.clear = () => {};
            console.log = (msg) => loggedMessages.push(msg);

            try {
                showModuleHeader('modulo de teste');
                const containsTitle = loggedMessages.some((msg) =>
                    msg.includes('MODULO DE TESTE')
                );
                assert.equal(containsTitle, true);
            } finally {
                console.log = originalLog;
                console.clear = originalClear;
            }
        });
    });
});
