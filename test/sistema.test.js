import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    systemChoices,
    showHostAndUser,
    showBiosSerial,
    showWindowsVersion,
    showDisks,
    generateBatteryReport,
    showPowerStates,
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
            assert.deepEqual(values, [
                'whoami',
                'bios',
                'os_version',
                'disks',
                'battery_report',
                'power_states',
                'voltar'
            ]);
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

    describe('generateBatteryReport', () => {
        it('deve gerar relatorio com powercfg, disparar visualizador e retornar 0', () => {
            const commands = [];
            const fakeExec = (cmd) => {
                commands.push(cmd);
                return { code: 0 };
            };

            const code = generateBatteryReport(fakeExec);
            assert.equal(commands[0].includes('powercfg /batteryreport'), true);
            assert.equal(commands[1].includes('start ""'), true);
            assert.equal(code, 0);
        });

        it('deve retornar codigo diferente de 0 e nao disparar start se falhar', () => {
            const commands = [];
            const fakeExec = (cmd) => {
                commands.push(cmd);
                return { code: 1 };
            };

            const code = generateBatteryReport(fakeExec);
            assert.equal(commands.length, 1);
            assert.equal(code, 1);
        });
    });

    describe('showPowerStates', () => {
        it('deve invocar powercfg /a e retornar 0', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = showPowerStates(fakeExec);
            assert.equal(executedCmd, 'powercfg /a');
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
