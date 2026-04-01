import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';
import mammoth from 'mammoth';
import PptxGenJS from 'pptxgenjs';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const SOURCE_LABELS = {
  pdf: 'PDF',
  excel: 'Excel',
  word: 'Word',
  powerpoint: 'PowerPoint',
  image: 'Görsel',
  text: 'Metin',
};

const TARGET_LABELS = {
  excel: 'xlsx',
  word: 'docx',
  powerpoint: 'pptx',
  image: 'png',
  text: 'txt',
  pdf: 'pdf',
};

const MIME_TYPES = {
  excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  word: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  powerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  image: 'image/png',
  text: 'text/plain',
  pdf: 'application/pdf',
};

const escapeXml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const stripXmlText = (xml) => {
  const matches = [...xml.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/g)];
  return matches.map((match) => match[1]).join(' ').replace(/\s+/g, ' ').trim();
};

const readAssetAsArrayBuffer = async (asset) => {
  if (asset.file?.arrayBuffer) {
    return asset.file.arrayBuffer();
  }

  const response = await fetch(asset.uri);
  return response.arrayBuffer();
};

const readAssetAsText = async (asset) => {
  if (asset.file?.text) {
    return asset.file.text();
  }

  const response = await fetch(asset.uri);
  return response.text();
};

const readAssetAsDataUrl = async (asset) => {
  if (asset.file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(asset.file);
    });
  }

  const response = await fetch(asset.uri);
  const blob = await response.blob();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const loadImageSize = (dataUrl) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.width, height: image.height });
    image.onerror = reject;
    image.src = dataUrl;
  });

const getBaseName = (fileName) => fileName.replace(/\.[^.]+$/, '');
const getExtension = (fileName) => fileName.split('.').pop()?.toLowerCase() || '';

const toParagraphs = (text) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line, index, array) => line.length > 0 || (index > 0 && array[index - 1].length > 0));

  if (!lines.length) {
    return [new Paragraph('İçerik bulunamadı.')];
  }

  return lines.map((line) => new Paragraph({ children: [new TextRun(line || ' ')] }));
};

const splitTextForSlides = (text, chunkSize = 900) => {
  if (!text) {
    return ['İçerik bulunamadı.'];
  }

  const normalized = text.replace(/\s+/g, ' ').trim();
  const chunks = [];

  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize));
  }

  return chunks.length ? chunks : ['İçerik bulunamadı.'];
};

const createSummaryText = (parsed) => {
  const lines = [
    `Kaynak dosya: ${parsed.fileName}`,
    `Kaynak türü: ${SOURCE_LABELS[parsed.sourceType] || parsed.sourceType}`,
    `Karakter sayısı: ${parsed.textContent.length}`,
  ];

  if (parsed.metadata.width && parsed.metadata.height) {
    lines.push(`Boyut: ${parsed.metadata.width}x${parsed.metadata.height}`);
  }

  if (parsed.metadata.sheetNames?.length) {
    lines.push(`Sayfalar: ${parsed.metadata.sheetNames.join(', ')}`);
  }

  lines.push('', parsed.textContent || 'İçerik bulunamadı.');
  return lines.join('\n');
};

const buildCanvasPreview = async (parsed) => {
  if (parsed.sourceType === 'image' && parsed.imageDataUrl) {
    return parsed.imageDataUrl;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1600;
  canvas.height = 900;
  const context = canvas.getContext('2d');

  context.fillStyle = '#111827';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = '#10A37F';
  context.fillRect(60, 60, canvas.width - 120, 120);

  context.fillStyle = '#FFFFFF';
  context.font = 'bold 52px Arial';
  context.fillText('Sainat AI Dönüştürme Önizlemesi', 100, 138);

  context.fillStyle = '#E5E7EB';
  context.font = '32px Arial';
  context.fillText(`Dosya: ${parsed.fileName}`, 100, 250);
  context.fillText(`Tür: ${SOURCE_LABELS[parsed.sourceType] || parsed.sourceType}`, 100, 305);

  const excerpt = (parsed.textContent || 'İçerik bulunamadı.')
    .replace(/\s+/g, ' ')
    .slice(0, 1200);

  context.fillStyle = '#D1D5DB';
  context.font = '28px Arial';

  const words = excerpt.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach((word) => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const width = context.measureText(testLine).width;
    if (width > canvas.width - 200) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  lines.slice(0, 14).forEach((line, index) => {
    context.fillText(line, 100, 390 + index * 42);
  });

  return canvas.toDataURL('image/png');
};

const parseExcel = async (asset) => {
  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });
  const sheetNames = workbook.SheetNames || [];
  const firstSheet = sheetNames[0];
  const worksheet = workbook.Sheets[firstSheet];
  const rows = worksheet ? XLSX.utils.sheet_to_json(worksheet, { header: 1 }) : [];
  const textContent = rows.map((row) => row.join('\t')).join('\n');

  return {
    sourceType: 'excel',
    fileName: asset.name,
    textContent,
    rows,
    metadata: { sheetNames },
  };
};

