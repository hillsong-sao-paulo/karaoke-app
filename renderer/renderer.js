const listEl = document.getElementById('list');
const loadingEl = document.getElementById('loading');
const noResultsEl = document.getElementById('no-results');
const searchEl = document.getElementById('search');

const STORAGE_COLS = 'karaoke-view-cols';
const STORAGE_LETTER = 'karaoke-view-letter';
const STORAGE_SORT = 'karaoke-view-sort';
const DEFAULT_COLS = 2;
const LETTER_RANGES = ['all', 'A-D', 'E-H', 'I-L', 'M-P', 'Q-T', 'U-Z'];
const SORT_OPTIONS = ['number', 'a-z', 'z-a'];

let songs = [];
let currentCols = DEFAULT_COLS;
let currentLetterRange = 'all';
let currentSort = 'number';

function applyGridCols(cols) {
  currentCols = Math.min(3, Math.max(1, parseInt(cols, 10) || DEFAULT_COLS));
  listEl.style.gridTemplateColumns = currentCols === 1 ? '1fr' : `repeat(${currentCols}, minmax(0, 1fr))`;
}

function setViewCols(cols) {
  cols = Math.min(3, Math.max(1, parseInt(cols, 10) || DEFAULT_COLS));
  applyGridCols(cols);
  document.querySelectorAll('.view-toggle button').forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.cols, 10) === cols);
    btn.setAttribute('aria-pressed', btn.classList.contains('active'));
  });
  try { localStorage.setItem(STORAGE_COLS, String(cols)); } catch (_) {}
  if (songs.length > 0) render(getSortedFilteredSongs());
}

function initViewCols() {
  let cols = DEFAULT_COLS;
  try { cols = parseInt(localStorage.getItem(STORAGE_COLS), 10) || DEFAULT_COLS; } catch (_) {}
  currentCols = cols;
  applyGridCols(cols);
  document.querySelectorAll('.view-toggle button').forEach((btn) => {
    btn.classList.toggle('active', parseInt(btn.dataset.cols, 10) === cols);
    btn.setAttribute('aria-pressed', parseInt(btn.dataset.cols, 10) === cols);
    btn.addEventListener('click', () => setViewCols(parseInt(btn.dataset.cols, 10)));
  });
  try { localStorage.setItem(STORAGE_COLS, String(cols)); } catch (_) {}
}

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');
}

/** Primeira letra do título (artista/música), normalizada (sem acento, maiúscula). */
function getInitialLetter(titulo) {
  const t = (titulo || '').trim();
  if (!t) return '';
  const first = t
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .charAt(0)
    .toUpperCase();
  return first >= 'A' && first <= 'Z' ? first : '';
}

/** Filtra por faixa de letra inicial: A-D, E-H, …, U-Z (U-Z inclui o que sobrar). */
function filterByLetterRange(songList, range) {
  if (!range || range === 'all') return songList;
  const [start, end] = range.split('-');
  const startCode = start.charCodeAt(0);
  const endCode = end.charCodeAt(0);
  return songList.filter((s) => {
    const letter = getInitialLetter(s.titulo);
    if (!letter) return range === 'U-Z'; // números/símbolos vão no último grupo
    const code = letter.charCodeAt(0);
    return code >= startCode && code <= endCode;
  });
}

function filterBySearch(songList, query) {
  const q = normalize(query).trim();
  if (!q) return songList;
  return songList.filter(
    (s) => normalize(s.titulo).includes(q) || String(s.num).includes(q)
  );
}

/** Lista já filtrada por letra + busca. */
function getFilteredSongs() {
  const byLetter = filterByLetterRange(songs, currentLetterRange);
  return filterBySearch(byLetter, searchEl.value);
}

