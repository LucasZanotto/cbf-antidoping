Perfeito, bora deixar esse repo bonitão também 😎
Vou montar um README no mesmo estilo do PlotTale, mas focado no projeto CBF Antidoping.

Você pode só **copiar e colar** no `README.md` da raíz do repo:

<div align="center">
  <h1>CBF Antidoping</h1>
  <p><strong>Sistema de Gestão de Testes Antidoping da CBF (projeto acadêmico)</strong></p>
  <p>
    <a href="https://cbf-antidoping-front.onrender.com" target="_blank">
      <img src="https://img.shields.io/badge/Status-Online-brightgreen?style=for-the-badge" alt="Status Online">
    </a>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React">
    <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=prisma&logoColor=white" alt="Prisma">
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </p>
</div>

---

## 🚀 Projeto Online!

A aplicação está no ar e pode ser acessada em:

### **Frontend:**  
👉 **[https://cbf-antidoping-front.onrender.com](https://cbf-antidoping-front.onrender.com)**

<small>_**Nota:** Tanto o frontend quanto o backend estão hospedados em plano gratuito na Render. O primeiro acesso após algum tempo inativo pode levar alguns segundos enquanto os serviços "acordam"._</small>

---

## 📚 Sobre o Projeto

**CBF Antidoping** é um sistema web que simula o fluxo de gestão de testes antidoping da CBF, desde a criação da ordem de teste até o laudo final emitido por um laboratório credenciado.

A aplicação foi projetada para representar, de forma simplificada, o ecossistema real de antidoping:

- **Usuários com papéis distintos** (CBF, federações, clubes, laboratórios, reguladores, auditores).
- **Atletas** vinculados a federações e clubes.
- **Ordens de teste** geradas para atletas, com motivo, prioridade e contexto (competição, alvo, sorteio etc.).
- **Amostras** coletadas (urina/sangue), cada uma com código único e cadeia de custódia.
- **Laboratórios** que recebem, processam e reportam resultados.
- **Resultados de laboratório** com painel de substâncias, matriz, método e laudo em PDF.

É um projeto acadêmico, mas com foco em arquitetura limpa e próxima de um cenário real de sistema distribuído/enterprise.

---

## ✨ Funcionalidades Principais

- 👤 **Autenticação e Autorização**
  - Login por e-mail e senha, com JWT.
  - Perfis/roles:
    - `ADMIN_CBF`
    - `FED_USER`
    - `CLUB_USER`
    - `LAB_USER`
    - `REGULATOR`
    - `AUDITOR`

- 🧍 **Gestão de Atletas**
  - Cadastro de atletas com CBF Code, CPF (hash), data de nascimento, nacionalidade e status (ELIGIBLE, SUSPENDED, INACTIVE).
  - Vínculo de atletas a federações e clubes via **afiliações**.

- 🏢 **Federações e Clubes**
  - Cadastro de federações (UF + nome).
  - Clubes atrelados a uma federação específica.
  - Lookup leve para selects no frontend (busca por nome/UF).

- 🧪 **Ordens de Teste (Test Orders)**
  - Criação de ordens de teste informando:
    - Federação responsável
    - Clube (opcional)
    - Atleta (opcional)
    - Partida (matchId, opcional)
    - Motivo: `IN_COMPETITION`, `OUT_OF_COMPETITION`, `TARGETED`, `RANDOM`
    - Prioridade: `LOW`, `NORMAL`, `HIGH`, `URGENT`
  - Listagem com filtros por status, federação, clube, atleta e partida.
  - Atualização de status da ordem (REQUESTED, ASSIGNED, COLLECTING, SHIPPED, RECEIVED, ANALYZING, COMPLETED, VOID).

- 🧴 **Amostras**
  - Cadastro de amostras associadas a uma ordem de teste.
  - Tipos: `URINE`, `BLOOD`.
  - Controle de:
    - Data de coleta
    - Coletor
    - Cadeia de custódia (JSON)
    - Status da amostra (SEALED, SHIPPED, RECEIVED, ANALYZING, ARCHIVED)

- 🧬 **Laboratórios e Designações**
  - Cadastro de laboratórios (nome, código WADA, país, ativo/inativo).
  - **Lab Assignments**:
    - Atribuição de uma ordem de teste a um laboratório.
    - Status da designação: AWAITING_PICKUP, IN_TRANSIT, RECEIVED, PROCESSING, DONE.

- 📊 **Resultados de Teste**
  - Registro de `TestResult` para uma amostra:
    - Outcome: `NEGATIVE`, `AAF` (Adverse Analytical Finding), `INCONCLUSIVE`.
    - JSON com detalhes (painel de substâncias, matriz, método, notas).
    - Status final: `CONFIRMED`, `UNDER_APPEAL`, `RETRACTED`.
    - URL opcional para PDF.
  - Endpoint para **gerar laudo em PDF** contendo:
    - Dados do laboratório
    - Amostra
    - Atleta, clube e federação
    - Resultado e detalhes técnicos

---

## 🛠️ Tecnologias Utilizadas

### **Frontend**

- **React** com **Vite**
- **JavaScript/TypeScript**
- `react-router-dom` para roteamento
- `axios` para chamadas HTTP
- Componentes reutilizáveis para:
  - Layout
  - Toasts
  - Selects assíncronos (AsyncSelect)
- CSS modular com foco em layout responsivo

### **Backend**

- **NestJS** (Node.js + TypeScript)
- **Prisma ORM** falando com **PostgreSQL**
- **Autenticação JWT** (`passport-jwt`)
- Módulos organizados por domínio:
  - `auth`, `users`, `athletes`, `federations`, `clubs`,
  - `test-orders`, `samples`, `labs`, `lab-assignments`, `test-results`
- Geração de laudos em PDF a partir dos dados estruturados
- Hospedagem no **Render**

---

## ⚙️ Como Executar o Projeto Localmente

### 🔧 Pré-requisitos

- [Node.js](https://nodejs.org/) (versão 18+ recomendada)
- [Git](https://git-scm.com/)
- Um servidor **PostgreSQL** rodando localmente  
  (pode ser instalado direto ou via Docker)

---

### 1. Clonar o Repositório

```bash
git clone https://github.com/LucasZanotto/cbf-antidoping.git
cd cbf-antidoping
````

---

### 2. Backend – Configuração e Execução

```bash
cd backend

# Instalar dependências
npm install
```

Crie um arquivo `.env` dentro da pasta `backend` com algo como:

```env
# Banco local
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cbf_antidoping"

# Segredo JWT para geração/validação dos tokens
JWT_SECRET="UM_SEGREDO_BEM_FORTE_AQUI"
```

> Ajuste usuário/senha/porta de acordo com a sua instalação do PostgreSQL.

Agora, aplique as migrations e rode o seed (opcional, mas recomendado):

```bash
# Criar as tabelas no banco
npx prisma migrate dev --schema src/prisma/schema.prisma

# (Opcional) Rodar seed para dados iniciais
npx prisma db seed --schema src/prisma/schema.prisma
```

Por fim, suba o servidor Nest:

```bash
# Ambiente de desenvolvimento
npm run start:dev
```

O backend ficará disponível em:
👉 `http://localhost:3000/api/v1`

---

### 3. Frontend – Configuração e Execução

Em outro terminal:

```bash
cd frontend

# Instalar dependências
npm install
```

Crie um arquivo `.env` na pasta `frontend` com:

```env
VITE_API_BASE_URL="http://localhost:3000/api/v1"
```

Suba o servidor de desenvolvimento:

```bash
npm run dev
```

Por padrão, o frontend estará em:
👉 `http://localhost:5173`

Agora é só acessar `http://localhost:5173`, fazer login com um usuário seed (admin) e navegar pelo sistema.

---

## 🧪 Fluxo Geral de Uso

1. **Login** como usuário com permissão (ex.: `ADMIN_CBF` ou usuário de federação).
2. **Cadastrar federações e clubes** (ou usar os já criados via seed).
3. **Cadastrar atletas** e vincular a federação/clube.
4. **Criar ordens de teste** para determinados atletas.
5. **Registrar amostras** coletadas para essas ordens.
6. **Designar laboratórios** para processar as amostras.
7. **Registrar resultados de teste** (NEGATIVE, AAF, INCONCLUSIVE).
8. **Baixar/visualizar laudos em PDF** para análise e auditoria.

---

## 👨‍💻 Autor

Este projeto foi desenvolvido por:

* **Lucas Abati Zanotto** – [lucasabatizanotto@gmail.com](mailto:lucasabatizanotto@gmail.com)

---

<div align="center">
  <strong>Obrigado por conferir o projeto CBF Antidoping! ⚽🧪</strong>
</div>
```
