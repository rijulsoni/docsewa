import type { LucideIcon } from 'lucide-react';
import {
  FileImage, FileText, FileDown, Files, Scissors, RotateCw, Stamp, Trash2, Hash,
  ArrowUpDown, Minimize2, Layers, Crop, PanelTop, Tag, Lock, LockOpen, PenLine,
  Sparkles, Languages,
  Code, FileOutput, ImageIcon, FileCode, BarChart3, FilePlus, Replace, Search,
  Edit3,
  Repeat2, Wand2, SlidersHorizontal, ZoomIn, ScanText, Scaling,
  FlipHorizontal2, Palette, Film, Pipette, Globe, Square,
  Table2, FileSpreadsheet, Braces, FilePlus2, FileJson, GitCompare,
  CaseSensitive, AlignLeft, AlignCenter, LinkIcon, Filter, Type, Shuffle,
  Key, Fingerprint, Binary, Clock, KeyRound, Code2,
  Landmark, TrendingUp, Percent, Calendar, CalendarDays, Briefcase,
  Paintbrush, Ruler, Activity, QrCode,
} from 'lucide-react';

export type CategoryKey =
  | 'pdf' | 'word' | 'image' | 'excel' | 'text' | 'dev'
  | 'finance' | 'date' | 'css' | 'calc' | 'utility';

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  dot: string;        // Tailwind bg class for the colored dot
  iconBg: string;     // Tailwind gradient classes for tool icon bubble
  ring: string;       // Tailwind ring/border color
  text: string;       // Tailwind text color (for accents)
}

export const CATEGORIES: Record<CategoryKey, CategoryMeta> = {
  pdf:     { key: 'pdf',     label: 'PDF',         dot: 'bg-indigo-500',  iconBg: 'from-indigo-500 to-violet-600',  ring: 'ring-indigo-500/30',  text: 'text-indigo-300' },
  word:    { key: 'word',    label: 'Word',        dot: 'bg-blue-500',    iconBg: 'from-blue-500 to-cyan-600',      ring: 'ring-blue-500/30',    text: 'text-blue-300' },
  image:   { key: 'image',   label: 'Image',       dot: 'bg-pink-500',    iconBg: 'from-pink-500 to-rose-600',      ring: 'ring-pink-500/30',    text: 'text-pink-300' },
  excel:   { key: 'excel',   label: 'Excel / CSV', dot: 'bg-green-500',   iconBg: 'from-green-500 to-emerald-600',  ring: 'ring-green-500/30',   text: 'text-green-300' },
  text:    { key: 'text',    label: 'Text',        dot: 'bg-yellow-500',  iconBg: 'from-yellow-500 to-amber-600',   ring: 'ring-yellow-500/30',  text: 'text-yellow-300' },
  dev:     { key: 'dev',     label: 'Developer',   dot: 'bg-violet-500',  iconBg: 'from-violet-500 to-purple-600',  ring: 'ring-violet-500/30',  text: 'text-violet-300' },
  finance: { key: 'finance', label: 'Finance',     dot: 'bg-red-500',     iconBg: 'from-red-500 to-rose-600',       ring: 'ring-red-500/30',     text: 'text-red-300' },
  date:    { key: 'date',    label: 'Date & Time', dot: 'bg-sky-500',     iconBg: 'from-sky-500 to-cyan-600',       ring: 'ring-sky-500/30',     text: 'text-sky-300' },
  css:     { key: 'css',     label: 'CSS',         dot: 'bg-fuchsia-500', iconBg: 'from-fuchsia-500 to-pink-600',   ring: 'ring-fuchsia-500/30', text: 'text-fuchsia-300' },
  calc:    { key: 'calc',    label: 'Calculators', dot: 'bg-emerald-500', iconBg: 'from-emerald-500 to-teal-600',   ring: 'ring-emerald-500/30', text: 'text-emerald-300' },
  utility: { key: 'utility', label: 'Utility',     dot: 'bg-amber-500',   iconBg: 'from-amber-500 to-yellow-500',   ring: 'ring-amber-500/30',   text: 'text-amber-300' },
};

