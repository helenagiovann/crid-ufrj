# CRID-UFRJ: Sistema de Registro Acadêmico em Solidity

Este repositório contém o código-fonte do projeto CRID-UFRJ, um protótipo de sistema de registro acadêmico descentralizado desenvolvido como parte da disciplina de Programação Avançada da UFRJ.

## Sobre o Projeto

O projeto implementa um smart contract na plataforma Ethereum utilizando a linguagem Solidity. Ele permite a criação de disciplinas, a matrícula de alunos e o lançamento de notas, com um sistema de permissões baseado em papéis (Administrador e Professor).

O objetivo é demonstrar a viabilidade da tecnologia blockchain para criar registros acadêmicos mais seguros, transparentes e imutáveis.

## Estrutura do Projeto

- **/contracts**: Contém o smart contract principal (`CRID.sol`).
- **/test**: Contém os testes unitários para o contrato (`CRID.test.js`).
- **/scripts**: Contém um script de interação (`interact.js`) para demonstrar o uso do contrato.
- **hardhat.config.js**: Arquivo de configuração do Hardhat.
- **.github/workflows/ci.yml**: Arquivo do pipeline de Integração Contínua (CI) com GitHub Actions, que executa os testes automaticamente.

## Como Executar

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/helenagiovann/crid-ufrj.git
   cd crid-ufrj

2. **Instale todas as dependências do projeto:**
   ```bash
   npm install

3. **Compile os contratos (opcional, `test` já faz isso):**
   ```bash
   npx hardhat compile

4. **Execute a suíte de testes para validar a lógica:**
   ```bash
   npx hardhat test