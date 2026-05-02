import React from 'react';
import FeatureCard from './FeatureCard';
import {
  FileImage, FileText, Files, Scissors, FileDown,
  RotateCw, Stamp, Trash2, Hash, ArrowUpDown,
  Minimize2, Layers, Crop, PanelTop, Tag,
  Code, Search, FileOutput, ImageIcon,
  Wand2, ZoomIn, Repeat2, SlidersHorizontal,
  Lock, PenLine, ScanText, BoxSelect,
  Table2, FileSpreadsheet, Braces, FilePlus2, QrCode,
  LockOpen, Scaling, FlipHorizontal2, Palette, Film,
  FileCode, BarChart3, FilePlus, GitCompare,
  AlignLeft, AlignCenter, FileJson, Key, Fingerprint,
  Link as LinkIcon, CaseSensitive, Pipette, Binary, Clock,
  KeyRound, Shuffle, Paintbrush, Square, Code2, Percent,
  Ruler, Activity, Globe, TrendingUp, Calendar, CalendarDays,
  Briefcase, Landmark, Filter, Replace, Type,
} from 'lucide-react';

const pdfTools = [
  { title: 'Image to PDF', description: 'Convert JPG, PNG and WebP images into a polished, print-ready PDF.', icon: <FileImage className="h-5 w-5" />, path: '/image-to-pdf', iconBg: 'from-blue-500 to-blue-600', badge: 'Popular' },
  { title: 'PDF to Image', description: 'Render any PDF page as a high-resolution PNG or JPG in your browser.', icon: <FileDown className="h-5 w-5" />, path: '/pdf-to-image', iconBg: 'from-violet-500 to-purple-600' },
  { title: 'Merge PDF', description: 'Combine multiple PDFs into one. Drag to reorder pages before merging.', icon: <Files className="h-5 w-5" />, path: '/merge-pdf', iconBg: 'from-emerald-500 to-teal-600' },
  { title: 'Split PDF', description: 'Extract individual pages or a custom range into a new PDF.', icon: <Scissors className="h-5 w-5" />, path: '/pdf-split', iconBg: 'from-rose-500 to-pink-600' },
  { title: 'Extract Text', description: 'Pull all readable text from any PDF. Copy or download as .txt.', icon: <FileText className="h-5 w-5" />, path: '/extract-text', iconBg: 'from-orange-500 to-amber-600', badge: 'Fast' },
  { title: 'Rotate PDF', description: 'Rotate all or specific pages by 90°, 180°, or 270° in one click.', icon: <RotateCw className="h-5 w-5" />, path: '/rotate-pdf', iconBg: 'from-yellow-500 to-yellow-600' },
  { title: 'Watermark PDF', description: 'Stamp custom text diagonally across every page with adjustable opacity.', icon: <Stamp className="h-5 w-5" />, path: '/watermark-pdf', iconBg: 'from-purple-500 to-fuchsia-600' },
  { title: 'Remove Pages', description: 'Delete one or more pages from a PDF by entering their page numbers.', icon: <Trash2 className="h-5 w-5" />, path: '/remove-pages', iconBg: 'from-red-500 to-red-600' },
  { title: 'Page Numbers', description: 'Stamp page numbers at any position with custom format and font size.', icon: <Hash className="h-5 w-5" />, path: '/page-numbers', iconBg: 'from-teal-500 to-cyan-600' },
  { title: 'Reorder Pages', description: 'Drag thumbnail previews into a new order, then download the rebuilt PDF.', icon: <ArrowUpDown className="h-5 w-5" />, path: '/reorder-pages', iconBg: 'from-indigo-500 to-indigo-600' },
  { title: 'Compress PDF', description: 'Shrink file size by removing dead objects and compressing internal streams.', icon: <Minimize2 className="h-5 w-5" />, path: '/compress-pdf', iconBg: 'from-sky-500 to-sky-600' },
  { title: 'Flatten Forms', description: 'Bake interactive form fields into static content — locks answers permanently.', icon: <Layers className="h-5 w-5" />, path: '/flatten-pdf', iconBg: 'from-amber-500 to-orange-600' },
  { title: 'Crop Pages', description: 'Trim margins from PDF pages by specifying points to remove from each edge.', icon: <Crop className="h-5 w-5" />, path: '/crop-pages', iconBg: 'from-lime-500 to-green-600' },
  { title: 'Header / Footer', description: 'Stamp custom text at the top or bottom of every page with alignment options.', icon: <PanelTop className="h-5 w-5" />, path: '/header-footer', iconBg: 'from-fuchsia-500 to-pink-600' },
  { title: 'Edit Metadata', description: 'Update the title, author, subject and keywords stored in your PDF properties.', icon: <Tag className="h-5 w-5" />, path: '/edit-metadata', iconBg: 'from-cyan-500 to-teal-600' },
  { title: 'PDF Protect', description: 'Encrypt your PDF with a password and restrict printing, copying and editing.', icon: <Lock className="h-5 w-5" />, path: '/pdf-protect', iconBg: 'from-red-500 to-rose-600' },
  { title: 'PDF Sign', description: 'Draw your signature and embed it on any page of your PDF document.', icon: <PenLine className="h-5 w-5" />, path: '/pdf-sign', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'PDF Unlock', description: 'Remove the password from an encrypted PDF — enter the password once and download unlocked.', icon: <LockOpen className="h-5 w-5" />, path: '/pdf-unlock', iconBg: 'from-emerald-500 to-green-600' },
];

