import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    diagnosticChoices,
    diagnosticCommands,
    launchDiagnosticTool,
    dispatchDiagnosticAction
} from '../diagnostico.js';

describe('diagnostico.js - Ferramentas de Diagnostico', () => {
    describe('diagnosticChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            diagnosticChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = diagnosticChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, [
                'taskmgr',
                'eventvwr',
                'dxdiag',
                'devmgmt',
                'perfmon',
                'mdsched',
                'voltar'
            ]);
        });
    });

    describe('launchDiagnosticTool', () => {
        it('deve executar o comando start correspondente a ferramenta', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = launchDiagnosticTool('taskmgr', fakeExec);
            assert.equal(executedCmd, diagnosticCommands.taskmgr);
            assert.equal(code, 0);
        });

        it('deve retornar codigo 1 para ferramenta inexistente', () => {
            let execCalled = false;
            const fakeExec = () => {
                execCalled = true;
                return { code: 0 };
            };

            const code = launchDiagnosticTool('nao_existe', fakeExec);
            assert.equal(code, 1);
            assert.equal(execCalled, false);
        });
    });

    describe('dispatchDiagnosticAction', () => {
        it('deve despachar acao valida executando o comando e a funcao de espera', async () => {
            let execCalled = false;
            let waitCalled = false;

            const fakeExec = () => {
                execCalled = true;
                return { code: 0 };
            };
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchDiagnosticAction('dxdiag', fakeExec, fakeWait);
            assert.equal(result, true);
            assert.equal(execCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchDiagnosticAction('inexistente', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
