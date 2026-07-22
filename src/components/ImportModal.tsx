import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  FileText,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Info,
  ArrowRight,
  Database,
  RefreshCw,
  Sliders,
  Check,
  AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import * as pdfjsLib from 'pdfjs-dist';
import { FurnitureName, FurnitureCategory, FurnitureLine } from '../types';
import { checkNameSimilarity, normalizeName } from '../utils/similarity';

// Configure pdfjs worker src for client PDF text extraction
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

// Helper validator to detect and filter out PDF metadata, binary tokens and structural code
export const isPdfMetadataOrBinary = (line: string): boolean => {
  if (!line) return true;
  const trimmed = line.trim();

  // Minimum length check
  if (trimmed.length < 2) return true;

  // PDF Structural headers and object tags
  if (
    /^%PDF-/i.test(trimmed) ||
    /^%[A-Za-z0-9]+/i.test(trimmed) ||
    /^<</.test(trimmed) ||
    />>$/.test(trimmed) ||
    /^\d+\s+\d+\s+obj/i.test(trimmed) ||
    /^endobj/i.test(trimmed) ||
    /^stream/i.test(trimmed) ||
    /^endstream/i.test(trimmed) ||
    /^xref/i.test(trimmed) ||
    /^startxref/i.test(trimmed) ||
    /^\d{10}\s+\d{5}\s+[fn]/i.test(trimmed)
  ) {
    return true;
  }

  const lower = trimmed.toLowerCase();

  // Known PDF metadata tokens & commands
  const binaryPdfTokens = [
    '/filter',
    '/flatedecode',
    '/dctdecode',
    '/lzwdecode',
    '/type',
    '/parent',
    '/resources',
    '/mediabox',
    '/contents',
    '/catalog',
    '/pages',
    '/font',
    '/encoding',
    '/length',
    '/subtype',
    '/width',
    '/height',
    '/xobject',
    '/root',
    '/info',
    '/creationdate',
    '/moddate',
    '/producer',
    'flatedecode',
    'endstream',
    'endobj',
    'fontdescriptor',
    'cid systeminfo'
  ];

  for (const token of binaryPdfTokens) {
    if (lower.includes(token)) return true;
  }

  // Check for non-printable control characters (\x00-\x08, \x0B-\x0C, \x0E-\x1F, \x7F-\x9F)
  if (/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(trimmed)) {
    return true;
  }

  // Must contain at least one valid word/letter (A-Z, a-z, Á-Ú, á-ú, Ñ, ñ)
  const hasLegibleLetters = /[a-zA-ZáéíóúÁÉÍÓÚñÑ]/.test(trimmed);
  if (!hasLegibleLetters) return true;

  // Check ratio of legible characters vs weird symbols
  const validChars = trimmed.match(/[a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s\-_.,()]/g);
  if (!validChars || validChars.length / trimmed.length < 0.6) {
    return true;
  }

  return false;
};