export interface ToolEntry {
  slug: string;             // path without leading slash
  href: string;             // "/slug"
  title: string;
  description: string;
  category: CategoryKey;
  icon: LucideIcon;
  iconBg: string;           // gradient (overrides category default if needed)
  badge?: 'AI' | 'Popular' | 'Fast' | 'Free' | 'New';
  popular?: boolean;        // surfaces on Home + at top of palette
  keywords?: string[];      // extra search terms (synonyms, intents)
}

export const TOOLS: ToolEntry[] = [
  // ── PDF (21) ────────────────────────────────────────────────────────
  { slug: 'pdf-editor', href: '/pdf-editor', title: 'PDF Editor', description: 'Open any PDF and edit it visually — add text, draw, sign, whiteout, insert images, more. All in one place.', category: 'pdf', icon: Edit3, iconBg: 'from-indigo-500 to-violet-600', badge: 'New', popular: true, keywords: ['edit pdf', 'annotate', 'sign', 'whiteout', 'add text to pdf', 'mark up'] },
  { slug: 'image-to-pdf', href: '/image-to-pdf', title: 'Image to PDF', description: 'Convert JPG, PNG and WebP images into a polished, print-ready PDF.', category: 'pdf', icon: FileImage, iconBg: 'from-blue-500 to-blue-600', badge: 'Popular', popular: true, keywords: ['jpg', 'png', 'webp', 'photo', 'picture', 'convert image'] },
  { slug: 'pdf-to-image', href: '/pdf-to-image', title: 'PDF to Image', description: 'Render any PDF page as a high-resolution PNG or JPG in your browser.', category: 'pdf', icon: FileDown, iconBg: 'from-violet-500 to-purple-600', popular: true, keywords: ['png', 'jpg', 'export'] },
  { slug: 'merge-pdf', href: '/merge-pdf', title: 'Merge PDF', description: 'Combine multiple PDFs into one. Drag to reorder pages before merging.', category: 'pdf', icon: Files, iconBg: 'from-emerald-500 to-teal-600', popular: true, keywords: ['combine', 'join', 'concatenate'] },
  { slug: 'pdf-split', href: '/pdf-split', title: 'Split PDF', description: 'Extract individual pages or a custom range into a new PDF.', category: 'pdf', icon: Scissors, iconBg: 'from-rose-500 to-pink-600', popular: true, keywords: ['extract pages', 'separate'] },
  { slug: 'extract-text', href: '/extract-text', title: 'Extract Text', description: 'Pull all readable text from any PDF. Copy or download as .txt.', category: 'pdf', icon: FileText, iconBg: 'from-orange-500 to-amber-600', badge: 'Fast', popular: true, keywords: ['copy text', 'pdf to text', 'txt'] },
  { slug: 'rotate-pdf', href: '/rotate-pdf', title: 'Rotate PDF', description: 'Rotate all or specific pages by 90°, 180°, or 270° in one click.', category: 'pdf', icon: RotateCw, iconBg: 'from-yellow-500 to-yellow-600', keywords: ['turn', 'orient'] },
  { slug: 'watermark-pdf', href: '/watermark-pdf', title: 'Watermark PDF', description: 'Stamp custom text diagonally across every page with adjustable opacity.', category: 'pdf', icon: Stamp, iconBg: 'from-purple-500 to-fuchsia-600', keywords: ['stamp', 'logo'] },
  { slug: 'remove-pages', href: '/remove-pages', title: 'Remove Pages', description: 'Delete one or more pages from a PDF by entering their page numbers.', category: 'pdf', icon: Trash2, iconBg: 'from-red-500 to-red-600', keywords: ['delete pages'] },
  { slug: 'page-numbers', href: '/page-numbers', title: 'Page Numbers', description: 'Stamp page numbers at any position with custom format and font size.', category: 'pdf', icon: Hash, iconBg: 'from-teal-500 to-cyan-600', keywords: ['numbering', 'pagination'] },
  { slug: 'reorder-pages', href: '/reorder-pages', title: 'Reorder Pages', description: 'Drag thumbnail previews into a new order, then download the rebuilt PDF.', category: 'pdf', icon: ArrowUpDown, iconBg: 'from-indigo-500 to-indigo-600', keywords: ['rearrange', 'sort pages'] },
  { slug: 'compress-pdf', href: '/compress-pdf', title: 'Compress PDF', description: 'Shrink file size by removing dead objects and compressing internal streams.', category: 'pdf', icon: Minimize2, iconBg: 'from-sky-500 to-sky-600', popular: true, keywords: ['shrink', 'reduce size', 'optimize'] },
  { slug: 'flatten-pdf', href: '/flatten-pdf', title: 'Flatten Forms', description: 'Bake interactive form fields into static content — locks answers permanently.', category: 'pdf', icon: Layers, iconBg: 'from-amber-500 to-orange-600', keywords: ['lock form', 'finalize'] },
  { slug: 'crop-pages', href: '/crop-pages', title: 'Crop Pages', description: 'Trim margins from PDF pages by specifying points to remove from each edge.', category: 'pdf', icon: Crop, iconBg: 'from-lime-500 to-green-600', keywords: ['trim', 'cut margins'] },
  { slug: 'header-footer', href: '/header-footer', title: 'Header / Footer', description: 'Stamp custom text at the top or bottom of every page with alignment options.', category: 'pdf', icon: PanelTop, iconBg: 'from-fuchsia-500 to-pink-600' },
  { slug: 'edit-metadata', href: '/edit-metadata', title: 'Edit Metadata', description: 'Update the title, author, subject and keywords stored in your PDF properties.', category: 'pdf', icon: Tag, iconBg: 'from-cyan-500 to-teal-600', keywords: ['author', 'title', 'properties'] },
  { slug: 'pdf-protect', href: '/pdf-protect', title: 'PDF Protect', description: 'Encrypt your PDF with a password and restrict printing, copying and editing.', category: 'pdf', icon: Lock, iconBg: 'from-red-500 to-rose-600', keywords: ['password', 'encrypt', 'secure'] },
  { slug: 'pdf-sign', href: '/pdf-sign', title: 'PDF Sign', description: 'Draw your signature and embed it on any page of your PDF document.', category: 'pdf', icon: PenLine, iconBg: 'from-indigo-500 to-violet-600', keywords: ['signature', 'esign'] },
  { slug: 'pdf-unlock', href: '/pdf-unlock', title: 'PDF Unlock', description: 'Remove the password from an encrypted PDF — enter the password once and download unlocked.', category: 'pdf', icon: LockOpen, iconBg: 'from-emerald-500 to-green-600', keywords: ['decrypt', 'remove password'] },
  { slug: 'chat-with-pdf', href: '/chat-with-pdf', title: 'Chat with PDF', description: 'Upload any PDF and chat with it — get an instant AI summary and ask questions about the content.', category: 'pdf', icon: Sparkles, iconBg: 'from-violet-500 to-purple-600', badge: 'AI', popular: true, keywords: ['ai', 'summarize', 'ask questions', 'gpt'] },
  { slug: 'document-translator', href: '/document-translator', title: 'Document Translator', description: 'Translate PDF, DOCX, or TXT documents into 20+ languages. Free, no sign-up needed.', category: 'pdf', icon: Languages, iconBg: 'from-sky-500 to-cyan-600', keywords: ['translate', 'language'] },

  // ── Word / DOCX (11) ────────────────────────────────────────────────
  { slug: 'docx-to-text', href: '/docx-to-text', title: 'DOCX to Text', description: 'Extract all readable text from a Word document — no Office required.', category: 'word', icon: FileText, iconBg: 'from-blue-500 to-blue-600', keywords: ['word', 'txt'] },
  { slug: 'docx-to-html', href: '/docx-to-html', title: 'DOCX to HTML', description: 'Convert a Word document to clean HTML, preserving headings, lists and tables.', category: 'word', icon: Code, iconBg: 'from-purple-500 to-purple-600' },
  { slug: 'docx-to-pdf', href: '/docx-to-pdf', title: 'DOCX to PDF', description: 'Convert a Word document to a downloadable PDF — headings and lists preserved.', category: 'word', icon: FileOutput, iconBg: 'from-red-500 to-red-600', popular: true, keywords: ['word to pdf'] },
  { slug: 'pdf-to-docx', href: '/pdf-to-docx', title: 'PDF to DOCX', description: 'Convert a PDF to an editable Word document with paragraphs and headings.', category: 'word', icon: FileDown, iconBg: 'from-sky-500 to-sky-600', popular: true, keywords: ['pdf to word', 'edit pdf'] },
  { slug: 'merge-docx', href: '/merge-docx', title: 'Merge DOCX', description: 'Combine multiple Word documents into one — each file starts on a new page.', category: 'word', icon: Files, iconBg: 'from-emerald-500 to-teal-600', keywords: ['combine word'] },
  { slug: 'docx-find-replace', href: '/docx-find-replace', title: 'Find & Replace (DOCX)', description: 'Bulk-replace any text string in a Word document — case-sensitive or insensitive.', category: 'word', icon: Search, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'docx-metadata', href: '/docx-metadata', title: 'DOCX Metadata', description: 'Edit the title, author, company and keywords stored in your Word document.', category: 'word', icon: Tag, iconBg: 'from-indigo-500 to-indigo-600' },
  { slug: 'docx-extract-images', href: '/docx-extract-images', title: 'Extract Images', description: 'Pull all embedded images out of a Word document as a ZIP archive.', category: 'word', icon: ImageIcon, iconBg: 'from-pink-500 to-rose-600' },
  { slug: 'docx-to-markdown', href: '/docx-to-markdown', title: 'DOCX to Markdown', description: 'Convert a Word document to clean Markdown format — copy or download .md.', category: 'word', icon: FileCode, iconBg: 'from-indigo-500 to-violet-600', keywords: ['md'] },
  { slug: 'docx-word-count', href: '/docx-word-count', title: 'Word Count (DOCX)', description: 'Analyse a Word document for words, characters, sentences, reading and speaking time.', category: 'word', icon: BarChart3, iconBg: 'from-sky-500 to-cyan-600' },
  { slug: 'txt-to-docx', href: '/txt-to-docx', title: 'TXT to DOCX', description: 'Convert a plain-text file or pasted text into a formatted Word document.', category: 'word', icon: FilePlus, iconBg: 'from-emerald-500 to-green-600' },

  // ── Image (15) ──────────────────────────────────────────────────────
  { slug: 'image-format-converter', href: '/image-format-converter', title: 'Image Format Converter', description: 'Convert between HEIC, WebP, SVG, JPG and PNG formats instantly in your browser.', category: 'image', icon: Repeat2, iconBg: 'from-pink-500 to-rose-600', keywords: ['heic', 'webp', 'svg', 'jpg', 'png'] },
  { slug: 'background-remover', href: '/background-remover', title: 'Background Remover', description: 'AI strips the background to pure transparency — faces and edges stay pixel-perfect.', category: 'image', icon: Wand2, iconBg: 'from-emerald-500 to-teal-600', badge: 'AI', popular: true, keywords: ['remove bg', 'transparent', 'cutout'] },
  { slug: 'batch-compress', href: '/batch-compress', title: 'Batch Image Compressor', description: 'Drop 100 images and resize by exact pixels or compress by quality percentage.', category: 'image', icon: SlidersHorizontal, iconBg: 'from-violet-500 to-purple-600', keywords: ['compress', 'shrink images'] },
  { slug: 'image-upscaler', href: '/image-upscaler', title: 'Image Upscaler', description: 'Enlarge low-res or pixelated images to 2× or 4× with smooth progressive upscaling.', category: 'image', icon: ZoomIn, iconBg: 'from-sky-500 to-cyan-600', keywords: ['enlarge', 'enhance'] },
  { slug: 'image-to-text', href: '/image-to-text', title: 'Image to Text', description: 'Extract readable text from photos, screenshots and scanned images using AI OCR.', category: 'image', icon: ScanText, iconBg: 'from-teal-500 to-cyan-600', badge: 'AI', keywords: ['ocr', 'screenshot', 'photo to text'] },
  { slug: 'image-crop', href: '/image-crop', title: 'Crop & Resize Image', description: 'Drag corner handles to select any region, lock aspect ratio, and download.', category: 'image', icon: Crop, iconBg: 'from-orange-500 to-amber-600' },
  { slug: 'image-resize', href: '/image-resize', title: 'Image Resize', description: 'Resize images to exact dimensions — lock aspect ratio and choose output format.', category: 'image', icon: Scaling, iconBg: 'from-blue-500 to-blue-600', popular: true, keywords: ['scale', 'dimensions'] },
  { slug: 'image-watermark', href: '/image-watermark', title: 'Image Watermark', description: 'Add a custom text watermark with adjustable position, opacity, and color.', category: 'image', icon: Stamp, iconBg: 'from-purple-500 to-violet-600' },
  { slug: 'image-flip-rotate', href: '/image-flip-rotate', title: 'Flip & Rotate Image', description: 'Flip horizontally/vertically or rotate 90°/180° — instant preview and download.', category: 'image', icon: FlipHorizontal2, iconBg: 'from-amber-500 to-orange-600' },
  { slug: 'color-palette', href: '/color-palette', title: 'Color Palette', description: 'Extract the dominant colors from any image as HEX and RGB swatches to copy.', category: 'image', icon: Palette, iconBg: 'from-pink-500 to-fuchsia-600', keywords: ['dominant colors', 'theme'] },
  { slug: 'gif-maker', href: '/gif-maker', title: 'GIF Maker', description: 'Combine multiple images into an animated GIF with custom frame delay and size.', category: 'image', icon: Film, iconBg: 'from-teal-500 to-emerald-600', keywords: ['animation', 'animated'] },
  { slug: 'image-color-picker', href: '/image-color-picker', title: 'Image Color Picker', description: 'Upload an image, hover to preview colors, and click any pixel to copy HEX/RGB.', category: 'image', icon: Pipette, iconBg: 'from-rose-500 to-pink-600', keywords: ['eyedropper', 'hex'] },
  { slug: 'favicon-generator', href: '/favicon-generator', title: 'Favicon Generator', description: 'Generate favicon PNG files at all standard sizes (16–512px) from any image.', category: 'image', icon: Globe, iconBg: 'from-orange-500 to-amber-600', keywords: ['icon', 'site icon'] },
  { slug: 'image-to-base64', href: '/image-to-base64', title: 'Image to Base64', description: 'Convert any image to a Base64 data URL — copy or download for use in CSS/HTML.', category: 'image', icon: Binary, iconBg: 'from-indigo-500 to-violet-600' },
  { slug: 'ocr-scanner', href: '/ocr-scanner', title: 'OCR Scanner', description: 'Extract searchable, editable text from scanned images and photos. Supports 40+ languages.', category: 'image', icon: ScanText, iconBg: 'from-teal-500 to-cyan-600', badge: 'Free', keywords: ['scanner', 'recognize text'] },

  // ── Excel / CSV (7) ─────────────────────────────────────────────────
  { slug: 'excel-to-csv', href: '/excel-to-csv', title: 'Excel to CSV', description: 'Convert any sheet in an Excel workbook to a clean, comma-separated CSV file.', category: 'excel', icon: Table2, iconBg: 'from-green-500 to-emerald-600', keywords: ['xlsx'] },
  { slug: 'csv-to-excel', href: '/csv-to-excel', title: 'CSV to Excel', description: 'Turn a CSV file into a formatted .xlsx workbook with a custom sheet name.', category: 'excel', icon: FileSpreadsheet, iconBg: 'from-blue-500 to-blue-600' },
  { slug: 'excel-to-json', href: '/excel-to-json', title: 'Excel to JSON', description: 'Convert spreadsheet rows into a JSON array — use the first row as keys.', category: 'excel', icon: Braces, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'merge-excel', href: '/merge-excel', title: 'Merge Excel', description: 'Combine multiple .xlsx files into one — merge sheets or stack rows vertically.', category: 'excel', icon: FilePlus2, iconBg: 'from-purple-500 to-violet-600' },
  { slug: 'json-to-excel', href: '/json-to-excel', title: 'JSON to Excel', description: 'Paste a JSON array and download it as a formatted .xlsx spreadsheet instantly.', category: 'excel', icon: FileJson, iconBg: 'from-amber-500 to-orange-600' },
  { slug: 'csv-merge', href: '/csv-merge', title: 'CSV Merge', description: 'Combine multiple CSV files into one — optionally keep only the first header row.', category: 'excel', icon: FilePlus2, iconBg: 'from-emerald-500 to-teal-600' },
  { slug: 'csv-diff', href: '/csv-diff', title: 'CSV Diff', description: 'Compare two CSV files line by line — see added and removed rows highlighted.', category: 'excel', icon: GitCompare, iconBg: 'from-red-500 to-rose-600', keywords: ['compare'] },

  // ── Text (14) ───────────────────────────────────────────────────────
  { slug: 'case-converter', href: '/case-converter', title: 'Case Converter', description: 'Transform text between UPPER, lower, Title, Sentence, camelCase and snake_case.', category: 'text', icon: CaseSensitive, iconBg: 'from-yellow-500 to-amber-500', keywords: ['uppercase', 'lowercase'] },
  { slug: 'word-counter', href: '/word-counter', title: 'Word Counter', description: 'Paste any text and instantly see word, character, sentence, paragraph and reading-time stats.', category: 'text', icon: AlignLeft, iconBg: 'from-blue-500 to-blue-600' },
  { slug: 'lorem-ipsum', href: '/lorem-ipsum', title: 'Lorem Ipsum', description: 'Generate words, sentences or paragraphs of placeholder text and copy or download instantly.', category: 'text', icon: AlignCenter, iconBg: 'from-violet-500 to-purple-600', keywords: ['placeholder', 'dummy'] },
  { slug: 'text-diff', href: '/text-diff', title: 'Text Diff', description: 'Compare two blocks of text line by line — added lines green, removed lines red.', category: 'text', icon: GitCompare, iconBg: 'from-red-500 to-rose-600', keywords: ['compare'] },
  { slug: 'markdown-to-html', href: '/markdown-to-html', title: 'Markdown to HTML', description: 'Convert Markdown to HTML with a live split-pane preview — copy or download.', category: 'text', icon: Code, iconBg: 'from-teal-500 to-cyan-600', keywords: ['md'] },
  { slug: 'html-to-markdown', href: '/html-to-markdown', title: 'HTML to Markdown', description: 'Paste any HTML and get clean Markdown output using TurndownService.', category: 'text', icon: FileCode, iconBg: 'from-indigo-500 to-indigo-600' },
  { slug: 'text-encoder', href: '/text-encoder', title: 'Text Encoder', description: 'Encode/decode with ROT13, HTML entities, and Morse code — all in one tool.', category: 'text', icon: Shuffle, iconBg: 'from-orange-500 to-amber-600' },
  { slug: 'number-to-words', href: '/number-to-words', title: 'Number to Words', description: 'Convert any integer up to 999 billion to English words and ordinal form.', category: 'text', icon: Hash, iconBg: 'from-blue-500 to-sky-600' },
  { slug: 'url-slug', href: '/url-slug', title: 'URL Slug', description: 'Convert text to URL-friendly slugs — supports multi-line, dash or underscore.', category: 'text', icon: LinkIcon, iconBg: 'from-violet-500 to-purple-600', keywords: ['kebab', 'slugify'] },
  { slug: 'sort-lines', href: '/sort-lines', title: 'Sort Lines', description: 'Sort text lines A→Z, Z→A, by length, or shuffle — with case and trim options.', category: 'text', icon: ArrowUpDown, iconBg: 'from-blue-500 to-sky-600', keywords: ['alphabetize'] },
  { slug: 'remove-duplicates', href: '/remove-duplicates', title: 'Remove Duplicates', description: 'Strip duplicate lines from any text — case-insensitive and trim options.', category: 'text', icon: Filter, iconBg: 'from-red-500 to-rose-600', keywords: ['dedupe', 'unique'] },
  { slug: 'find-replace-text', href: '/find-replace-text', title: 'Find & Replace (Text)', description: 'Find and replace text with live match highlighting, regex and whole-word support.', category: 'text', icon: Replace, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'fancy-text', href: '/fancy-text', title: 'Fancy Text', description: 'Generate bold, italic, script, circled and 10+ Unicode text styles instantly.', category: 'text', icon: Type, iconBg: 'from-purple-500 to-violet-600', keywords: ['stylish', 'unicode'] },
  { slug: 'string-escape', href: '/string-escape', title: 'String Escape', description: 'Escape or unescape strings for JavaScript and Python — handles \\n, \\t, Unicode.', category: 'text', icon: Code, iconBg: 'from-teal-500 to-cyan-600' },

  // ── Developer (15) ──────────────────────────────────────────────────
  { slug: 'json-formatter', href: '/json-formatter', title: 'JSON Formatter', description: 'Prettify, minify and validate JSON — copy the result or see error details inline.', category: 'dev', icon: Braces, iconBg: 'from-amber-500 to-yellow-600', popular: true, keywords: ['pretty', 'beautify', 'validate'] },
  { slug: 'base64', href: '/base64', title: 'Base64', description: 'Encode or decode text and files to/from Base64 — handles Unicode correctly.', category: 'dev', icon: Hash, iconBg: 'from-indigo-500 to-violet-600' },
  { slug: 'hash-generator', href: '/hash-generator', title: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from any text input.', category: 'dev', icon: Hash, iconBg: 'from-red-500 to-rose-600', keywords: ['sha', 'md5', 'checksum'] },
  { slug: 'url-encoder', href: '/url-encoder', title: 'URL Encoder', description: 'Encode or decode URLs and query strings with percent-encoding instantly.', category: 'dev', icon: LinkIcon, iconBg: 'from-blue-500 to-sky-600', keywords: ['percent encode'] },
  { slug: 'jwt-decoder', href: '/jwt-decoder', title: 'JWT Decoder', description: 'Decode any JWT token — view header, payload, expiry status without a secret.', category: 'dev', icon: Key, iconBg: 'from-purple-500 to-violet-600', keywords: ['token', 'auth'] },
  { slug: 'regex-tester', href: '/regex-tester', title: 'Regex Tester', description: 'Test regular expressions live with match highlighting, groups, and flag toggles.', category: 'dev', icon: Search, iconBg: 'from-teal-500 to-cyan-600', keywords: ['regular expression'] },
  { slug: 'uuid-generator', href: '/uuid-generator', title: 'UUID Generator', description: 'Generate 1–100 cryptographically secure UUIDs — uppercase, hyphen and copy options.', category: 'dev', icon: Fingerprint, iconBg: 'from-emerald-500 to-green-600', keywords: ['guid'] },
  { slug: 'color-converter', href: '/color-converter', title: 'Color Converter', description: 'Convert between HEX, RGB and HSL color formats instantly with a live preview.', category: 'dev', icon: Pipette, iconBg: 'from-pink-500 to-fuchsia-600' },
  { slug: 'number-base-converter', href: '/number-base-converter', title: 'Number Base', description: 'Convert numbers between decimal, binary, octal and hexadecimal in real time.', category: 'dev', icon: Binary, iconBg: 'from-indigo-500 to-violet-600', keywords: ['hex', 'binary'] },
  { slug: 'timestamp-converter', href: '/timestamp-converter', title: 'Timestamp Converter', description: 'Convert Unix timestamps to human dates or any date to a Unix timestamp.', category: 'dev', icon: Clock, iconBg: 'from-teal-500 to-cyan-600', keywords: ['epoch', 'unix'] },
  { slug: 'password-generator', href: '/password-generator', title: 'Password Generator', description: 'Generate secure passwords with custom length, charset options and a strength meter.', category: 'dev', icon: KeyRound, iconBg: 'from-emerald-500 to-green-600', popular: true, keywords: ['secure', 'random'] },
  { slug: 'json-to-csv', href: '/json-to-csv', title: 'JSON to CSV', description: 'Paste a JSON array and download it as a CSV — preview first 5 rows before saving.', category: 'dev', icon: Table2, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'cron-parser', href: '/cron-parser', title: 'CRON Parser', description: 'Explain any cron expression in plain English and show the next 5 run times.', category: 'dev', icon: Clock, iconBg: 'from-emerald-500 to-green-600' },
  { slug: 'html-entities', href: '/html-entities', title: 'HTML Entities', description: 'Encode or decode HTML entities — with a reference table of common entities.', category: 'dev', icon: Code2, iconBg: 'from-indigo-500 to-violet-600' },
  { slug: 'markdown-table-generator', href: '/markdown-table-generator', title: 'Markdown Table', description: 'Build a visual table and copy the formatted Markdown output instantly.', category: 'dev', icon: Table2, iconBg: 'from-orange-500 to-amber-600' },

  // ── Finance (4) ─────────────────────────────────────────────────────
  { slug: 'loan-calculator', href: '/loan-calculator', title: 'Loan Calculator', description: 'Calculate monthly EMI, total payment and interest for any loan.', category: 'finance', icon: Landmark, iconBg: 'from-red-500 to-rose-600', keywords: ['emi', 'mortgage'] },
  { slug: 'compound-interest', href: '/compound-interest', title: 'Compound Interest', description: 'Calculate compound growth with year-by-year breakdown and effective rate.', category: 'finance', icon: TrendingUp, iconBg: 'from-emerald-500 to-green-600', keywords: ['savings', 'investment'] },
  { slug: 'tip-calculator', href: '/tip-calculator', title: 'Tip Calculator', description: 'Calculate tip and split the bill between any number of people.', category: 'finance', icon: Percent, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'discount-calculator', href: '/discount-calculator', title: 'Discount Calculator', description: '3 modes: final price, discount %, or original price — all with savings shown.', category: 'finance', icon: Tag, iconBg: 'from-purple-500 to-violet-600', keywords: ['sale'] },

  // ── Date & Time (4) ─────────────────────────────────────────────────
  { slug: 'age-calculator', href: '/age-calculator', title: 'Age Calculator', description: 'Calculate exact age in years/months/days, total days lived and next birthday.', category: 'date', icon: Calendar, iconBg: 'from-blue-500 to-sky-600' },
  { slug: 'date-difference', href: '/date-difference', title: 'Date Difference', description: 'Find the difference between two dates in years, months, days, weeks and hours.', category: 'date', icon: CalendarDays, iconBg: 'from-teal-500 to-cyan-600' },
  { slug: 'timezone-converter', href: '/timezone-converter', title: 'Timezone Converter', description: 'Convert any time across 12+ time zones simultaneously using the Intl API.', category: 'date', icon: Globe, iconBg: 'from-indigo-500 to-violet-600' },
  { slug: 'work-days-calculator', href: '/work-days-calculator', title: 'Work Days Calculator', description: 'Count working days between two dates — excluding weekends and custom holidays.', category: 'date', icon: Briefcase, iconBg: 'from-orange-500 to-amber-600', keywords: ['business days'] },

  // ── CSS (3) ─────────────────────────────────────────────────────────
  { slug: 'gradient-generator', href: '/gradient-generator', title: 'Gradient Generator', description: 'Build linear and radial CSS gradients with live preview and instant copy.', category: 'css', icon: Paintbrush, iconBg: 'from-purple-500 to-pink-600' },
  { slug: 'box-shadow-generator', href: '/box-shadow-generator', title: 'Box Shadow', description: 'Design multi-layer box shadows visually — copy the ready-to-use CSS instantly.', category: 'css', icon: Square, iconBg: 'from-indigo-500 to-violet-600' },
  { slug: 'css-formatter', href: '/css-formatter', title: 'CSS Formatter', description: 'Prettify CSS with consistent indentation or minify it for production in one click.', category: 'css', icon: Code2, iconBg: 'from-teal-500 to-cyan-600' },

  // ── Calculators (3) ─────────────────────────────────────────────────
  { slug: 'percentage-calculator', href: '/percentage-calculator', title: 'Percentage Calc', description: 'Four calculation modes — find X% of Y, percentage change, and more.', category: 'calc', icon: Percent, iconBg: 'from-amber-500 to-yellow-600' },
  { slug: 'unit-converter', href: '/unit-converter', title: 'Unit Converter', description: 'Convert length, weight, temperature, area, volume and speed between common units.', category: 'calc', icon: Ruler, iconBg: 'from-blue-500 to-sky-600' },
  { slug: 'bmi-calculator', href: '/bmi-calculator', title: 'BMI Calculator', description: 'Calculate BMI in metric or imperial — shows category, visual scale and ideal weight.', category: 'calc', icon: Activity, iconBg: 'from-emerald-500 to-green-600' },

  // ── Utility (1) ─────────────────────────────────────────────────────
  { slug: 'qr-generator', href: '/qr-generator', title: 'QR Generator', description: 'Generate a QR code from any URL or text. Customize colors and download PNG or SVG.', category: 'utility', icon: QrCode, iconBg: 'from-yellow-500 to-amber-500', popular: true, keywords: ['qr code', 'barcode'] },
];

export const TOOL_BY_SLUG: Record<string, ToolEntry> =
  Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

export const TOOL_BY_HREF: Record<string, ToolEntry> =
  Object.fromEntries(TOOLS.map((t) => [t.href, t]));

export const TOOLS_BY_CATEGORY: Record<CategoryKey, ToolEntry[]> = TOOLS.reduce(
  (acc, t) => {
    (acc[t.category] ||= []).push(t);
    return acc;
  },
  {} as Record<CategoryKey, ToolEntry[]>
);

export const POPULAR_TOOLS: ToolEntry[] = TOOLS.filter((t) => t.popular);

export const TOTAL_TOOLS = TOOLS.length;
