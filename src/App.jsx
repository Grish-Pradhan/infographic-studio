import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileImage,
  FileText,
  FileType,
  Sparkles,
  Wand2,
  PieChart as PieChartIcon,
  BarChart3,
  Milestone,
  LayoutGrid,
  CheckCircle2,
  Palette,
  RefreshCcw,
  ChevronDown,
  Zap,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import { toPng, toJpeg } from "html-to-image";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";
import {
  Document,
  Packer,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
} from "docx";

// ─── Palettes ──────────────────────────────────────────────────────────────

const palettes = {
  midnight: {
    name: "Midnight Luxe",
    gradient: "from-slate-950 via-slate-900 to-indigo-950",
    accent: "#8b5cf6",
    accent2: "#22c55e",
    accent3: "#f59e0b",
    accent4: "#06b6d4",
    surface: "bg-white/8",
    border: "border-white/10",
    text: "text-white",
    subtext: "text-slate-300",
    cardBg: "bg-black/20",
    pie: ["#8b5cf6", "#22c55e", "#06b6d4", "#f59e0b", "#f43f5e", "#a3e635"],
  },
  pearl: {
    name: "Pearl Executive",
    gradient: "from-zinc-50 via-white to-slate-100",
    accent: "#2563eb",
    accent2: "#7c3aed",
    accent3: "#f59e0b",
    accent4: "#10b981",
    surface: "bg-white",
    border: "border-slate-200",
    text: "text-slate-900",
    subtext: "text-slate-600",
    cardBg: "bg-slate-50",
    pie: ["#2563eb", "#7c3aed", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"],
  },
  obsidian: {
    name: "Obsidian Neon",
    gradient: "from-black via-zinc-950 to-slate-950",
    accent: "#14b8a6",
    accent2: "#f97316",
    accent3: "#eab308",
    accent4: "#a855f7",
    surface: "bg-white/6",
    border: "border-white/10",
    text: "text-white",
    subtext: "text-zinc-300",
    cardBg: "bg-black/25",
    pie: ["#14b8a6", "#f97316", "#a855f7", "#eab308", "#3b82f6", "#ec4899"],
  },
  aurora: {
    name: "Aurora Drift",
    gradient: "from-emerald-950 via-teal-900 to-cyan-950",
    accent: "#34d399",
    accent2: "#818cf8",
    accent3: "#fb923c",
    accent4: "#f472b6",
    surface: "bg-white/8",
    border: "border-white/10",
    text: "text-white",
    subtext: "text-emerald-200",
    cardBg: "bg-black/20",
    pie: ["#34d399", "#818cf8", "#f472b6", "#fb923c", "#38bdf8", "#a3e635"],
  },
};

// ─── Starter Text ──────────────────────────────────────────────────────────

const starterText = `Vision: Launch a premium analytics consulting studio for modern startups.

Goals:
- Reach $500k ARR in 12 months
- Acquire 30 retained clients
- Keep churn below 5%
- Build authority with 2 flagship reports and weekly thought leadership

Timeline:
Jan 2026 - Brand positioning and website launch
Mar 2026 - Publish first industry report
Jun 2026 - Reach 10 clients and hire a strategist
Sep 2026 - Launch workshop series
Dec 2026 - Reach $500k ARR

Breakdown:
Services 45%
Advisory 25%
Workshops 15%
Templates 10%
Other 5%

KPIs:
Leads: 120
Conversion Rate: 18
Avg Deal Size: 14000
NPS: 72
Content Pieces: 52`;

// ─── Parser ────────────────────────────────────────────────────────────────

function parseThoughts(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  const titleLine =
    lines.find((line) => /vision:|project:|title:|theme:/i.test(line)) ||
    lines[0] ||
    "Strategic Narrative";

  const title = titleLine.replace(/^(vision|project|title|theme)\s*:\s*/i, "").trim();

  const timeline = [];
  const metrics = [];
  const pieData = [];
  const bars = [];
  const highlights = [];
  const checklist = [];

  const monthDateRegex = /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{4}\b/i;
  const fullDateRegex = /\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/;
  const metricRegex = /^([A-Za-z][A-Za-z0-9\s/&%-]{1,40})\s*:\s*(-?\d+(?:\.\d+)?)(%?)$/;
  const percentRegex = /^([A-Za-z][A-Za-z0-9\s/&-]{1,40})\s+(\d+(?:\.\d+)?)%$/;
  const bulletRegex = /^[-•]\s+(.*)$/;

  for (const line of lines) {
    if (/^(timeline|goals|breakdown|kpis|metrics|services)\s*:/i.test(line)) continue;

    const bullet = line.match(bulletRegex);
    if (bullet) {
      const content = bullet[1].trim();
      if (/(reach|launch|build|keep|publish|hire|improve|reduce|grow|create)/i.test(content)) {
        checklist.push(content);
      } else {
        highlights.push(content);
      }
      continue;
    }

    if (monthDateRegex.test(line) || fullDateRegex.test(line)) {
      const [date, ...rest] = line.split(/\s*-\s*/);
      timeline.push({ date: date.trim(), label: rest.join(" - ").trim() || line.trim() });
      continue;
    }

    const percentMatch = line.match(percentRegex);
    if (percentMatch) {
      const label = percentMatch[1].trim();
      const value = Number(percentMatch[2]);
      pieData.push({ name: label, value });
      bars.push({ name: label, value });
      continue;
    }

    const metricMatch = line.match(metricRegex);
    if (metricMatch) {
      const label = metricMatch[1].trim();
      const value = Number(metricMatch[2]);
      const suffix = metricMatch[3] || "";
      metrics.push({ label, value, suffix });
      if (suffix === "%") {
        pieData.push({ name: label, value });
      } else {
        bars.push({ name: label, value });
      }
      continue;
    }

    if (!/^(vision|project|title|theme)\s*:/i.test(line)) {
      highlights.push(line);
    }
  }

  if (metrics.length === 0) {
    metrics.push(
      { label: "Clarity", value: 92, suffix: "" },
      { label: "Focus", value: 84, suffix: "" },
      { label: "Momentum", value: 76, suffix: "" },
      { label: "Priority", value: 68, suffix: "" }
    );
  }

  const normalizedPie = pieData.length
    ? pieData
    : [
        { name: "Core Focus", value: 40 },
        { name: "Growth", value: 25 },
        { name: "Execution", value: 20 },
        { name: "Innovation", value: 15 },
      ];

  const normalizedBars = bars.length
    ? bars.slice(0, 8)
    : metrics.slice(0, 6).map((m) => ({ name: m.label, value: m.value }));

  const summary =
    highlights[0] ||
    "A premium visual strategy board generated from your raw thoughts, ready for presentation and export.";

  return {
    title,
    summary,
    highlights: highlights.slice(0, 6),
    timeline: timeline.slice(0, 6),
    metrics: metrics.slice(0, 6),
    pieData: normalizedPie.slice(0, 6),
    barData: normalizedBars.slice(0, 8),
    checklist: checklist.slice(0, 6),
  };
}

// ─── Utilities ─────────────────────────────────────────────────────────────

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// ─── Sub-components ────────────────────────────────────────────────────────

function MetricCard({ item, palette, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={cn(
        "rounded-3xl border p-5 shadow-[0_10px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl",
        palette.surface,
        palette.border
      )}
    >
      <div className={cn("text-xs font-medium uppercase tracking-widest", palette.subtext)}>
        {item.label}
      </div>
      <div
        className={cn("mt-2 text-3xl font-semibold tracking-tight", palette.text)}
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        {item.value.toLocaleString()}
        {item.suffix}
      </div>
      <div
        className="mt-3 h-1 rounded-full opacity-60"
        style={{
          background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent2})`,
          width: `${Math.min(100, (item.value / (item.value * 1.3)) * 100)}%`,
        }}
      />
    </motion.div>
  );
}

function ExportButton({ onClick, icon: Icon, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white transition-all hover:scale-[1.03] hover:bg-white/18 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ToggleButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-2xl border px-3 py-3 text-sm font-medium transition-all",
        active
          ? "border-white/30 bg-white/15 text-white shadow-inner"
          : "border-white/8 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-slate-200"
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

// ─── Landing Hero ──────────────────────────────────────────────────────────

function LandingHero({ onStart }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 px-6">
      {/* Decorative orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #22c55e 0%, transparent 70%)" }}
        />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 text-center max-w-4xl"
      >
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-slate-300 backdrop-blur-xl">
          <Zap className="h-4 w-4 text-yellow-400" />
          Instant infographics from raw notes
        </div>

        <h1
          className="text-5xl sm:text-7xl font-bold tracking-tight text-white leading-[1.05]"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Transform your
          <br />
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: "linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #22c55e 100%)" }}
          >
            thoughts
          </span>{" "}
          into visuals.
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Paste any raw notes — goals, timelines, KPIs, ideas — and watch them become
          executive-ready infographic boards. Export as PNG, JPEG, PDF, or Word.
        </p>

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            onClick={onStart}
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 text-base font-semibold text-white shadow-2xl transition-all"
            style={{ background: "linear-gradient(135deg, #8b5cf6, #06b6d4)" }}
          >
            <Sparkles className="h-5 w-5" />
            Open Studio
          </motion.button>
        </div>

        <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm text-slate-500">
          {["4 export formats", "4 visual themes", "Live preview", "No signup required"].map((f) => (
            <span key={f} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500" />
              {f}
            </span>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 flex flex-col items-center gap-2 text-slate-500 text-xs"
      >
        <span>Scroll to explore</span>
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </motion.div>
    </div>
  );
}

// ─── Main Studio ───────────────────────────────────────────────────────────

function Studio() {
  const [thoughts, setThoughts] = useState(starterText);
  const [paletteKey, setPaletteKey] = useState("midnight");
  const [showTimeline, setShowTimeline] = useState(true);
  const [showPie, setShowPie] = useState(true);
  const [showBars, setShowBars] = useState(true);
  const [showChecklist, setShowChecklist] = useState(true);
  const [showHighlights, setShowHighlights] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const boardRef = useRef(null);

  const palette = palettes[paletteKey];
  const data = useMemo(() => parseThoughts(thoughts), [thoughts]);

  const safeName = data.title.replace(/\s+/g, "-").toLowerCase();

  const exportPNG = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    try {
      const url = await toPng(boardRef.current, { cacheBust: true, pixelRatio: 2.5 });
      saveAs(url, `${safeName}-board.png`);
    } finally { setIsExporting(false); }
  };

  const exportJPEG = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    try {
      const url = await toJpeg(boardRef.current, { cacheBust: true, quality: 0.96, pixelRatio: 2.2 });
      saveAs(url, `${safeName}-board.jpeg`);
    } finally { setIsExporting(false); }
  };

  const exportPDF = async () => {
    if (!boardRef.current) return;
    setIsExporting(true);
    try {
      const url = await toPng(boardRef.current, { cacheBust: true, pixelRatio: 2.3 });
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: "a4" });
      const imgProps = pdf.getImageProperties(url);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(url, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${safeName}-board.pdf`);
    } finally { setIsExporting(false); }
  };

  const exportWord = async () => {
    setIsExporting(true);
    try {
      const table = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({ children: [new Paragraph("Metric")] }),
              new TableCell({ children: [new Paragraph("Value")] }),
            ],
          }),
          ...data.metrics.map(
            (m) =>
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph(m.label)] }),
                  new TableCell({ children: [new Paragraph(`${m.value}${m.suffix}`)] }),
                ],
              })
          ),
        ],
      });

      const doc = new Document({
        sections: [{
          children: [
            new Paragraph({ text: data.title, heading: HeadingLevel.TITLE }),
            new Paragraph({ children: [new TextRun({ text: data.summary, italics: true })] }),
            new Paragraph({ text: "Key Highlights", heading: HeadingLevel.HEADING_1 }),
            ...data.highlights.map((h) => new Paragraph({ text: h, bullet: { level: 0 } })),
            new Paragraph({ text: "Metrics", heading: HeadingLevel.HEADING_1 }),
            table,
            new Paragraph({ text: "Timeline", heading: HeadingLevel.HEADING_1 }),
            ...data.timeline.map(
              (t) =>
                new Paragraph({
                  children: [
                    new TextRun({ text: `${t.date}: `, bold: true }),
                    new TextRun(t.label),
                  ],
                })
            ),
            new Paragraph({ text: "Action Checklist", heading: HeadingLevel.HEADING_1 }),
            ...data.checklist.map((c) => new Paragraph({ text: c, bullet: { level: 0 } })),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${safeName}-board.docx`);
    } finally { setIsExporting(false); }
  };

  return (
    <div className={cn("min-h-screen w-full bg-gradient-to-br", palette.gradient)}>
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="rounded-[28px] border border-white/10 bg-white/8 p-6 shadow-2xl backdrop-blur-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1
                  className="text-2xl font-bold tracking-tight text-white sm:text-3xl"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Infographic Studio
                </h1>
                <p className="mt-1 text-sm text-slate-300">
                  Paste your raw thoughts → get a premium visual board in seconds.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-3">
              <Palette className="h-4 w-4" /> Visual Theme
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(palettes).map(([key, value]) => (
                <button
                  key={key}
                  onClick={() => setPaletteKey(key)}
                  className={cn(
                    "rounded-2xl border px-3 py-2.5 text-left text-sm transition-all",
                    key === paletteKey
                      ? "border-white/40 bg-white/15 text-white shadow-inner"
                      : "border-white/8 bg-white/4 text-slate-400 hover:bg-white/10 hover:text-white"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: value.accent }} />
                    <span className="font-medium">{value.name}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Main layout */}
        <div className="grid gap-6 xl:grid-cols-[400px_minmax(0,1fr)]">

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            className="rounded-[28px] border border-white/10 bg-white/8 p-5 shadow-2xl backdrop-blur-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Wand2 className="h-5 w-5" />
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Your Input
                </h2>
              </div>
              <button
                onClick={() => setThoughts(starterText)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/8 px-3 py-1.5 text-xs text-slate-300 hover:bg-white/15 transition-all"
              >
                <RefreshCcw className="h-3 w-3" /> Reset demo
              </button>
            </div>

            <textarea
              value={thoughts}
              onChange={(e) => setThoughts(e.target.value)}
              className="h-[320px] w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white placeholder:text-slate-500"
              placeholder="Paste your goals, timelines, KPIs, percentages, or any notes..."
            />

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                [showTimeline, setShowTimeline, "Timeline", Milestone],
                [showPie, setShowPie, "Pie Chart", PieChartIcon],
                [showBars, setShowBars, "Bar Chart", BarChart3],
                [showHighlights, setShowHighlights, "Highlights", LayoutGrid],
                [showChecklist, setShowChecklist, "Checklist", CheckCircle2],
              ].map(([value, setter, label, Icon]) => (
                <ToggleButton
                  key={label}
                  active={value}
                  onClick={() => setter(!value)}
                  icon={Icon}
                  label={label}
                />
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/8 bg-black/15 p-4 text-xs leading-5 text-slate-400">
              <strong className="text-slate-300">Pro tips:</strong> Add dates like "Jan 2026 – Launch", percentages like "Services 45%", or KPIs like "Leads: 120" for richer boards.
            </div>
          </motion.div>

          {/* Board area */}
          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="space-y-4"
          >
            {/* Export bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[28px] border border-white/10 bg-white/8 p-4 shadow-xl backdrop-blur-2xl">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-400">Export Suite</div>
                <div className="mt-0.5 text-sm text-slate-300">Client-ready formats, 2.5× resolution.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <ExportButton onClick={exportPNG} icon={FileImage} label="PNG" disabled={isExporting} />
                <ExportButton onClick={exportJPEG} icon={FileImage} label="JPEG" disabled={isExporting} />
                <ExportButton onClick={exportPDF} icon={FileType} label="PDF" disabled={isExporting} />
                <ExportButton onClick={exportWord} icon={FileText} label="Word" disabled={isExporting} />
              </div>
            </div>

            {/* The visual board */}
            <div
              ref={boardRef}
              className={cn(
                "overflow-hidden rounded-[34px] border p-5 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-7",
                palette.surface,
                palette.border
              )}
            >
              {/* Board header */}
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <div className={cn("text-xs uppercase tracking-[0.3em] mb-2", palette.subtext)}>
                    Premium Visual Board
                  </div>
                  <h2
                    className={cn("max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl", palette.text)}
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    {data.title}
                  </h2>
                  <p className={cn("mt-3 max-w-3xl text-sm leading-6 sm:text-base", palette.subtext)}>
                    {data.summary}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3 text-right shrink-0">
                  <div className="text-xs uppercase tracking-widest text-slate-400">Status</div>
                  <div className="mt-1 text-sm font-medium text-white">Executive-ready</div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {data.metrics.map((item, i) => (
                  <MetricCard key={item.label} item={item} palette={palette} index={i} />
                ))}
              </div>

              {/* Charts + Highlights */}
              <div className="mt-5 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                {(showHighlights || showChecklist) && (
                  <div className="grid gap-4">
                    {showHighlights && data.highlights.length > 0 && (
                      <div className={cn("rounded-[28px] border p-5", palette.surface, palette.border)}>
                        <div className="mb-4 flex items-center gap-2">
                          <LayoutGrid className="h-4 w-4 text-white" />
                          <h3 className={cn("text-base font-semibold", palette.text)} style={{ fontFamily: "'Syne', sans-serif" }}>
                            Narrative Highlights
                          </h3>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2">
                          {data.highlights.map((item, index) => (
                            <div key={index} className={cn("rounded-2xl border border-white/8 p-4", palette.cardBg)}>
                              <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">
                                Insight {index + 1}
                              </div>
                              <p className={cn("text-sm leading-5", palette.text)}>{item}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {showChecklist && (
                      <div className={cn("rounded-[28px] border p-5", palette.surface, palette.border)}>
                        <div className="mb-4 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-white" />
                          <h3 className={cn("text-base font-semibold", palette.text)} style={{ fontFamily: "'Syne', sans-serif" }}>
                            Strategic Actions
                          </h3>
                        </div>
                        <div className="grid gap-2">
                          {data.checklist.length ? (
                            data.checklist.map((item, index) => (
                              <div key={index} className={cn("flex items-start gap-3 rounded-2xl border border-white/8 p-3.5", palette.cardBg)}>
                                <div
                                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                                  style={{ background: `linear-gradient(135deg, ${palette.accent}, ${palette.accent2})` }}
                                >
                                  {index + 1}
                                </div>
                                <p className={cn("text-sm leading-5", palette.text)}>{item}</p>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-slate-400">
                              Add bullet-point actions (starting with verbs like "reach", "build", "launch") to generate this list.
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid gap-4">
                  {showPie && (
                    <div className={cn("rounded-[28px] border p-5", palette.surface, palette.border)}>
                      <div className="mb-3 flex items-center gap-2">
                        <PieChartIcon className="h-4 w-4 text-white" />
                        <h3 className={cn("text-base font-semibold", palette.text)} style={{ fontFamily: "'Syne', sans-serif" }}>
                          Composition
                        </h3>
                      </div>
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data.pieData}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={95}
                              paddingAngle={4}
                            >
                              {data.pieData.map((entry, index) => (
                                <Cell key={entry.name} fill={palette.pie[index % palette.pie.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                background: "rgba(15,15,30,0.9)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "12px",
                              }}
                            />
                            <Legend wrapperStyle={{ fontSize: "12px" }} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {showBars && (
                    <div className={cn("rounded-[28px] border p-5", palette.surface, palette.border)}>
                      <div className="mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-white" />
                        <h3 className={cn("text-base font-semibold", palette.text)} style={{ fontFamily: "'Syne', sans-serif" }}>
                          Performance
                        </h3>
                      </div>
                      <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data.barData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                            <XAxis
                              dataKey="name"
                              tick={{ fill: "#94a3b8", fontSize: 11 }}
                              angle={-12}
                              textAnchor="end"
                              height={55}
                            />
                            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} />
                            <Tooltip
                              contentStyle={{
                                background: "rgba(15,15,30,0.9)",
                                border: "1px solid rgba(255,255,255,0.1)",
                                borderRadius: "12px",
                                color: "#fff",
                                fontSize: "12px",
                              }}
                            />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill={palette.accent} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              {showTimeline && (
                <div className={cn("mt-5 rounded-[28px] border p-5", palette.surface, palette.border)}>
                  <div className="mb-4 flex items-center gap-2">
                    <Milestone className="h-4 w-4 text-white" />
                    <h3 className={cn("text-base font-semibold", palette.text)} style={{ fontFamily: "'Syne', sans-serif" }}>
                      Timeline
                    </h3>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                    {data.timeline.length ? (
                      data.timeline.map((item, index) => (
                        <div key={index} className={cn("relative overflow-hidden rounded-2xl border border-white/8 p-4", palette.cardBg)}>
                          <div
                            className="absolute inset-x-0 top-0 h-[3px]"
                            style={{ background: `linear-gradient(90deg, ${palette.accent}, ${palette.accent2})` }}
                          />
                          <div className="text-xs uppercase tracking-widest text-slate-400 mb-2">{item.date}</div>
                          <p className={cn("text-sm leading-5", palette.text)}>{item.label}</p>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-5 text-sm text-slate-400">
                        Add dates like "Jan 2026 – Launch beta" to generate a timeline.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4">
                <div className="text-xs text-slate-500">Generated by Infographic Studio</div>
                <div className="text-xs text-slate-500">{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long" })}</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// ─── Root App ──────────────────────────────────────────────────────────────

export default function App() {
  const [showStudio, setShowStudio] = useState(false);

  return (
    <AnimatePresence mode="wait">
      {!showStudio ? (
        <motion.div
          key="landing"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <LandingHero onStart={() => setShowStudio(true)} />
        </motion.div>
      ) : (
        <motion.div
          key="studio"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Studio />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
