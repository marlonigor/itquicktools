import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    updateChoices,
    executeWingetUpgrade,
    executeDefenderUpdate,
    executeWindowsUpdateScan,
    dispatchUpdateAction
} from '../atualizacoes.js';

describe('atualizacoes.js - Central de Atualizacoes', () => {
    describe('updateChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            updateChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = updateChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, ['winget', 'defender', 'windows_update', 'voltar']);
        });
    });

    describe('executeWingetUpgrade', () => {
        it('deve chamar o comando correto do winget e retornar codigo 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const expectedCmd = 'winget upgrade --all --silent --accept-source-agreements --accept-package-agreements --disable-interactivity';
            const code = executeWingetUpgrade(fakeExec);
            assert.equal(executedCmd, expectedCmd);
            assert.equal(code, 0);
        });
    });


    describe('executeDefenderUpdate', () => {
        it('deve retornar 0 quando o comando do Defender suceder', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeDefenderUpdate(fakeExec);
            assert.match(executedCmd, /MpCmdRun\.exe.*-SignatureUpdate/);
            assert.equal(code, 0);
        });

        it('deve retornar codigo de erro quando o comando do Defender falhar', () => {
            const fakeExec = () => ({ code: 1 });
            const code = executeDefenderUpdate(fakeExec);
            assert.equal(code, 1);
        });
    });

    describe('executeWindowsUpdateScan', () => {
        it('deve chamar usoclient StartScan e retornar 0 em caso de sucesso', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeWindowsUpdateScan(fakeExec);
            assert.equal(executedCmd, 'usoclient StartScan');
            assert.equal(code, 0);
        });

        it('deve retornar codigo diferente de 0 em caso de falha', () => {
            const fakeExec = () => ({ code: 5 });
            const code = executeWindowsUpdateScan(fakeExec);
            assert.equal(code, 5);
        });
    });

    describe('dispatchUpdateAction', () => {
        it('deve despachar acao valida executando o handler e a funcao de espera', async () => {
            let execCalled = false;
            let waitCalled = false;

            const fakeExec = () => {
                execCalled = true;
                return { code: 0 };
            };
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchUpdateAction('winget', fakeExec, fakeWait);
            assert.equal(result, true);
            assert.equal(execCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchUpdateAction('desconhecido', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
