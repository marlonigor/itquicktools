import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isUserAdmin, showModuleHeader, executeResilientCommand } from '../utils.js';

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

    describe('executeResilientCommand', () => {
        it('deve retornar status 0 e timedOut false quando o comando suceder', () => {
            const fakeSpawn = (cmd, opts) => {
                assert.equal(cmd, 'echo test');
                assert.equal(opts.shell, true);
                return { status: 0 };
            };

            const result = executeResilientCommand('echo test', {}, fakeSpawn);
            assert.equal(result.code, 0);
            assert.equal(result.timedOut, false);
        });

        it('deve identificar timeout ETIMEDOUT e retornar codigo 124 com timedOut true', () => {
            const fakeSpawn = (cmd, opts) => {
                assert.equal(opts.timeout, 1000);
                const timeoutErr = new Error('timed out');
                timeoutErr.code = 'ETIMEDOUT';
                return { status: null, error: timeoutErr };
            };

            const result = executeResilientCommand('ping 127.0.0.1', { timeoutMs: 1000 }, fakeSpawn);
            assert.equal(result.code, 124);
            assert.equal(result.timedOut, true);
        });

        it('deve tratar falha geral de processo e retornar codigo de erro', () => {
            const fakeSpawn = () => {
                return { status: null, error: new Error('command not found') };
            };

            const result = executeResilientCommand('invalid_cmd', {}, fakeSpawn);
            assert.equal(result.code, 1);
            assert.equal(result.timedOut, false);
        });
    });
});