const wordTools = [
  { title: 'DOCX to Text', description: 'Extract all readable text from a Word document — no Office required.', icon: <FileText className="h-5 w-5" />, path: '/docx-to-text', iconBg: 'from-blue-500 to-blue-600' },
  { title: 'DOCX to HTML', description: 'Convert a Word document to clean HTML, preserving headings, lists and tables.', icon: <Code className="h-5 w-5" />, path: '/docx-to-html', iconBg: 'from-purple-500 to-purple-600' },
  { title: 'DOCX to PDF', description: 'Convert a Word document to a downloadable PDF — headings and lists preserved.', icon: <FileOutput className="h-5 w-5" />, path: '/docx-to-pdf', iconBg: 'from-red-500 to-red-600' },
  { title: 'PDF to DOCX', description: 'Convert a PDF to an editable Word document with paragraphs and headings.', icon: <FileOutput className="h-5 w-5" />, path: '/pdf-to-docx', iconBg: 'from-sky-500 to-sky-600' },
  { title: 'Merge DOCX', description: 'Combine multiple Word documents into one — each file starts on a new page.', icon: <Files className="h-5 w-5" />, path: '/merge-docx', iconBg: 'from-emerald-500 to-teal-600' },
  { title: 'Find & Replace', description: 'Bulk-replace any text string in a Word document — case-sensitive or insensitive.', icon: <Search className="h-5 w-5" />, path: '/docx-find-replace', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'DOCX Metadata', description: 'Edit the title, author, company and keywords stored in your Word document.', icon: <Tag className="h-5 w-5" />, path: '/docx-metadata', iconBg: 'from-indigo-500 to-indigo-600' },
  { title: 'Extract Images', description: 'Pull all embedded images out of a Word document as a ZIP archive.', icon: <ImageIcon className="h-5 w-5" />, path: '/docx-extract-images', iconBg: 'from-pink-500 to-rose-600' },
  { title: 'DOCX to Markdown', description: 'Convert a Word document to clean Markdown format — copy or download .md.', icon: <FileCode className="h-5 w-5" />, path: '/docx-to-markdown', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'Word Count', description: 'Analyse a Word document for words, characters, sentences, reading and speaking time.', icon: <BarChart3 className="h-5 w-5" />, path: '/docx-word-count', iconBg: 'from-sky-500 to-cyan-600' },
  { title: 'TXT to DOCX', description: 'Convert a plain-text file or pasted text into a formatted Word document.', icon: <FilePlus className="h-5 w-5" />, path: '/txt-to-docx', iconBg: 'from-emerald-500 to-green-600' },
];

