import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    advancedChoices,
    executeSfcScan,
    executeDismCheck,
    executeDismRestore,
    executeChkdsk,
    auditBitLocker,
    auditSecureBoot,
    auditDefender,
    executeSecurityAudit,
    dispatchAdvancedAction
} from '../src/modulos/avancado.js';

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
            assert.deepEqual(values, ['sfc', 'dism_check', 'dism_restore', 'chkdsk', 'security_audit', 'voltar']);
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

        it('deve capturar falha ou timeout graciosamente e retornar codigo 1', () => {
            const fakeExec = () => {
                throw new Error('ETIMEDOUT');
            };

            const code = executeSfcScan(fakeExec);
            assert.equal(code, 1);
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

    describe('auditBitLocker', () => {
        it('deve invocar Get-BitLockerVolume via PowerShell e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = auditBitLocker(fakeExec);
            assert.equal(executedCmd.includes('Get-BitLockerVolume'), true);
            assert.equal(code, 0);
        });
    });

    describe('auditSecureBoot', () => {
        it('deve consultar chave de registro UEFISecureBootEnabled via PowerShell e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = auditSecureBoot(fakeExec);
            assert.equal(executedCmd.includes('UEFISecureBootEnabled'), true);
            assert.equal(code, 0);
        });
    });

    describe('auditDefender', () => {
        it('deve consultar status do Windows Defender via Get-MpComputerStatus e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = auditDefender(fakeExec);
            assert.equal(executedCmd.includes('Get-MpComputerStatus'), true);
            assert.equal(code, 0);
        });
    });

    describe('executeSecurityAudit', () => {
        it('deve orquestrar os tres componentes de auditoria e retornar 0', () => {
            const commands = [];
            const fakeExec = (cmd) => {
                commands.push(cmd);
                return { code: 0 };
            };

            const code = executeSecurityAudit(fakeExec);
            assert.equal(commands.length, 3);
            assert.equal(commands[0].includes('Get-BitLockerVolume'), true);
            assert.equal(commands[1].includes('UEFISecureBootEnabled'), true);
            assert.equal(commands[2].includes('Get-MpComputerStatus'), true);
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

        it('deve despachar security_audit com sucesso executando a rotina e espera', async () => {
            let execCalled = false;
            let waitCalled = false;

            const fakeExec = () => {
                execCalled = true;
                return { code: 0 };
            };
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchAdvancedAction('security_audit', fakeExec, fakeWait);
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
