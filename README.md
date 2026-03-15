# Karaokê Sisterhood Night — App

App em tela cheia para usar no evento: lista **só as músicas que existem na pasta** Karaoke, com buscador. Ao clicar em uma música, o vídeo abre no player padrão do macOS.

## O que você precisa

- **Node.js** instalado no Mac ([nodejs.org](https://nodejs.org))
- **Vídeos** na pasta `songs/` (dentro do próprio app).  
  Nomes no formato: `01 - Artista - Música.mp4`, `25 - Nome da Música.mp4` (número + " - " + título). Coloque os arquivos em `karaoke-app/songs/`.

## Instalação (uma vez)

No Terminal:

```bash
cd /Users/davipeyroton/Documents/Hillsong/HSPGit/karaoke-app
npm install
```

## Abrir com duplo clique (recomendado no macOS 26+)

No macOS 26 o app empacotado (.app) costuma dar crash. Use o **arquivo de atalho**:

1. Abra a pasta **`karaoke-app`** no Finder.
2. Dê **dois cliques** em **Karaokê Sisterhood.command**.

O Terminal vai abrir e o app sobe em seguida. Você pode arrastar **Karaokê Sisterhood.command** para o Dock ou para Aplicativos para ter um “ícone” sempre à mão — ao clicar, abre o Terminal e inicia o app.

## Rodar pelo Terminal

```bash
cd /Users/davipeyroton/Documents/Hillsong/HSPGit/karaoke-app
npm start
```

## (Opcional) Gerar o .app

Se quiser tentar o app empacotado (pode dar crash no macOS 26):

```bash
npm run build
```

O .app fica em **`dist/mac-arm64/Karaokê Sisterhood.app`**.

O app abre em **tela cheia**. Use o campo de busca para filtrar. Ao **clicar em uma música**, o vídeo abre em **tela cheia no monitor HDMI** (segundo display). Se não houver TV/projetor conectado, o vídeo abre no mesmo monitor da lista. **Esc** na janela do vídeo fecha a reprodução.

## Atalhos

- **Esc** no campo de busca: limpa a busca
- O app já abre em fullscreen; você pode sair com **Cmd+Ctrl+F** se o Electron permitir, ou fechar a janela

## De onde vem a lista

O app **não usa planilha**. Ele lê os arquivos de vídeo (`.mp4`, `.mkv`, `.webm`, `.mov`) da pasta **`songs/`** (dentro do app) e extrai número e título do nome do arquivo (`NN - Título.ext`). Só o que está na pasta aparece na interface.