const imageTools = [
  { title: 'Format Converter', description: 'Convert between HEIC, WebP, SVG, JPG and PNG formats instantly in your browser.', icon: <Repeat2 className="h-5 w-5" />, path: '/image-format-converter', iconBg: 'from-pink-500 to-rose-600' },
  { title: 'Background Remover', description: 'AI strips the background to pure transparency — faces and edges stay pixel-perfect.', icon: <Wand2 className="h-5 w-5" />, path: '/background-remover', iconBg: 'from-emerald-500 to-teal-600', badge: 'AI' },
  { title: 'Batch Compressor', description: 'Drop 100 images and resize by exact pixels or compress by quality percentage.', icon: <SlidersHorizontal className="h-5 w-5" />, path: '/batch-compress', iconBg: 'from-violet-500 to-purple-600' },
  { title: 'Image Upscaler', description: 'Enlarge low-res or pixelated images to 2× or 4× with smooth progressive upscaling.', icon: <ZoomIn className="h-5 w-5" />, path: '/image-upscaler', iconBg: 'from-sky-500 to-cyan-600' },
  { title: 'Image to Text', description: 'Extract readable text from photos, screenshots and scanned images using AI OCR.', icon: <ScanText className="h-5 w-5" />, path: '/image-to-text', iconBg: 'from-teal-500 to-cyan-600', badge: 'AI' },
  { title: 'Crop & Resize', description: 'Drag corner handles to select any region, lock aspect ratio, and download.', icon: <BoxSelect className="h-5 w-5" />, path: '/image-crop', iconBg: 'from-orange-500 to-amber-600' },
  { title: 'Image Resize', description: 'Resize images to exact dimensions — lock aspect ratio and choose output format.', icon: <Scaling className="h-5 w-5" />, path: '/image-resize', iconBg: 'from-blue-500 to-blue-600' },
  { title: 'Image Watermark', description: 'Add a custom text watermark with adjustable position, opacity, and color.', icon: <Stamp className="h-5 w-5" />, path: '/image-watermark', iconBg: 'from-purple-500 to-violet-600' },
  { title: 'Flip & Rotate', description: 'Flip horizontally/vertically or rotate 90°/180° — instant preview and download.', icon: <FlipHorizontal2 className="h-5 w-5" />, path: '/image-flip-rotate', iconBg: 'from-amber-500 to-orange-600' },
  { title: 'Color Palette', description: 'Extract the dominant colors from any image as HEX and RGB swatches to copy.', icon: <Palette className="h-5 w-5" />, path: '/color-palette', iconBg: 'from-pink-500 to-fuchsia-600' },
  { title: 'GIF Maker', description: 'Combine multiple images into an animated GIF with custom frame delay and size.', icon: <Film className="h-5 w-5" />, path: '/gif-maker', iconBg: 'from-teal-500 to-emerald-600' },
  { title: 'Color Picker', description: 'Upload an image, hover to preview colors, and click any pixel to copy HEX/RGB.', icon: <Pipette className="h-5 w-5" />, path: '/image-color-picker', iconBg: 'from-rose-500 to-pink-600' },
  { title: 'Favicon Generator', description: 'Generate favicon PNG files at all standard sizes (16–512px) from any image.', icon: <Globe className="h-5 w-5" />, path: '/favicon-generator', iconBg: 'from-orange-500 to-amber-600' },
  { title: 'Image to Base64', description: 'Convert any image to a Base64 data URL — copy or download for use in CSS/HTML.', icon: <Binary className="h-5 w-5" />, path: '/image-to-base64', iconBg: 'from-indigo-500 to-violet-600' },
];

