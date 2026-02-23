# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)


## Como executar em qualquer computador (Windows/Linux/macOS)

> Objetivo: subir API + Frontend com um único comando e acessar tudo funcionando com persistência dos dados em JSON.

### 1) Pré-requisitos

- Node.js 20+ (recomendado 22)
- npm 10+
- Git (opcional, se for clonar)

### 2) Baixar o projeto e instalar dependências

Na **raiz** do projeto (`Projeto-Sartori`):

```sh
git clone <URL_DO_REPOSITORIO>
cd Projeto-Sartori
npm run install:app
```

### 3) Subir tudo (API + Frontend)

Ainda na raiz:

```sh
npm run up
```

Esse comando:
- sobe a API em `0.0.0.0:7070`
- sobe o Frontend em `0.0.0.0:8080`
- reinicia processos antigos automaticamente se já houver algo travado nessas portas.

### 4) Acessar o sistema

- Frontend (uso normal): `http://SEU_IP:8080`
- API Health (teste): `http://SEU_IP:7070/api/health`

Exemplo em rede local:
- `http://192.168.5.99:8080`
- `http://192.168.5.99:7070/api/health`

> Dica: no terminal do `npm run up`, o servidor mostra os IPs disponíveis da máquina.

### 5) Onde os dados ficam salvos

Os dados são salvos automaticamente em JSON dentro de:

`~/Downloads/SartoriOdontoDados`

Arquivos gerados:
- `pacientes.json`
- `indicacoes.json`
- `ranking_mensal.json`
- `ranking_all.json`

### 6) Se não abrir em outro computador da rede

- Verifique firewall liberando portas **7070** e **8080**.
- Garanta que ambos os computadores estão na mesma rede.
- Não use `localhost` no computador cliente; use o **IP da máquina servidor**.

## Rodando no GitHub Codespaces

No Codespaces, rode os comandos na raiz do repositório (`/workspaces/Projeto-Sartori`).

```sh
cd /workspaces/Projeto-Sartori
npm run install:app
npm run up
```

### Acesso no Codespaces

Abra as URLs da aba **PORTS**:

- Frontend: `https://<codespace>-8080.app.github.dev`
- API: `https://<codespace>-7070.app.github.dev`
- API Health: `https://<codespace>-7070.app.github.dev/api/health`

### Testes rápidos

```sh
curl -s http://127.0.0.1:7070/api/health
curl -s http://127.0.0.1:7070/api/pacientes
```