const parsePdf = async (asset) => {
  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
    disableWorker: true,
    useSystemFonts: true,
  });
  const document = await loadingTask.promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? item.str : ''))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (pageText) {
      pageTexts.push(pageText);
    }
  }

  return {
    sourceType: 'pdf',
    fileName: asset.name,
    textContent: pageTexts.join('\n\n').trim(),
    rows: [],
    metadata: { pageCount: document.numPages },
  };
};

const parseWord = async (asset) => {
  const extension = getExtension(asset.name);

  if (extension !== 'docx') {
    throw new Error('Şu anda Word dönüşümünde yalnızca .docx dosyaları destekleniyor.');
  }

  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const result = await mammoth.extractRawText({ arrayBuffer });

  return {
    sourceType: 'word',
    fileName: asset.name,
    textContent: result.value.trim(),
    rows: [],
    metadata: {},
  };
};

const parsePowerPoint = async (asset) => {
  const extension = getExtension(asset.name);

  if (extension !== 'pptx') {
    throw new Error('Şu anda PowerPoint dönüşümünde yalnızca .pptx dosyaları destekleniyor.');
  }

  const arrayBuffer = await readAssetAsArrayBuffer(asset);
  const zip = await JSZip.loadAsync(arrayBuffer);
  const slideFiles = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/.test(name))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  const slideTexts = await Promise.all(
    slideFiles.map(async (slidePath) => {
      const xml = await zip.file(slidePath).async('text');
      return stripXmlText(xml);
    })
  );

  return {
    sourceType: 'powerpoint',
    fileName: asset.name,
    textContent: slideTexts.filter(Boolean).join('\n\n'),
    rows: [],
    metadata: { slideCount: slideFiles.length },
  };
};

const parseTextFile = async (asset) => ({
  sourceType: 'text',
  fileName: asset.name,
  textContent: (await readAssetAsText(asset)).trim(),
  rows: [],
  metadata: {},
});

const parseImageFile = async (asset) => {
  const imageDataUrl = await readAssetAsDataUrl(asset);
  const imageSize = await loadImageSize(imageDataUrl);

  return {
    sourceType: 'image',
    fileName: asset.name,
    textContent: `Görsel dosyası: ${asset.name}\nBoyut: ${imageSize.width}x${imageSize.height}`,
    rows: [],
    imageDataUrl,
    metadata: imageSize,
  };
};

export const parseUploadedFile = async (asset, fileType) => {
  switch (fileType) {
    case 'pdf':
      return parsePdf(asset);
    case 'excel':
      return parseExcel(asset);
    case 'word':
      return parseWord(asset);
    case 'powerpoint':
      return parsePowerPoint(asset);
    case 'image':
      return parseImageFile(asset);
    case 'text':
      return parseTextFile(asset);
    default:
      throw new Error('Desteklenmeyen kaynak dosya türü.');
  }
};

const exportAsText = async (parsed) => {
  const content = createSummaryText(parsed);
  return new Blob([content], { type: MIME_TYPES.text });
};

