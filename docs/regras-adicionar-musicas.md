# Como adicionar uma nova música

Pasta dos vídeos: **`songs/`** (dentro deste repositório).  
Formato dos arquivos: `NN - Artista - Música.mp4` (ex.: `01 - Abba - Dancing Queen.mp4`).

Se você usa **Cursor** com este projeto, pode colar o **link do YouTube + nome da música (e artista)**; com as regras de contexto, o assistente gera o comando com a numeração correta. Abaixo, o passo a passo para fazer manualmente ou para conferir a lógica.

---

## 1. Descobrir o número a usar

Liste os números já usados na pasta `songs/`:

```bash
cd /caminho/para/karaoke-app
ls -1 songs/*.mp4 2>/dev/null | sed 's/.*\/\([0-9]*\) - .*/\1/' | sort -n
```

- Se existir **lacuna** (ex.: tem 01, 02, 04, 05 → falta 03), use o **primeiro número em falta**.
- Se **não houver lacuna** (01 até N seguidos), use **N+1**.
- **Não repita** um número já existente.

---

## 2. Comando de download (yt-dlp)

Com o número definido (ex.: 121) e o link do vídeo + artista e nome da música:

```bash
cd /caminho/para/karaoke-app/songs
yt-dlp --cookies-from-browser safari --no-playlist --merge-output-format mp4 -o "121 - Artista - Nome da Música.%(ext)s" "URL_DO_YOUTUBE"
```

Substitua:
- `121` pelo número obtido no passo 1 (use dois dígitos quando for 01–09).
- `Artista` e `Nome da Música` pelo artista e título.
- `URL_DO_YOUTUBE` pelo link do vídeo.

Se o YouTube exigir login, rode o comando no Terminal do Mac (com acesso aos cookies do Safari). O arquivo será salvo em `songs/` e aparecerá no app na próxima vez que você abrir.