const excelTools = [
  { title: 'Excel to CSV', description: 'Convert any sheet in an Excel workbook to a clean, comma-separated CSV file.', icon: <Table2 className="h-5 w-5" />, path: '/excel-to-csv', iconBg: 'from-green-500 to-emerald-600' },
  { title: 'CSV to Excel', description: 'Turn a CSV file into a formatted .xlsx workbook with a custom sheet name.', icon: <FileSpreadsheet className="h-5 w-5" />, path: '/csv-to-excel', iconBg: 'from-blue-500 to-blue-600' },
  { title: 'Excel to JSON', description: 'Convert spreadsheet rows into a JSON array — use the first row as keys.', icon: <Braces className="h-5 w-5" />, path: '/excel-to-json', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'Merge Excel', description: 'Combine multiple .xlsx files into one — merge sheets or stack rows vertically.', icon: <FilePlus2 className="h-5 w-5" />, path: '/merge-excel', iconBg: 'from-purple-500 to-violet-600' },
  { title: 'JSON to Excel', description: 'Paste a JSON array and download it as a formatted .xlsx spreadsheet instantly.', icon: <FileJson className="h-5 w-5" />, path: '/json-to-excel', iconBg: 'from-amber-500 to-orange-600' },
  { title: 'CSV Merge', description: 'Combine multiple CSV files into one — optionally keep only the first header row.', icon: <FilePlus2 className="h-5 w-5" />, path: '/csv-merge', iconBg: 'from-emerald-500 to-teal-600' },
  { title: 'CSV Diff', description: 'Compare two CSV files line by line — see added and removed rows highlighted.', icon: <GitCompare className="h-5 w-5" />, path: '/csv-diff', iconBg: 'from-red-500 to-rose-600' },
];

const textTools = [
  { title: 'Case Converter', description: 'Transform text between UPPER, lower, Title, Sentence, camelCase and snake_case.', icon: <CaseSensitive className="h-5 w-5" />, path: '/case-converter', iconBg: 'from-yellow-500 to-amber-500' },
  { title: 'Word Counter', description: 'Paste any text and instantly see word, character, sentence, paragraph and reading-time stats.', icon: <AlignLeft className="h-5 w-5" />, path: '/word-counter', iconBg: 'from-blue-500 to-blue-600' },
  { title: 'Lorem Ipsum', description: 'Generate words, sentences or paragraphs of placeholder text and copy or download instantly.', icon: <AlignCenter className="h-5 w-5" />, path: '/lorem-ipsum', iconBg: 'from-violet-500 to-purple-600' },
  { title: 'Text Diff', description: 'Compare two blocks of text line by line — added lines green, removed lines red.', icon: <GitCompare className="h-5 w-5" />, path: '/text-diff', iconBg: 'from-red-500 to-rose-600' },
  { title: 'Markdown to HTML', description: 'Convert Markdown to HTML with a live split-pane preview — copy or download.', icon: <Code className="h-5 w-5" />, path: '/markdown-to-html', iconBg: 'from-teal-500 to-cyan-600' },
  { title: 'HTML to Markdown', description: 'Paste any HTML and get clean Markdown output using TurndownService.', icon: <FileCode className="h-5 w-5" />, path: '/html-to-markdown', iconBg: 'from-indigo-500 to-indigo-600' },
  { title: 'Text Encoder', description: 'Encode/decode with ROT13, HTML entities, and Morse code — all in one tool.', icon: <Shuffle className="h-5 w-5" />, path: '/text-encoder', iconBg: 'from-orange-500 to-amber-600' },
  { title: 'Number to Words', description: 'Convert any integer up to 999 billion to English words and ordinal form.', icon: <Hash className="h-5 w-5" />, path: '/number-to-words', iconBg: 'from-blue-500 to-sky-600' },
  { title: 'URL Slug', description: 'Convert text to URL-friendly slugs — supports multi-line, dash or underscore.', icon: <LinkIcon className="h-5 w-5" />, path: '/url-slug', iconBg: 'from-violet-500 to-purple-600' },
  { title: 'Sort Lines', description: 'Sort text lines A→Z, Z→A, by length, or shuffle — with case and trim options.', icon: <ArrowUpDown className="h-5 w-5" />, path: '/sort-lines', iconBg: 'from-blue-500 to-sky-600' },
  { title: 'Remove Duplicates', description: 'Strip duplicate lines from any text — case-insensitive and trim options.', icon: <Filter className="h-5 w-5" />, path: '/remove-duplicates', iconBg: 'from-red-500 to-rose-600' },
  { title: 'Find & Replace', description: 'Find and replace text with live match highlighting, regex and whole-word support.', icon: <Replace className="h-5 w-5" />, path: '/find-replace-text', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'Fancy Text', description: 'Generate bold, italic, script, circled and 10+ Unicode text styles instantly.', icon: <Type className="h-5 w-5" />, path: '/fancy-text', iconBg: 'from-purple-500 to-violet-600' },
  { title: 'String Escape', description: 'Escape or unescape strings for JavaScript and Python — handles \\n, \\t, Unicode.', icon: <Code className="h-5 w-5" />, path: '/string-escape', iconBg: 'from-teal-500 to-cyan-600' },
];