const exportAsExcel = async (parsed) => {
  const summaryRows = [
    ['Kaynak dosya', parsed.fileName],
    ['Kaynak türü', SOURCE_LABELS[parsed.sourceType] || parsed.sourceType],
    ['Karakter sayısı', parsed.textContent.length],
    [],
    ['İçerik'],
  ];

  const contentRows = parsed.textContent
    ? parsed.textContent.split(/\r?\n/).map((line) => [line])
    : [['İçerik bulunamadı.']];

  const worksheet = XLSX.utils.aoa_to_sheet([...summaryRows, ...contentRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Donusum');
  const arrayBuffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Blob([arrayBuffer], { type: MIME_TYPES.excel });
};

const exportAsWord = async (parsed) => {
  const document = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'Sainat AI Dönüştürme Çıktısı',
            heading: HeadingLevel.TITLE,
          }),
          new Paragraph(`Kaynak dosya: ${parsed.fileName}`),
          new Paragraph(`Kaynak türü: ${SOURCE_LABELS[parsed.sourceType] || parsed.sourceType}`),
          new Paragraph(''),
          ...toParagraphs(parsed.textContent || 'İçerik bulunamadı.'),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(document);
  return blob;
};

const exportAsPowerPoint = async (parsed) => {
  const pptx = new PptxGenJS();
  pptx.layout = 'LAYOUT_WIDE';
  const chunks = splitTextForSlides(createSummaryText(parsed));

  chunks.forEach((chunk, index) => {
    const slide = pptx.addSlide();
    slide.background = { color: '0F172A' };
    slide.addText(index === 0 ? 'Sainat AI Dönüştürme Çıktısı' : `Devam ${index + 1}`, {
      x: 0.4,
      y: 0.3,
      w: 12,
      h: 0.6,
      fontSize: 22,
      bold: true,
      color: 'FFFFFF',
    });
    slide.addText(chunk, {
      x: 0.5,
      y: 1.1,
      w: 12.2,
      h: 5.5,
      fontSize: 16,
      color: 'E5E7EB',
      breakLine: false,
      margin: 0.1,
      valign: 'top',
    });
  });

  const arrayBuffer = await pptx.write({ outputType: 'arraybuffer' });
  return new Blob([arrayBuffer], { type: MIME_TYPES.powerpoint });
};

const exportAsPdf = async (parsed) => {
  const pdf = new jsPDF({ unit: 'pt', format: 'a4' });

  if (parsed.sourceType === 'image' && parsed.imageDataUrl) {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const { width, height } = parsed.metadata;
    const ratio = Math.min((pageWidth - 80) / width, (pageHeight - 120) / height);
    const renderWidth = width * ratio;
    const renderHeight = height * ratio;

    pdf.setFontSize(16);
    pdf.text(parsed.fileName, 40, 40);
    pdf.addImage(parsed.imageDataUrl, 'PNG', 40, 70, renderWidth, renderHeight);
  } else {
    pdf.setFontSize(20);
    pdf.text('Sainat AI Dönüştürme Çıktısı', 40, 40);
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(createSummaryText(parsed), 515);
    pdf.text(lines, 40, 70);
  }

  return pdf.output('blob');
};

const exportAsImage = async (parsed) => {
  const dataUrl = await buildCanvasPreview(parsed);
  const response = await fetch(dataUrl);
  return response.blob();
};

export const convertFile = async ({ asset, sourceType, targetType }) => {
  const parsed = await parseUploadedFile(asset, sourceType);

  switch (targetType) {
    case 'text':
      return { blob: await exportAsText(parsed), extension: TARGET_LABELS.text };
    case 'excel':
      return { blob: await exportAsExcel(parsed), extension: TARGET_LABELS.excel };
    case 'word':
      return { blob: await exportAsWord(parsed), extension: TARGET_LABELS.word };
    case 'powerpoint':
      return { blob: await exportAsPowerPoint(parsed), extension: TARGET_LABELS.powerpoint };
    case 'pdf':
      return { blob: await exportAsPdf(parsed), extension: TARGET_LABELS.pdf };
    case 'image':
      return { blob: await exportAsImage(parsed), extension: TARGET_LABELS.image };
    default:
      throw new Error('Desteklenmeyen hedef format.');
  }
};

export const downloadConvertedFile = ({ blob, originalName, targetType }) => {
  const baseName = getBaseName(originalName);
  const fileName = `${baseName}-converted.${TARGET_LABELS[targetType]}`;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
  return fileName;
};
