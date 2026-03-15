/**
 * Gera PDF com a lista de músicas da pasta songs/ para impressão (Karaoke-Lista-Impressa.pdf).
 * Usa a mesma pasta do app para manter sincronia. Margens 2,5 cm, fonte com acentos.
 * Uso: node generate-list-pdf.js  ou  npm run pdf
 * Também é executado automaticamente ao abrir o app.
 */

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Mesma pasta que o app (songs/) para manter sincronia
const KARAOKE_DIR = path.join(__dirname, 'songs');
const OUTPUT_PATH = path.join(__dirname, 'Karaoke-Lista-Impressa.pdf');

// Margem estilo Word: 2,5 cm ≈ 72 pt (1 inch)
const MARGIN_PT = 72;
const FONT_ARIAL = '/System/Library/Fonts/Supplemental/Arial Unicode.ttf';
const FONT_ARIAL_BOLD = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';

function loadSongs() {
  try {
    if (!fs.existsSync(KARAOKE_DIR)) {
      console.error('Pasta não encontrada:', KARAOKE_DIR);
      return [];
    }
    const files = fs.readdirSync(KARAOKE_DIR, { encoding: 'utf8' });
    const songs = [];
    const videoExt = /\.(mp4|mkv|webm|mov)$/i;
    const nameRe = /^(\d{1,3})\s*-\s*(.+)\.(mp4|mkv|webm|mov)$/i;
    for (const file of files) {
      if (!videoExt.test(file)) continue;
      const m = file.match(nameRe);
      if (m) {
        const num = m[1].padStart(2, '0');
        const titulo = m[2].trim();
        songs.push({ num, titulo });
      }
    }
    songs.sort((a, b) => String(a.num).padStart(3, '0').localeCompare(String(b.num).padStart(3, '0')));
    return songs;
  } catch (e) {
    console.error('Erro ao ler pasta Karaoke:', e.message);
    return [];
  }
}

function generatePdf() {
  const songs = loadSongs();
  if (songs.length === 0) {
    console.error('Nenhuma música encontrada. Verifique a pasta:', KARAOKE_DIR);
    if (require.main === module) process.exit(1);
    return;
  }

  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGIN_PT, bottom: MARGIN_PT, left: MARGIN_PT, right: MARGIN_PT },
  });
  const stream = fs.createWriteStream(OUTPUT_PATH);
  doc.pipe(stream);

  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const centerX = doc.page.width / 2;

  // Fonte com suporte a português (ã, ê, ç, á, etc.)
  if (fs.existsSync(FONT_ARIAL)) {
    doc.registerFont('Arial', FONT_ARIAL);
    doc.registerFont('ArialBold', FONT_ARIAL_BOLD);
    doc.font('Arial');
  } else {
    doc.font('Helvetica');
  }

  doc.y = MARGIN_PT;

  // Título (negrito)
  if (fs.existsSync(FONT_ARIAL_BOLD)) doc.font('ArialBold');
  doc.fontSize(22);
  doc.text('Sistema de Karaokê', 0, doc.y, { align: 'center', width: doc.page.width });
  doc.moveDown(1.2);
  if (fs.existsSync(FONT_ARIAL)) doc.font('Arial');
  else doc.font('Helvetica');
  doc.fontSize(11);

  // Lista de músicas (uma por linha), alinhadas igual em todas as páginas (como pág. 2 e 3)
  doc.y += 8;
  doc.x = MARGIN_PT; // mesma margem esquerda em toda a lista
  const bottomMargin = doc.page.height - MARGIN_PT;
  const lineHeight = 14;
  songs.forEach((s) => {
    if (doc.y > bottomMargin - 20) {
      doc.addPage({
        size: 'A4',
        margins: { top: MARGIN_PT, bottom: MARGIN_PT, left: MARGIN_PT, right: MARGIN_PT },
      });
      if (fs.existsSync(FONT_ARIAL)) doc.font('Arial');
      else doc.font('Helvetica');
      doc.fontSize(11);
      doc.x = MARGIN_PT;
      doc.y = MARGIN_PT;
    }
    doc.text(`${s.num} - ${s.titulo}`, MARGIN_PT, doc.y, { width: pageWidth, lineBreak: false });
    doc.y += lineHeight;
  });

  doc.end();

  stream.on('finish', () => {
    console.log('PDF gerado:', OUTPUT_PATH);
    console.log('Total de músicas:', songs.length);
  });
}

if (require.main === module) {
  generatePdf();
}

module.exports = { generatePdf };