/** Ordena a lista (só visualização; não altera os arquivos). */
function sortSongs(songList) {
  if (!songList.length) return songList;
  const copy = songList.slice();
  if (currentSort === 'number') {
    copy.sort((a, b) => String(a.num).padStart(3, '0').localeCompare(String(b.num).padStart(3, '0')));
    return copy;
  }
  if (currentSort === 'a-z') {
    copy.sort((a, b) => (a.titulo || '').localeCompare(b.titulo || '', 'pt-BR'));
    return copy;
  }
  if (currentSort === 'z-a') {
    copy.sort((a, b) => (b.titulo || '').localeCompare(a.titulo || '', 'pt-BR'));
    return copy;
  }
  return copy;
}

/** Lista filtrada e ordenada para exibição. */
function getSortedFilteredSongs() {
  return sortSongs(getFilteredSongs());
}

function setLetterRange(range) {
  if (!LETTER_RANGES.includes(range)) range = 'all';
  currentLetterRange = range;
  document.querySelectorAll('.letter-toggle button').forEach((btn) => {
    const active = btn.dataset.range === range;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
  try { localStorage.setItem(STORAGE_LETTER, range); } catch (_) {}
  if (songs.length > 0) render(getSortedFilteredSongs());
}

function setSort(sort) {
  if (!SORT_OPTIONS.includes(sort)) sort = 'number';
  currentSort = sort;
  document.querySelectorAll('.sort-toggle button').forEach((btn) => {
    const active = btn.dataset.sort === sort;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
  });
  try { localStorage.setItem(STORAGE_SORT, sort); } catch (_) {}
  if (songs.length > 0) render(getSortedFilteredSongs());
}

function initSortToggle() {
  let sort = 'number';
  try { sort = localStorage.getItem(STORAGE_SORT) || 'number'; } catch (_) {}
  if (!SORT_OPTIONS.includes(sort)) sort = 'number';
  currentSort = sort;
  document.querySelectorAll('.sort-toggle button').forEach((btn) => {
    const active = btn.dataset.sort === sort;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
    btn.addEventListener('click', () => setSort(btn.dataset.sort));
  });
  try { localStorage.setItem(STORAGE_SORT, sort); } catch (_) {}
}

function initLetterToggle() {
  let range = 'all';
  try { range = localStorage.getItem(STORAGE_LETTER) || 'all'; } catch (_) {}
  if (!LETTER_RANGES.includes(range)) range = 'all';
  currentLetterRange = range;
  document.querySelectorAll('.letter-toggle button').forEach((btn) => {
    const active = btn.dataset.range === range;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-pressed', active);
    btn.addEventListener('click', () => setLetterRange(btn.dataset.range));
  });
  try { localStorage.setItem(STORAGE_LETTER, range); } catch (_) {}
}


function render(filtered) {
  loadingEl.style.display = 'none';
  listEl.style.display = 'grid';
  noResultsEl.style.display = 'none';
  applyGridCols(currentCols);

  listEl.innerHTML = '';
  if (filtered.length === 0) {
    listEl.style.display = 'none';
    noResultsEl.style.display = 'block';
    return;
  }
  filtered.forEach((s) => {
    const li = document.createElement('li');
    li.className = 'song-item';
    li.innerHTML = `
      <span class="song-num">${escapeHtml(s.num)}</span>
      <span class="song-title">${escapeHtml(s.titulo)}</span>
    `;
    li.addEventListener('click', () => {
      window.karaoke.openSong(s.videoPath).then((r) => {
        if (r && !r.ok) console.error(r.error);
      });
    });
    listEl.appendChild(li);
  });
}

function escapeHtml(s) {
  const div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

searchEl.addEventListener('input', () => {
  render(getSortedFilteredSongs());
});

searchEl.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    searchEl.value = '';
    searchEl.focus();
    render(getSortedFilteredSongs());
  }
});

initViewCols();
initLetterToggle();
initSortToggle();

window.karaoke.getSongs().then((data) => {
  songs = data || [];
  render(getSortedFilteredSongs());
  searchEl.focus();
}).catch((err) => {
  loadingEl.textContent = 'Erro ao carregar a lista. Verifique se a pasta Karaoke existe e tem vídeos.';
  console.error(err);
});