// Helper to extract clean text lines page-by-page from PDF files using pdfjs-dist
const extractTextFromPDF = async (pdfFile: File): Promise<string[]> => {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    const extractedLines: string[] = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      let pageLines: string[] = [];
      let currentLine = '';
      let lastY: number | null = null;

      for (const item of textContent.items as any[]) {
        if (!item.str) continue;
        const transform = item.transform;
        const currentY = transform ? transform[5] : null;

        if (lastY !== null && currentY !== null && Math.abs(currentY - lastY) > 5) {
          if (currentLine.trim()) {
            pageLines.push(currentLine.trim());
          }
          currentLine = item.str;
        } else {
          currentLine += (currentLine ? ' ' : '') + item.str;
        }
        lastY = currentY;
      }

      if (currentLine.trim()) {
        pageLines.push(currentLine.trim());
      }

      extractedLines.push(...pageLines);
    }

    // Filter out pdf metadata or binary artifacts
    return extractedLines.filter((line) => !isPdfMetadataOrBinary(line));
  } catch (error) {
    console.warn('Extracción con pdfjs-dist falló o archivo no estándar, realizando filtrado de texto limpio:', error);
    const text = await pdfFile.text();
    const rawLines = text.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    return rawLines.filter((line) => !isPdfMetadataOrBinary(line));
  }
};

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingNames: FurnitureName[];
  currentUser: string;
  onImportSuccess: (importedData: any) => Promise<void> | void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  existingNames,
  currentUser,
  onImportSuccess
}) => {
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing' | 'success'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Raw Parsed Table
  const [rawHeaders, setRawHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<any[]>([]);

  // Column Mappings
  const [mapping, setMapping] = useState<{
    name: string;
    category: string;
    origin: string;
    description: string;
    line: string;
  }>({
    name: '',
    category: '',
    origin: '',
    description: '',
    line: ''
  });

  // Validated Preview Data
  const [previewItems, setPreviewItems] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    newCount: 0,
    duplicateCount: 0,
    similarCount: 0,
    errorCount: 0
  });

  // Final Summary Result
  const [finalResult, setFinalResult] = useState<{
    newCount: number;
    updatedCount: number;
    skippedCount: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setMapping({ name: '', category: '', origin: '', description: '', line: '' });
    setPreviewItems([]);
    setFinalResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  // Parse File Content
  const processFile = async (uploadedFile: File) => {
    setFile(uploadedFile);
    const fileName = uploadedFile.name.toLowerCase();

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) {
      const buffer = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (!jsonData || jsonData.length === 0) {
        alert('El archivo no contiene filas legibles.');
        return;
      }

      // First row as headers if available
      const headers = jsonData[0].map((h: any, idx: number) =>
        h ? String(h).trim() : `Columna ${idx + 1}`
      );
      const dataRows = jsonData.slice(1).filter((row) => row && row.length > 0);

      setRawHeaders(headers);

      // Map rows to objects
      const rowObjects = dataRows.map((r) => {
        const obj: any = {};
        headers.forEach((h: string, idx: number) => {
          obj[h] = r[idx] !== undefined && r[idx] !== null ? String(r[idx]).trim() : '';
        });
        return obj;
      });

      setRawRows(rowObjects);

      // Auto-detect columns
      const detectedName = headers.find((h) =>
        /nombre|product|producto|item|comercial/i.test(h)
      ) || headers[0] || '';

      const detectedCategory = headers.find((h) =>
        /categor|tipo|familia/i.test(h)
      ) || '';

      const detectedOrigin = headers.find((h) =>
        /origen|colecc|marca|proveedor|empresa/i.test(h)
      ) || '';

      const detectedDesc = headers.find((h) =>
        /descrip|detalle|nota|material/i.test(h)
      ) || '';

      const detectedLine = headers.find((h) =>
        /l[íi]nea|estilo|colecci[óo]n/i.test(h)
      ) || '';

      setMapping({
        name: detectedName,
        category: detectedCategory,
        origin: detectedOrigin,
        description: detectedDesc,
        line: detectedLine
      });

      setStep('mapping');
    } else if (fileName.endsWith('.pdf')) {
      // PDF Parsing using pdfjs-dist and text filter
      const cleanLines = await extractTextFromPDF(uploadedFile);

      if (cleanLines.length === 0) {
        alert('No se encontraron nombres o líneas de texto legibles en el archivo PDF.');
        return;
      }

      const headers = ['Nombre Producto / Comercial', 'Información / Detalle'];
      const rowObjects = cleanLines.map((l) => {
        const parts = l.split(/[,;\t|]/);
        return {
          'Nombre Producto / Comercial': parts[0] ? parts[0].trim() : l,
          'Información / Detalle': parts[1] ? parts[1].trim() : ''
        };
      });

      setRawHeaders(headers);
      setRawRows(rowObjects);
      setMapping({
        name: 'Nombre Producto / Comercial',
        category: '',
        origin: '',
        description: 'Información / Detalle',
        line: ''
      });
      setStep('mapping');
    } else {
      // Text / Word Fallback Parsing
      const text = await uploadedFile.text();
      const lines = text
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter((l) => l.length > 0 && !isPdfMetadataOrBinary(l));

      const headers = ['Nombre Producto', 'Información'];
      const rowObjects = lines.map((l) => {
        const parts = l.split(/[,;\t|]/);
        return {
          'Nombre Producto': parts[0] ? parts[0].trim() : l,
          'Información': parts[1] ? parts[1].trim() : ''
        };
      });

      setRawHeaders(headers);
      setRawRows(rowObjects);
      setMapping({
        name: 'Nombre Producto',
        category: '',
        origin: '',
        description: 'Información',
        line: ''
      });
      setStep('mapping');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  // Run Validation and Build Preview
  const handleGeneratePreview = () => {
    if (!mapping.name) {
      alert('Debes seleccionar al menos la columna correspondiente al Nombre Comercial.');
      return;
    }

    // Filter out rows where the name column contains PDF structural metadata or binary code
    const validRows = rawRows.filter((row) => {
      const nameVal = row[mapping.name] ? String(row[mapping.name]).trim() : '';
      return nameVal && !isPdfMetadataOrBinary(nameVal);
    });

    if (validRows.length === 0) {
      alert('No se encontraron nombres de productos válidos en el archivo.');
      return;
    }

    let newCount = 0;
    let duplicateCount = 0;
    let similarCount = 0;
    let errorCount = 0;

    const items = validRows.map((row, idx) => {
      const nameVal = String(row[mapping.name]).trim();
      const catVal = (row[mapping.category] as FurnitureCategory) || 'Sofás';
      const originVal = row[mapping.origin] || 'Macrumo';
      const descVal = row[mapping.description] || '';
      const lineVal = (row[mapping.line] as FurnitureLine) || 'Lujo Contemporáneo';

      if (!nameVal) {
        errorCount++;
        return {
          id: `raw-${idx}`,
          name: '— INCOMPLETO —',
          category: catVal,
          origin: originVal,
          description: descVal,
          line: lineVal,
          statusVal: 'ERROR',
          risk: 'CRITICAL',
          reason: 'Campo de nombre vacío'
        };
      }

      const simReport = checkNameSimilarity(nameVal, existingNames, catVal);

      let statusVal = 'NUEVO';
      let reason = 'Disponible para incorporación';

      if (simReport.risk === 'CRITICAL' || simReport.matches.some((m) => m.matchType === 'EXACT')) {
        duplicateCount++;
        statusVal = 'DUPLICADO';
        reason = `Duplicado exacto con "${simReport.matches[0]?.targetName.name || nameVal}"`;
      } else if (simReport.risk === 'HIGH' || simReport.risk === 'MEDIUM') {
        similarCount++;
        statusVal = 'SIMILAR';
        reason = `Similitud con "${simReport.matches[0]?.targetName.name || ''}" (${simReport.riskScore}%)`;
      } else {
        newCount++;
      }

      return {
        id: `raw-${idx}`,
        name: nameVal,
        category: catVal,
        origin: originVal,
        description: descVal,
        line: lineVal,
        statusVal,
        risk: simReport.risk,
        reason
      };
    });

    setPreviewItems(items);
    setMetrics({
      total: rawRows.length,
      newCount,
      duplicateCount,
      similarCount,
      errorCount
    });

    setStep('preview');
  };

  // Execute Final Import
  const handleConfirmImport = async () => {
    setStep('importing');

    // Filter valid items (new or similar, excluding exact duplicates/errors unless approved)
    const itemsToImport = previewItems
      .filter((it) => it.statusVal !== 'ERROR' && it.statusVal !== 'DUPLICADO')
      .map((it) => ({
        name: it.name,
        category: it.category,
        line: it.line,
        origin: it.origin,
        description: it.description,
        materials: ['Catálogo Importado'],
        status: 'Activo'
      }));

    const payload = {
      items: itemsToImport,
      fileName: file?.name || 'Importacion_Macrumo.xlsx',
      fileType: file?.type || 'Excel/CSV',
      user: currentUser,
      totalCount: metrics.total,
      newCount: metrics.newCount,
      duplicateCount: metrics.duplicateCount,
      similarCount: metrics.similarCount,
      errorCount: metrics.errorCount,
      skippedNames: previewItems.filter((i) => i.statusVal === 'DUPLICADO').map((i) => i.name),
      similarNames: previewItems.filter((i) => i.statusVal === 'SIMILAR').map((i) => i.name)
    };

    try {
      const res = await fetch('/api/imports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Error al guardar la importación en el servidor.');
      }

      await onImportSuccess(payload);

      setFinalResult({
        newCount: itemsToImport.length,
        updatedCount: metrics.similarCount,
        skippedCount: metrics.duplicateCount + metrics.errorCount
      });

      setStep('success');
    } catch (err: any) {
      alert(err.message || 'Error en la importación final.');
      setStep('preview');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-neutral-950/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                Importar Base de Datos
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Carga tu catálogo de nombres para incorporarlo a la Base Maestra.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: UPLOAD ZONE */}
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-amber-500 bg-amber-500/5 scale-[0.99]'
                    : 'border-neutral-300 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 bg-neutral-50/60 dark:bg-neutral-950/60'
                }`}
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-bold text-neutral-900 dark:text-white">
                    Arrastra tu archivo aquí
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                    o haz clic en <span className="text-amber-500 font-semibold underline">Seleccionar archivo</span> desde tu equipo
                  </p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,.docx,.pdf,.txt"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>

              {/* Format badges */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                  Formatos Compatibles:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-neutral-200">Excel</div>
                      <div className="text-[10px] text-neutral-400">.xlsx, .xls</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-sky-500" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-neutral-200">CSV</div>
                      <div className="text-[10px] text-neutral-400">.csv</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-neutral-200">Word</div>
                      <div className="text-[10px] text-neutral-400">.docx</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-neutral-200">PDF</div>
                      <div className="text-[10px] text-neutral-400">.pdf</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 flex items-center gap-2">
                    <Database className="w-4 h-4 text-purple-500" />
                    <div>
                      <div className="font-bold text-neutral-800 dark:text-neutral-200">Catálogos</div>
                      <div className="text-[10px] text-neutral-400">Archivos Naming</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING CONFIGURATION */}
          {step === 'mapping' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <Sliders className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-neutral-900 dark:text-white">
                    Mapeo Inteligente de Columnas ({rawRows.length} filas detectadas)
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-400 mt-0.5">
                    Selecciona qué columna de tu archivo corresponde a cada campo de Macrumo Studio.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 flex items-center justify-between">
                    <span>Nombre Producto / Comercial *</span>
                    <span className="text-[10px] text-amber-500">Requerido</span>
                  </label>
                  <select
                    value={mapping.name}
                    onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Seleccionar Columna --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Categoría de Mobiliario
                  </label>
                  <select
                    value={mapping.category}
                    onChange={(e) => setMapping({ ...mapping, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Autodetectar / Usar Por Defecto --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Origen / Colección (ej. Macrumo, Falabella)
                  </label>
                  <select
                    value={mapping.origin}
                    onChange={(e) => setMapping({ ...mapping, origin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Autodetectar / Usar Por Defecto --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                    Descripción / Materiales
                  </label>
                  <select
                    value={mapping.description}
                    onChange={(e) => setMapping({ ...mapping, description: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <option value="">-- Opcional --</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW & VALIDATION */}
          {step === 'preview' && (
            <div className="space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <div className="text-[10px] uppercase font-mono font-bold">Nuevos</div>
                  <div className="text-xl font-extrabold mt-0.5">{metrics.newCount}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                  <div className="text-[10px] uppercase font-mono font-bold">Duplicados</div>
                  <div className="text-xl font-extrabold mt-0.5">{metrics.duplicateCount}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                  <div className="text-[10px] uppercase font-mono font-bold">Similares</div>
                  <div className="text-xl font-extrabold mt-0.5">{metrics.similarCount}</div>
                </div>

                <div className="p-3.5 rounded-xl bg-neutral-500/10 border border-neutral-500/20 text-neutral-600 dark:text-neutral-400">
                  <div className="text-[10px] uppercase font-mono font-bold">Total Registros</div>
                  <div className="text-xl font-extrabold mt-0.5">{metrics.total}</div>
                </div>
              </div>

              {/* Preview Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    Vista Previa de Registros ({previewItems.length})
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Los duplicados exactos serán omitidos automáticamente.
                  </span>
                </div>

                <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-50 dark:bg-neutral-950 sticky top-0 border-b border-neutral-200 dark:border-neutral-800 text-[10px] font-bold text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">Nombre Comercial</th>
                        <th className="p-2.5">Categoría</th>
                        <th className="p-2.5">Origen</th>
                        <th className="p-2.5">Estado Validación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                      {previewItems.slice(0, 50).map((item, i) => (
                        <tr key={i} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/40">
                          <td className="p-2.5 font-bold font-mono text-neutral-900 dark:text-white">
                            {item.name}
                          </td>
                          <td className="p-2.5 text-neutral-600 dark:text-neutral-400">{item.category}</td>
                          <td className="p-2.5 text-neutral-500 text-[11px]">{item.origin}</td>
                          <td className="p-2.5">
                            {item.statusVal === 'NUEVO' && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-semibold text-[10px]">
                                ✓ Nuevo
                              </span>
                            )}
                            {item.statusVal === 'DUPLICADO' && (
                              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 font-semibold text-[10px]">
                                ✕ Duplicado
                              </span>
                            )}
                            {item.statusVal === 'SIMILAR' && (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 font-semibold text-[10px]">
                                ⚠ Similar
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: IMPORTING SPINNER */}
          {step === 'importing' && (
            <div className="py-12 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-amber-500 animate-spin mx-auto" />
              <div className="font-bold text-sm text-neutral-900 dark:text-white">
                Incorporando registros a la Base Maestra...
              </div>
              <p className="text-xs text-neutral-500">
                Sincronizando índices fonéticos, prevención de duplicados y registro de auditoría.
              </p>
            </div>
          )}

          {/* STEP 5: SUCCESS SUMMARY */}
          {step === 'success' && finalResult && (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500 text-neutral-950 flex items-center justify-center mx-auto shadow-md">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white">
                  Importación completada.
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Los datos procesados se han incorporado oficialmente a la Base Maestra.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-left space-y-2 text-xs">
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>✓ Registros nuevos incorporados:</span>
                  <span>{finalResult.newCount}</span>
                </div>
                <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 font-bold">
                  <span>✓ Registros actualizados / similares:</span>
                  <span>{finalResult.updatedCount}</span>
                </div>
                <div className="flex items-center justify-between text-neutral-400 font-bold">
                  <span>⚠ Registros omitidos (Duplicados / Errores):</span>
                  <span>{finalResult.skippedCount}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 flex items-center justify-between">
          {step === 'upload' && (
            <button
              onClick={handleClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
            >
              Cancelar
            </button>
          )}

          {step === 'mapping' && (
            <>
              <button
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleGeneratePreview}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Analizar y Validar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'preview' && (
            <>
              <button
                onClick={() => setStep('mapping')}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
              >
                Atrás
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <span>Importar datos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {step === 'success' && (
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 font-bold text-xs transition-opacity"
            >
              Cerrar y Ver Base Maestra
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