const devTools = [
  { title: 'JSON Formatter', description: 'Prettify, minify and validate JSON — copy the result or see error details inline.', icon: <Braces className="h-5 w-5" />, path: '/json-formatter', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'Base64', description: 'Encode or decode text and files to/from Base64 — handles Unicode correctly.', icon: <Hash className="h-5 w-5" />, path: '/base64', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'Hash Generator', description: 'Generate SHA-1, SHA-256, SHA-384, and SHA-512 hashes from any text input.', icon: <Hash className="h-5 w-5" />, path: '/hash-generator', iconBg: 'from-red-500 to-rose-600' },
  { title: 'URL Encoder', description: 'Encode or decode URLs and query strings with percent-encoding instantly.', icon: <LinkIcon className="h-5 w-5" />, path: '/url-encoder', iconBg: 'from-blue-500 to-sky-600' },
  { title: 'JWT Decoder', description: 'Decode any JWT token — view header, payload, expiry status without a secret.', icon: <Key className="h-5 w-5" />, path: '/jwt-decoder', iconBg: 'from-purple-500 to-violet-600' },
  { title: 'Regex Tester', description: 'Test regular expressions live with match highlighting, groups, and flag toggles.', icon: <Search className="h-5 w-5" />, path: '/regex-tester', iconBg: 'from-teal-500 to-cyan-600' },
  { title: 'UUID Generator', description: 'Generate 1–100 cryptographically secure UUIDs — uppercase, hyphen and copy options.', icon: <Fingerprint className="h-5 w-5" />, path: '/uuid-generator', iconBg: 'from-emerald-500 to-green-600' },
  { title: 'Color Converter', description: 'Convert between HEX, RGB and HSL color formats instantly with a live preview.', icon: <Pipette className="h-5 w-5" />, path: '/color-converter', iconBg: 'from-pink-500 to-fuchsia-600' },
  { title: 'Number Base', description: 'Convert numbers between decimal, binary, octal and hexadecimal in real time.', icon: <Binary className="h-5 w-5" />, path: '/number-base-converter', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'Timestamp', description: 'Convert Unix timestamps to human dates or any date to a Unix timestamp.', icon: <Clock className="h-5 w-5" />, path: '/timestamp-converter', iconBg: 'from-teal-500 to-cyan-600' },
  { title: 'Password Generator', description: 'Generate secure passwords with custom length, charset options and a strength meter.', icon: <KeyRound className="h-5 w-5" />, path: '/password-generator', iconBg: 'from-emerald-500 to-green-600' },
  { title: 'JSON to CSV', description: 'Paste a JSON array and download it as a CSV — preview first 5 rows before saving.', icon: <Table2 className="h-5 w-5" />, path: '/json-to-csv', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'CRON Parser', description: 'Explain any cron expression in plain English and show the next 5 run times.', icon: <Clock className="h-5 w-5" />, path: '/cron-parser', iconBg: 'from-emerald-500 to-green-600' },
  { title: 'HTML Entities', description: 'Encode or decode HTML entities — with a reference table of common entities.', icon: <Code2 className="h-5 w-5" />, path: '/html-entities', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'Markdown Table', description: 'Build a visual table and copy the formatted Markdown output instantly.', icon: <Table2 className="h-5 w-5" />, path: '/markdown-table-generator', iconBg: 'from-orange-500 to-amber-600' },
];

