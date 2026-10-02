import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    systemChoices,
    showHostAndUser,
    showBiosSerial,
    showWindowsVersion,
    showDisks,
    dispatchSystemAction
} from '../sistema.js';

describe('sistema.js - Informacoes do Sistema', () => {
    describe('systemChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            systemChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = systemChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, ['whoami', 'bios', 'os_version', 'disks', 'voltar']);
        });
    });

    describe('showHostAndUser', () => {
        it('deve executar hostname e whoami e retornar codigo 0', () => {
            const executedCommands = [];
            const fakeExec = (cmd) => {
                executedCommands.push(cmd);
                return { code: 0 };
            };

            const code = showHostAndUser(fakeExec);
            assert.deepEqual(executedCommands, ['hostname', 'whoami']);
            assert.equal(code, 0);
        });
    });

    describe('showBiosSerial', () => {
        it('deve consultar informacoes da BIOS via PowerShell e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = showBiosSerial(fakeExec);
            assert.equal(executedCmd.includes('Win32_Bios'), true);
            assert.equal(code, 0);
        });
    });

    describe('showWindowsVersion', () => {
        it('deve consultar versao do sistema via PowerShell e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = showWindowsVersion(fakeExec);
            assert.equal(executedCmd.includes('Win32_OperatingSystem'), true);
            assert.equal(code, 0);
        });
    });

    describe('showDisks', () => {
        it('deve consultar discos logicos via PowerShell e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = showDisks(fakeExec);
            assert.equal(executedCmd.includes('Win32_LogicalDisk'), true);
            assert.equal(code, 0);
        });
    });

    describe('dispatchSystemAction', () => {
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

            const result = await dispatchSystemAction('whoami', fakeExec, fakeWait);
            assert.equal(result, true);
            assert.equal(execCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchSystemAction('opcao_invalida', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
