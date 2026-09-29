import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    advancedChoices,
    executeSfcScan,
    executeDismCheck,
    executeDismRestore,
    executeChkdsk,
    dispatchAdvancedAction
} from '../avancado.js';

describe('avancado.js - Scripts Avancados de Reparo', () => {
    describe('advancedChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            advancedChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = advancedChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, ['sfc', 'dism_check', 'dism_restore', 'chkdsk', 'voltar']);
        });
    });

    describe('executeSfcScan', () => {
        it('deve invocar sfc /scannow e retornar codigo de saida', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeSfcScan(fakeExec);
            assert.equal(executedCmd, 'sfc /scannow');
            assert.equal(code, 0);
        });
    });

    describe('executeDismCheck', () => {
        it('deve invocar dism checkhealth com parametros online corretos', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeDismCheck(fakeExec);
            assert.equal(executedCmd, 'dism /online /cleanup-image /checkhealth');
            assert.equal(code, 0);
        });
    });

    describe('executeDismRestore', () => {
        it('deve invocar dism restorehealth com parametros online corretos', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeDismRestore(fakeExec);
            assert.equal(executedCmd, 'dism /online /cleanup-image /restorehealth');
            assert.equal(code, 0);
        });
    });

    describe('executeChkdsk', () => {
        it('deve invocar chkdsk em modo somente leitura', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = executeChkdsk(fakeExec);
            assert.equal(executedCmd, 'chkdsk');
            assert.equal(code, 0);
        });
    });

    describe('dispatchAdvancedAction', () => {
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

            const result = await dispatchAdvancedAction('sfc', fakeExec, fakeWait);
            assert.equal(result, true);
            assert.equal(execCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchAdvancedAction('inexistente', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
