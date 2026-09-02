# Ficha Tormenta 20 — Online com Login Google

Ficha de personagem de Tormenta 20 com login via conta Google e salvamento automático na nuvem (Firestore). Cada jogador só vê e edita as próprias fichas.

## 1. Criar o projeto no Firebase (grátis)

1. Acesse https://console.firebase.google.com e clique em **"Adicionar projeto"**.
2. Dê um nome (ex: `ficha-t20`) e finalize a criação.
3. No menu lateral, vá em **Build > Authentication** → aba **Sign-in method** → habilite o provedor **Google**.
4. Vá em **Build > Firestore Database** → **Criar banco de dados** → escolha **modo de produção** (as regras de segurança estão no passo 4).
5. Ainda no console, vá em **Configurações do projeto** (ícone de engrenagem) > **Geral** > role até **"Seus aplicativos"** > clique no ícone **`</>`** (Web) para registrar um app.
6. Copie as chaves que aparecerem (`apiKey`, `authDomain`, etc.) — você vai usar no passo 2.

## 2. Configurar o projeto localmente

```bash
npm install
cp .env.example .env
```

Abra o `.env` e cole as chaves do Firebase que você copiou.

Rodar localmente:
```bash
npm run dev
```

## 3. Regras de segurança do Firestore (importante!)

No console do Firebase, vá em **Firestore Database > Regras** e cole isto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /artifacts/{appId}/users/{userId}/character/{sheetId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

Isso garante que cada usuário só acessa os próprios documentos, mesmo que alguém tente burlar pelo navegador.

## 4. Deploy (colocar no ar)

O jeito mais simples é **Vercel** ou **Netlify** (ambos grátis e com HTTPS automático):

- Suba o código pro GitHub (`git init`, `git add .`, `git commit`, crie um repositório e dê `git push`).
- Em https://vercel.com (ou https://netlify.com), clique em **"Import Project"** e selecione o repositório.
- Nas configurações do projeto, adicione as mesmas variáveis do seu `.env` (na seção "Environment Variables").
- Deploy automático a cada push.

**Se preferir GitHub Pages:**
```bash
npm install
npm run build
npm run deploy
```
(isso publica a pasta `dist` na branch `gh-pages` do repositório, usando o pacote `gh-pages` já incluso).

## 5. Passo final OBRIGATÓRIO: autorizar o domínio

Depois de publicar, pegue a URL final (ex: `https://minhaficha.vercel.app` ou `https://seuusuario.github.io`) e:

1. Volte no Firebase Console > **Authentication > Settings > Authorized domains**.
2. Clique em **Add domain** e cole a URL do site publicado.

Sem esse passo, o botão "Entrar com Google" não vai funcionar no site publicado (só funciona em `localhost`).

## Como funciona por dentro

- Cada usuário logado tem um `uid` único do Google.
- As fichas ficam salvas em `artifacts/t20-ficha-v6/users/{uid}/character/{idDaFicha}`.
- Um usuário pode ter várias fichas (botão "Heróis" no topo da página).
- Tudo é salvo automaticamente ~1 segundo depois de qualquer alteração.
