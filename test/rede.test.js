import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    networkChoices,
    executeIpConfig,
    executeFlushDns,
    executePing,
    executeTracert,
    dispatchNetworkAction
} from '../rede.js';

describe('rede.js - Ferramentas de Rede', () => {
    describe('networkChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            networkChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = networkChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, ['ipconfig', 'flushdns', 'ping', 'tracert', 'voltar']);
        });
    });

    describe('executeIpConfig', () => {
        it('deve chamar o comando ipconfig com timeout de 15s e retornar 0', () => {
            let capturedCmd = null;
            let capturedOpts = null;

            const fakeRunner = (cmd, opts) => {
                capturedCmd = cmd;
                capturedOpts = opts;
                return { code: 0, timedOut: false };
            };

            const code = executeIpConfig(fakeRunner);
            assert.equal(capturedCmd, 'ipconfig');
            assert.equal(capturedOpts.timeoutMs, 15000);
            assert.equal(code, 0);
        });
    });

    describe('executeFlushDns', () => {
        it('deve retornar 0 quando o comando de flushdns suceder', () => {
            const fakeRunner = (cmd, opts) => {
                assert.equal(cmd, 'ipconfig /flushdns');
                assert.equal(opts.timeoutMs, 15000);
                return { code: 0, timedOut: false };
            };

            const code = executeFlushDns(fakeRunner);
            assert.equal(code, 0);
        });

        it('deve retornar codigo diferente de 0 quando falhar', () => {
            const fakeRunner = () => ({ code: 1, timedOut: false });
            const code = executeFlushDns(fakeRunner);
            assert.equal(code, 1);
        });
    });

    describe('executePing', () => {
        it('deve executar ping com timeout de 20s e retornar 0', () => {
            let capturedCmd = null;
            let capturedOpts = null;

            const fakeRunner = (cmd, opts) => {
                capturedCmd = cmd;
                capturedOpts = opts;
                return { code: 0, timedOut: false };
            };

            const code = executePing(fakeRunner);
            assert.equal(capturedCmd, 'ping 8.8.8.8');
            assert.equal(capturedOpts.timeoutMs, 20000);
            assert.equal(code, 0);
        });
    });

    describe('executeTracert', () => {
        it('deve executar tracert com timeout de 45s e retornar 0', () => {
            let capturedCmd = null;
            let capturedOpts = null;

            const fakeRunner = (cmd, opts) => {
                capturedCmd = cmd;
                capturedOpts = opts;
                return { code: 0, timedOut: false };
            };

            const code = executeTracert(fakeRunner);
            assert.equal(capturedCmd, 'tracert -d 8.8.8.8');
            assert.equal(capturedOpts.timeoutMs, 45000);
            assert.equal(code, 0);
        });

        it('deve retornar codigo 124 graciosamente quando ocorrer timeout', () => {
            const fakeRunner = () => ({ code: 124, timedOut: true });
            const code = executeTracert(fakeRunner);
            assert.equal(code, 124);
        });
    });

    describe('dispatchNetworkAction', () => {
        it('deve despachar acao valida executando o runner e a funcao de espera', async () => {
            let runnerCalled = false;
            let waitCalled = false;

            const fakeRunner = () => {
                runnerCalled = true;
                return { code: 0, timedOut: false };
            };
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchNetworkAction('ping', fakeRunner, fakeWait);
            assert.equal(result, true);
            assert.equal(runnerCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchNetworkAction('invalid_action', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