const financeTools = [
  { title: 'Loan Calculator', description: 'Calculate monthly EMI, total payment and interest for any loan.', icon: <Landmark className="h-5 w-5" />, path: '/loan-calculator', iconBg: 'from-red-500 to-rose-600' },
  { title: 'Compound Interest', description: 'Calculate compound growth with year-by-year breakdown and effective rate.', icon: <TrendingUp className="h-5 w-5" />, path: '/compound-interest', iconBg: 'from-emerald-500 to-green-600' },
  { title: 'Tip Calculator', description: 'Calculate tip and split the bill between any number of people.', icon: <Percent className="h-5 w-5" />, path: '/tip-calculator', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'Discount Calculator', description: '3 modes: final price, discount %, or original price — all with savings shown.', icon: <Tag className="h-5 w-5" />, path: '/discount-calculator', iconBg: 'from-purple-500 to-violet-600' },
];

const dateTools = [
  { title: 'Age Calculator', description: 'Calculate exact age in years/months/days, total days lived and next birthday.', icon: <Calendar className="h-5 w-5" />, path: '/age-calculator', iconBg: 'from-blue-500 to-sky-600' },
  { title: 'Date Difference', description: 'Find the difference between two dates in years, months, days, weeks and hours.', icon: <CalendarDays className="h-5 w-5" />, path: '/date-difference', iconBg: 'from-teal-500 to-cyan-600' },
  { title: 'Timezone Converter', description: 'Convert any time across 12+ time zones simultaneously using the Intl API.', icon: <Globe className="h-5 w-5" />, path: '/timezone-converter', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'Work Days Calculator', description: 'Count working days between two dates — excluding weekends and custom holidays.', icon: <Briefcase className="h-5 w-5" />, path: '/work-days-calculator', iconBg: 'from-orange-500 to-amber-600' },
];

const cssTools = [
  { title: 'Gradient Generator', description: 'Build linear and radial CSS gradients with live preview and instant copy.', icon: <Paintbrush className="h-5 w-5" />, path: '/gradient-generator', iconBg: 'from-purple-500 to-pink-600' },
  { title: 'Box Shadow', description: 'Design multi-layer box shadows visually — copy the ready-to-use CSS instantly.', icon: <Square className="h-5 w-5" />, path: '/box-shadow-generator', iconBg: 'from-indigo-500 to-violet-600' },
  { title: 'CSS Formatter', description: 'Prettify CSS with consistent indentation or minify it for production in one click.', icon: <Code2 className="h-5 w-5" />, path: '/css-formatter', iconBg: 'from-teal-500 to-cyan-600' },
];

const calcTools = [
  { title: 'Percentage Calc', description: 'Four calculation modes — find X% of Y, percentage change, and more.', icon: <Percent className="h-5 w-5" />, path: '/percentage-calculator', iconBg: 'from-amber-500 to-yellow-600' },
  { title: 'Unit Converter', description: 'Convert length, weight, temperature, area, volume and speed between common units.', icon: <Ruler className="h-5 w-5" />, path: '/unit-converter', iconBg: 'from-blue-500 to-sky-600' },
  { title: 'BMI Calculator', description: 'Calculate BMI in metric or imperial — shows category, visual scale and ideal weight.', icon: <Activity className="h-5 w-5" />, path: '/bmi-calculator', iconBg: 'from-emerald-500 to-green-600' },
];

interface GroupProps {
  label: string;
  sublabel: string;
  accentClass: string;
  dotClass: string;
  tools: { title: string; description: string; icon: React.ReactNode; path: string; iconBg: string; badge?: string }[];
}

