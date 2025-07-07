// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CRID
 * @dev Contrato para registro de disciplinas, matrículas e notas de alunos da UFRJ.
 * O 'owner' do contrato é considerado a administração central da universidade.
 */
contract CRID is Ownable {
    // --- Estruturas de Dados ---

    struct Disciplina {
        uint id;
        string nome;
        address professor; // Endereço do professor responsável
        bool ativa;
    }

    struct Inscricao {
        address aluno;
        uint8 nota; // Nota de 0 a 100 (representando 0.0 a 10.0)
        bool matriculado;
    }

    // --- Variáveis de Estado ---

    uint256 private _proximoIdDisciplina;
    
    // Mapeamento do ID da disciplina para sua estrutura
    mapping(uint => Disciplina) public disciplinas;

    // Mapeamento aninhado: ID da Disciplina -> Endereço do Aluno -> Inscrição
    mapping(uint => mapping(address => Inscricao)) public inscricoes;

    // --- Eventos ---

    event DisciplinaCriada(uint indexed id, string nome, address indexed professor);
    event AlunoMatriculado(uint indexed idDisciplina, address indexed aluno);
    event NotaLancada(uint indexed idDisciplina, address indexed aluno, uint8 nota);

    // --- Constructor ---


     constructor() Ownable(msg.sender) {
         _proximoIdDisciplina = 0;
     }

    // --- Modificadores ---

    modifier apenasProfessorDaDisciplina(uint _idDisciplina) {
        require(msg.sender == disciplinas[_idDisciplina].professor, "CRID: Apenas o professor da disciplina pode realizar esta acao.");
        _;
    }

    modifier disciplinaAtiva(uint _idDisciplina) {
        require(disciplinas[_idDisciplina].ativa, "CRID: Disciplina nao existe ou nao esta ativa.");
        _;
    }

    // --- Funções ---

    /**
     * @dev Cria uma nova disciplina. Apenas o administrador (owner) pode chamar.
     * @param _nome Nome da disciplina.
     * @param _professor Endereço Ethereum do professor responsável.
     */
    function criarDisciplina(string memory _nome, address _professor) public onlyOwner {
        uint id = _proximoIdDisciplina;
        disciplinas[id] = Disciplina({
            id: id,
            nome: _nome,
            professor: _professor,
            ativa: true
        });
        _proximoIdDisciplina++;
        emit DisciplinaCriada(id, _nome, _professor);
    }

    /**
     * @dev Matricula um aluno em uma disciplina. Apenas o professor da disciplina pode chamar.
     * @param _idDisciplina O ID da disciplina.
     * @param _aluno O endereço Ethereum do aluno.
     */
    function matricularAluno(uint _idDisciplina, address _aluno) 
        public 
        disciplinaAtiva(_idDisciplina) 
        apenasProfessorDaDisciplina(_idDisciplina) 
    {
        require(!inscricoes[_idDisciplina][_aluno].matriculado, "CRID: Aluno ja matriculado.");
        
        inscricoes[_idDisciplina][_aluno] = Inscricao({
            aluno: _aluno,
            nota: 0, // Nota inicial é 0
            matriculado: true
        });

        emit AlunoMatriculado(_idDisciplina, _aluno);
    }

    /**
     * @dev Lança a nota de um aluno. Apenas o professor da disciplina pode chamar.
     * @param _idDisciplina O ID da disciplina.
     * @param _aluno O endereço Ethereum do aluno.
     * @param _nota A nota do aluno (0-100).
     */
    function lancarNota(uint _idDisciplina, address _aluno, uint8 _nota) 
        public 
        disciplinaAtiva(_idDisciplina) 
        apenasProfessorDaDisciplina(_idDisciplina) 
    {
        require(inscricoes[_idDisciplina][_aluno].matriculado, "CRID: Aluno nao esta matriculado nesta disciplina.");
        require(_nota <= 100, "CRID: Nota deve ser entre 0 e 100.");

        inscricoes[_idDisciplina][_aluno].nota = _nota;

        emit NotaLancada(_idDisciplina, _aluno, _nota);
    }

    // --- Funções de Leitura (Views) ---

    function getNota(uint _idDisciplina, address _aluno) public view returns (uint8) {
        return inscricoes[_idDisciplina][_aluno].nota;
    }

    function getDisciplina(uint _idDisciplina) public view returns (uint, string memory, address) {
        Disciplina storage d = disciplinas[_idDisciplina];
        return (d.id, d.nome, d.professor);
    }
}