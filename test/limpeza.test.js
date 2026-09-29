import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
    cleanupChoices,
    cleanTempFiles,
    cleanRecycleBin,
    cleanPrefetch,
    cleanWindowsUpdateCache,
    dispatchCleanupAction
} from '../limpeza.js';

describe('limpeza.js - Modulo de Limpeza de Cache e Disco', () => {
    describe('cleanupChoices', () => {
        it('nao deve conter emojis em nenhum rotulo de opcao', () => {
            const emojiPattern = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
            cleanupChoices.forEach((choice) => {
                if (choice.name) {
                    assert.equal(emojiPattern.test(choice.name), false);
                }
            });
        });

        it('deve conter as opcoes esperadas incluindo opcao de voltar', () => {
            const values = cleanupChoices.map((c) => c.value).filter(Boolean);
            assert.deepEqual(values, [
                'temp',
                'recycle_bin',
                'prefetch',
                'software_distribution',
                'voltar'
            ]);
        });
    });

    describe('cleanTempFiles', () => {
        it('deve chamar comando de remocao de arquivos temporarios', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = cleanTempFiles(fakeExec);
            assert.match(executedCmd, /del.*%temp%/i);
            assert.equal(code, 0);
        });

        it('deve capturar erro e retornar 0 graciosamente quando houver arquivos travados', () => {
            const throwingExec = () => {
                throw new Error('Arquivo em uso');
            };

            const code = cleanTempFiles(throwingExec);
            assert.equal(code, 0);
        });
    });

    describe('cleanRecycleBin', () => {
        it('deve invocar cmdlet Clear-RecycleBin via powershell', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = cleanRecycleBin(fakeExec);
            assert.match(executedCmd, /powershell\.exe.*Clear-RecycleBin/);
            assert.equal(code, 0);
        });
    });

    describe('cleanPrefetch', () => {
        it('deve invocar delecao de prefetch e retornar 0 em caso de sucesso', () => {
            let executedCmd = null;
            const fakeExec = (cmd) => {
                executedCmd = cmd;
                return { code: 0 };
            };

            const code = cleanPrefetch(fakeExec);
            assert.match(executedCmd, /Prefetch/);
            assert.equal(code, 0);
        });

        it('deve retornar codigo diferente de 0 caso falhe por falta de privilegios', () => {
            const fakeExec = () => ({ code: 1 });
            const code = cleanPrefetch(fakeExec);
            assert.equal(code, 1);
        });
    });

    describe('cleanWindowsUpdateCache', () => {
        it('deve parar servico, recriar pasta de cache e reiniciar servico', () => {
            const executedCommands = [];
            const fakeExec = (cmd) => {
                executedCommands.push(cmd);
                return { code: 0 };
            };

            const code = cleanWindowsUpdateCache(fakeExec);
            assert.equal(code, 0);
            assert.equal(executedCommands.length, 4);
            assert.equal(executedCommands[0], 'net stop wuauserv');
            assert.match(executedCommands[1], /rd.*SoftwareDistribution\\Download/);
            assert.match(executedCommands[2], /mkdir.*SoftwareDistribution\\Download/);
            assert.equal(executedCommands[3], 'net start wuauserv');
        });
    });

    describe('dispatchCleanupAction', () => {
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

            const result = await dispatchCleanupAction('temp', fakeExec, fakeWait);
            assert.equal(result, true);
            assert.equal(execCalled, true);
            assert.equal(waitCalled, true);
        });

        it('deve retornar false e nao chamar espera para acao desconhecida', async () => {
            let waitCalled = false;
            const fakeWait = async () => {
                waitCalled = true;
            };

            const result = await dispatchCleanupAction('inexistente', () => {}, fakeWait);
            assert.equal(result, false);
            assert.equal(waitCalled, false);
        });
    });
});
