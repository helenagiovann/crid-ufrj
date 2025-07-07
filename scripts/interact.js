const { ethers } = require("hardhat");

async function main() {
    console.log("--- Simulação de Interação com o Contrato CRID ---");
    
    // 1. Obter contas de teste
    const [owner, professor, aluno1, aluno2] = await ethers.getSigners();
    console.log("Endereços Utilizados:");
    console.log("  - Admin/Owner:", owner.address);
    console.log("  - Professor:  ", professor.address);
    console.log("  - Aluno 1:    ", aluno1.address);
    console.log("-------------------------------------------------");

    // 2. Fazer o deploy do contrato
    console.log("\n[PASSO 1] Fazendo o deploy do contrato com a conta do Admin...");
    const CRIDFactory = await ethers.getContractFactory("CRID");
    const crid = await CRIDFactory.deploy();
    await crid.waitForDeployment();
    const contractAddress = await crid.getAddress();
    console.log(`Contrato CRID deployado com sucesso no endereço: ${contractAddress}`);

    // 3. Admin cria uma disciplina
    console.log("\n[PASSO 2] Admin criando a disciplina 'Programação Avançada'...");
    let tx = await crid.connect(owner).criarDisciplina("Programação Avançada", professor.address);
    await tx.wait(); // Espera a transação ser minerada
    console.log("Disciplina criada com ID 0. Professor responsável:", professor.address);

    // 4. Professor matricula um aluno
    console.log(`\n[PASSO 3] Professor (${professor.address.substring(0,10)}...) matriculando o Aluno 1...`);
    tx = await crid.connect(professor).matricularAluno(0, aluno1.address);
    await tx.wait();
    console.log("Aluno 1 matriculado com sucesso na disciplina 0.");

    // 5. Professor lança a nota
    console.log("\n[PASSO 4] Professor lançando nota 95 (representando 9.5) para o Aluno 1...");
    tx = await crid.connect(professor).lancarNota(0, aluno1.address, 95);
    await tx.wait();
    console.log("Nota do Aluno 1 lançada com sucesso.");

    // 6. Verificação final
    const notaFinal = await crid.getNota(0, aluno1.address);
    console.log("\n[PASSO 5] Verificando o resultado final no contrato...");
    console.log(`=> A nota registrada para o Aluno 1 na disciplina 0 é: ${notaFinal.toString()}`);
    console.log("\n--- Simulação Concluída com Sucesso ---");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});