const ToolGroup: React.FC<GroupProps> = ({ label, sublabel, accentClass, dotClass, tools }) => (
  <div>
    <div className="flex items-center gap-3 mb-6">
      <span className={`w-2 h-2 rounded-full ${dotClass}`} />
      <h3 className="text-sm font-semibold text-white/70">{label}</h3>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${accentClass}`}>
        {tools.length} tools
      </span>
      <div className="flex-1 h-px bg-white/[0.05]" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {tools.map((tool) => (
        <FeatureCard
          key={tool.path}
          title={tool.title}
          description={tool.description}
          icon={tool.icon}
          path={tool.path}
          gradient=""
          iconBg={tool.iconBg}
          badge={tool.badge}
        />
      ))}
    </div>

    <p className="text-xs text-white/20 mt-4">{sublabel}</p>
  </div>
);

const Divider: React.FC<{ label: string }> = ({ label }) => (
  <div className="relative flex items-center gap-4">
    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03]" />
    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/20 shrink-0">{label}</span>
    <div className="flex-1 h-px bg-gradient-to-r from-white/[0.03] via-white/[0.08] to-white/[0.03]" />
  </div>
);

const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="py-10 relative">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-4">Tools</p>
          <h2 className="text-3xl md:text-5xl font-extrabold gradient-text leading-tight mb-4">
            Everything for your documents
          </h2>
          <p className="text-white/40 max-w-md mx-auto text-base">
            94 professional tools — PDF, Word, Excel, Image, Text, Dev, Finance &amp; more, all free, all private
          </p>
        </div>

        <div className="space-y-16 max-w-7xl mx-auto">
          <ToolGroup label="PDF Tools" sublabel="Convert, organise, edit and optimise any PDF file" accentClass="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" dotClass="bg-indigo-500" tools={pdfTools} />
          <Divider label="Word / DOCX" />
          <ToolGroup label="Word / DOCX Tools" sublabel="Extract, convert, merge and edit Microsoft Word documents" accentClass="bg-blue-500/10 text-blue-400 border border-blue-500/20" dotClass="bg-blue-500" tools={wordTools} />
          <Divider label="Image" />
          <ToolGroup label="Image Tools" sublabel="Convert formats, remove backgrounds, compress, upscale, crop and create GIFs" accentClass="bg-pink-500/10 text-pink-400 border border-pink-500/20" dotClass="bg-pink-500" tools={imageTools} />
          <Divider label="Excel / CSV" />
          <ToolGroup label="Excel / CSV Tools" sublabel="Convert, export, merge and diff spreadsheet files in seconds" accentClass="bg-green-500/10 text-green-400 border border-green-500/20" dotClass="bg-green-500" tools={excelTools} />
          <Divider label="Text Tools" />
          <ToolGroup label="Text Tools" sublabel="Transform, compare and convert plain text — no file upload needed" accentClass="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" dotClass="bg-yellow-500" tools={textTools} />
          <Divider label="Developer Utilities" />
          <ToolGroup label="Developer Utilities" sublabel="JSON, Base64, hashing, JWT, regex and more — all in your browser" accentClass="bg-violet-500/10 text-violet-400 border border-violet-500/20" dotClass="bg-violet-500" tools={devTools} />
          <Divider label="Finance" />
          <ToolGroup label="Finance" sublabel="Loan, compound interest, tip and discount calculators" accentClass="bg-red-500/10 text-red-400 border border-red-500/20" dotClass="bg-red-500" tools={financeTools} />
          <Divider label="Date & Time" />
          <ToolGroup label="Date & Time" sublabel="Age, differences, timezones and working days" accentClass="bg-sky-500/10 text-sky-400 border border-sky-500/20" dotClass="bg-sky-500" tools={dateTools} />
          <Divider label="CSS Tools" />
          <ToolGroup label="CSS Tools" sublabel="Visual CSS builders and formatters — copy ready-to-use code" accentClass="bg-purple-500/10 text-purple-400 border border-purple-500/20" dotClass="bg-purple-500" tools={cssTools} />
          <Divider label="Calculators" />
          <ToolGroup label="Calculators" sublabel="Quick math and unit calculations in your browser" accentClass="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" dotClass="bg-emerald-500" tools={calcTools} />
          <Divider label="Utilities" />
          <ToolGroup label="Utility Tools" sublabel="Handy generators for everyday tasks" accentClass="bg-amber-500/10 text-amber-400 border border-amber-500/20" dotClass="bg-amber-500" tools={[{ title: 'QR Generator', description: 'Generate a QR code from any URL or text. Customize colors and download PNG or SVG.', icon: <QrCode className="h-5 w-5" />, path: '/qr-generator', iconBg: 'from-yellow-500 to-amber-500' }]} />
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
