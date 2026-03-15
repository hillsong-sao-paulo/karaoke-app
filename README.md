# Sistema de Karaokê

App simples para listar e reproduzir vídeos de karaokê em tela cheia. Lê as músicas da pasta **`songs/`**, tem busca, filtro por letra inicial, ordenação (número, A–Z, Z–A) e opção de 1, 2 ou 3 colunas. Ao clicar em uma música, o vídeo abre em tela cheia (no segundo monitor, se houver HDMI/projetor).

## O que você precisa

- **Node.js** ([nodejs.org](https://nodejs.org))
- **Vídeos** na pasta `songs/` (dentro do projeto), no formato: `NN - Artista - Nome da Música.mp4`  
  Os vídeos não vêm no repositório. Veja **`songs/LEIA-ME.txt`** para obter a pasta de músicas (e-mail/WhatsApp) ou para adicionar músicas pelo Cursor/yt-dlp.

## Instalação

```bash
git clone https://github.com/hillsong-sao-paulo/karaoke-app.git
cd karaoke-app
npm install
```

## Como rodar

**Pelo Terminal:**
```bash
cd karaoke-app
npm start
```

**Duplo clique (macOS):**  
Abra a pasta do projeto e dê dois cliques no arquivo **Karaokê Sisterhood.command** (ou no script `.command` disponível). O app sobe em tela cheia.

## Adicionar novas músicas

- Instruções completas (numeração, comando yt-dlp com Safari ou Chrome): **`docs/regras-adicionar-musicas.md`**
- Resumo: coloque os `.mp4` em `songs/` com o nome `NN - Artista - Música.mp4`; o app e o PDF da lista usam só o que está nessa pasta.

## Lista para impressão (PDF)

O app gera automaticamente o arquivo **`Karaoke-Lista-Impressa.pdf`** ao abrir (lista de todas as músicas de `songs/`). Para gerar só o PDF sem abrir o app:

```bash
npm run pdf
```

## Build (opcional)

Para gerar o executável (.app no macOS):

```bash
npm run build
```

O app fica em `dist/mac-arm64/`. Em algumas versões do macOS o .app pode falhar; nesse caso use `npm start` ou o arquivo `.command`.

## Atalhos

- **Esc** no campo de busca: limpa a busca
- **Esc** na janela do vídeo: fecha a reprodução
- O app abre em tela cheia; para sair: **Cmd+Ctrl+F** ou fechar a janela

## De onde vem a lista

O app lê os arquivos de vídeo (`.mp4`, `.mkv`, `.webm`, `.mov`) da pasta **`songs/`** e extrai número e título do nome do arquivo (`NN - Artista - Música.ext`). Não usa planilha nem banco de dados.
