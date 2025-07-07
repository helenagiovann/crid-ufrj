const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CRID Contract", function () {
    let crid;
    let owner;
    let professor1;
    let aluno1;
    let aluno2;
    let otherAccount;

    beforeEach(async function () {
        [owner, professor1, aluno1, aluno2, otherAccount] = await ethers.getSigners();
        
        const CRIDFactory = await ethers.getContractFactory("CRID");
        // CORREÇÃO: O construtor agora é chamado no deploy pelo Hardhat/Ethers.js.
        // O `owner` da conta que faz o deploy será o dono inicial.
        crid = await CRIDFactory.deploy();
    });

    describe("Gerenciamento de Disciplinas", function () {
        it("Deveria permitir que o owner crie uma disciplina", async function () {
            await expect(crid.connect(owner).criarDisciplina("Calculo I", professor1.address))
                .to.emit(crid, "DisciplinaCriada")
                .withArgs(0, "Calculo I", professor1.address);

            // CORREÇÃO 1: Desestruturando o array de retorno da função `getDisciplina`.
            const [id, nome, professor] = await crid.getDisciplina(0);
            
            expect(id).to.equal(0);
            expect(nome).to.equal("Calculo I");
            expect(professor).to.equal(professor1.address);
        });

        it("Nao deveria permitir que non-owners criem disciplinas", async function () {
            // CORREÇÃO 2: A verificação de erro do OpenZeppelin v5 mudou.
            // Agora verificamos pelo erro customizado `OwnableUnauthorizedAccount`.
            await expect(crid.connect(otherAccount).criarDisciplina("Fisica I", professor1.address))
                .to.be.revertedWithCustomError(crid, "OwnableUnauthorizedAccount")
                .withArgs(otherAccount.address);
        });
    });

    describe("Gerenciamento de Matriculas e Notas", function () {
        beforeEach(async function () {
            await crid.connect(owner).criarDisciplina("Programacao Avancada", professor1.address);
        });

        it("Deveria permitir que o professor da disciplina matricule um aluno", async function () {
            await expect(crid.connect(professor1).matricularAluno(0, aluno1.address))
                .to.emit(crid, "AlunoMatriculado")
                .withArgs(0, aluno1.address);
            
            const inscricao = await crid.inscricoes(0, aluno1.address);
            expect(inscricao.matriculado).to.be.true;
        });

        it("Nao deveria permitir que outra pessoa matricule um aluno", async function () {
            // Este teste continua o mesmo pois o `revert` usa uma string customizada nossa.
            await expect(crid.connect(otherAccount).matricularAluno(0, aluno1.address))
                .to.be.revertedWith("CRID: Apenas o professor da disciplina pode realizar esta acao.");
        });

        it("Deveria permitir que o professor lance uma nota para um aluno matriculado", async function () {
            await crid.connect(professor1).matricularAluno(0, aluno1.address);

            await expect(crid.connect(professor1).lancarNota(0, aluno1.address, 95))
                .to.emit(crid, "NotaLancada")
                .withArgs(0, aluno1.address, 95);

            expect(await crid.getNota(0, aluno1.address)).to.equal(95);
        });

        it("Nao deveria permitir lancar nota para um aluno nao matriculado", async function () {
            await expect(crid.connect(professor1).lancarNota(0, aluno2.address, 80))
                .to.be.revertedWith("CRID: Aluno nao esta matriculado nesta disciplina.");
        });

         it("Nao deveria permitir lancar uma nota maior que 100", async function () {
            await crid.connect(professor1).matricularAluno(0, aluno1.address);
            await expect(crid.connect(professor1).lancarNota(0, aluno1.address, 101))
                .to.be.revertedWith("CRID: Nota deve ser entre 0 e 100.");
        });
    });
});