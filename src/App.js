import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiCheck,
  FiCopy,
  FiDownload,
  FiImage,
  FiMoon,
  FiSearch,
  FiShare2,
  FiSun,
  FiTrash2,
} from "react-icons/fi";

const QR_TYPES = ["url", "text", "email", "wifi", "contact"];

const defaultForm = {
  type: "url",
  value: "",
  emailSubject: "",
  emailBody: "",
  wifiSsid: "",
  wifiPassword: "",
  wifiSecurity: "WPA",
  contactName: "",
  contactPhone: "",
  contactEmail: "",
};

function buildQrPayload(form) {
  switch (form.type) {
    case "email":
      return `mailto:${form.value}?subject=${encodeURIComponent(form.emailSubject)}&body=${encodeURIComponent(form.emailBody)}`;
    case "wifi":
      return `WIFI:T:${form.wifiSecurity};S:${form.wifiSsid};P:${form.wifiPassword};;`;
    case "contact":
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${form.contactName}\nTEL:${form.contactPhone}\nEMAIL:${form.contactEmail}\nEND:VCARD`;
    case "text":
      return form.value || "Hello from your premium QR generator";
    case "url":
    default:
      return form.value || "https://example.com";
  }
}

function Toast({ message, onClose }) {
  useEffect(() => {
    const id = setTimeout(onClose, 2200);
    return () => clearTimeout(id);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white shadow-xl dark:bg-slate-100 dark:text-slate-900"
    >
      {message}
    </motion.div>
  );
}

function Header({ isDark, setIsDark }) {
  return (
    <header className="sticky top-0 z-40 mb-8 rounded-2xl border border-slate-200/70 bg-white/90 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <FiImage />
          </div>
          <div>
            <h1 className="text-lg font-bold">QR Studio</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-xl border border-slate-300 p-2 hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
            onClick={() => setIsDark(!isDark)}
            type="button"
            aria-label="Toggle dark mode"
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function App() {
  const canvasRef = useRef(null);
  const svgRef = useRef(null);
  const [isDark, setIsDark] = useState(
    () => localStorage.getItem("theme") === "dark",
  );
  const [form, setForm] = useState(defaultForm);
  const [fgColor, setFgColor] = useState("#111827");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(260);
  const [errorLevel, setErrorLevel] = useState("H");
  const [logoData, setLogoData] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("qr-history") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem("qr-history", JSON.stringify(history.slice(0, 25)));
  }, [history]);

  const qrValue = useMemo(() => buildQrPayload(form), [form]);

  const filteredHistory = useMemo(
    () =>
      history.filter((item) =>
        item.label.toLowerCase().includes(historyQuery.toLowerCase()),
      ),
    [history, historyQuery],
  );

  const showToast = (msg) => setToast(msg);

  const updateForm = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onLogoSelect = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogoData(reader.result?.toString() || "");
    reader.readAsDataURL(file);
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const label =
        form.value || form.contactName || form.wifiSsid || "Untitled QR";
      setHistory((prev) =>
        [
          { id: Date.now(), label, type: form.type, payload: qrValue },
          ...prev,
        ].slice(0, 25),
      );
      showToast("QR code generated successfully");
    }, 500);
  };

  const downloadPng = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qr-code.png";
    a.click();
    showToast("PNG downloaded");
  };

  const downloadSvg = () => {
    const svg = svgRef.current?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "qr-code.svg";
    a.click();
    URL.revokeObjectURL(url);
    showToast("SVG downloaded");
  };

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(qrValue);
      showToast("QR content copied");
    } catch {
      showToast("Copy failed");
    }
  };

  const shareValue = async () => {
    if (navigator.share) {
      await navigator.share({ title: "My QR Code", text: qrValue });
      showToast("Shared");
      return;
    }
    copyValue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 px-4 pb-16 pt-4 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
      <Header isDark={isDark} setIsDark={setIsDark} />

      <main
        id="generator"
        className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1.3fr_1fr]"
      >
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-premium dark:border-slate-700 dark:bg-slate-900">
          <h3 className="text-xl font-semibold">Generator</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">QR Type</label>
              <select
                className="w-full rounded-xl border border-slate-300 bg-white p-3 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                value={form.type}
                onChange={(e) => updateForm("type", e.target.value)}
              >
                {QR_TYPES.map((type) => (
                  <option
                    key={type}
                    value={type}
                    className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium">
                {form.type === "url" ? "Website URL" : "Primary content"}
              </label>
              <input
                className="w-full rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                value={form.value}
                onChange={(e) => updateForm("value", e.target.value)}
                placeholder="Enter value..."
              />
            </div>

            {form.type === "email" && (
              <>
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Subject"
                  value={form.emailSubject}
                  onChange={(e) => updateForm("emailSubject", e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Email body"
                  value={form.emailBody}
                  onChange={(e) => updateForm("emailBody", e.target.value)}
                />
              </>
            )}

            {form.type === "wifi" && (
              <>
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="WiFi name (SSID)"
                  value={form.wifiSsid}
                  onChange={(e) => updateForm("wifiSsid", e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Password"
                  value={form.wifiPassword}
                  onChange={(e) => updateForm("wifiPassword", e.target.value)}
                />
              </>
            )}

            {form.type === "contact" && (
              <>
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Full name"
                  value={form.contactName}
                  onChange={(e) => updateForm("contactName", e.target.value)}
                />
                <input
                  className="rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Phone number"
                  value={form.contactPhone}
                  onChange={(e) => updateForm("contactPhone", e.target.value)}
                />
                <input
                  className="md:col-span-2 rounded-xl border border-slate-300 bg-transparent p-3 dark:border-slate-600"
                  placeholder="Email"
                  value={form.contactEmail}
                  onChange={(e) => updateForm("contactEmail", e.target.value)}
                />
              </>
            )}
          </div>

          <div
            id="customize"
            className="mt-6 rounded-2xl border border-slate-200 p-4 dark:border-slate-700"
          >
            <h4 className="font-semibold">Customization</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm">Foreground</label>
                <input
                  type="color"
                  className="h-11 w-full rounded-lg border border-slate-300 dark:border-slate-600"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Background</label>
                <input
                  type="color"
                  className="h-11 w-full rounded-lg border border-slate-300 dark:border-slate-600"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium">QR Size</label>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-semibold text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                    {qrSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="160"
                  max="400"
                  value={qrSize}
                  onChange={(e) => setQrSize(Number(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-brand-600 dark:bg-slate-700 dark:accent-brand-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm">Error correction</label>
                <select
                  value={errorLevel}
                  onChange={(e) => setErrorLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option
                    value="L"
                    className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  >
                    Low
                  </option>
                  <option
                    value="M"
                    className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  >
                    Medium
                  </option>
                  <option
                    value="Q"
                    className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  >
                    Quartile
                  </option>
                  <option
                    value="H"
                    className="bg-white text-slate-900 dark:bg-slate-800 dark:text-slate-100"
                  >
                    High
                  </option>
                </select>
              </div>
            </div>

            <label
              className={`mt-4 block cursor-pointer rounded-xl border-2 border-dashed p-4 text-center text-sm transition ${isDragging ? "border-brand-500 bg-brand-50 dark:bg-slate-800" : "border-slate-300 dark:border-slate-600"}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                onLogoSelect(e.dataTransfer.files?.[0]);
              }}
            >
              Drag & drop logo here or click to upload
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => onLogoSelect(e.target.files?.[0])}
              />
            </label>
          </div>

          <button
            type="button"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-600 px-4 py-4 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-70"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </button>
        </section>

        <section className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-premium dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="mb-3 text-lg font-semibold text-center">Preview</h3>
            <div className="flex items-center justify-center">
              <div
                className="rounded-2xl bg-slate-100 p-4 text-center items-center justify-center dark:bg-slate-800"
                ref={canvasRef}
              >
                <QRCode
                  value={qrValue}
                  size={qrSize}
                  bgColor={bgColor}
                  fgColor={fgColor}
                  level={errorLevel}
                  includeMargin
                  imageSettings={
                    logoData
                      ? { src: logoData, height: 82, width: 82, excavate: true }
                      : undefined
                  }
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={downloadPng}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <FiDownload /> PNG
              </button>
              <button
                type="button"
                onClick={downloadSvg}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <FiDownload /> SVG
              </button>
              <button
                type="button"
                onClick={copyValue}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <FiCopy /> Copy
              </button>
              <button
                type="button"
                onClick={shareValue}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <FiShare2 /> Share
              </button>
            </div>
          </motion.div>

          <section
            id="history"
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-premium dark:border-slate-700 dark:bg-slate-900"
          >
            <h3 className="text-lg font-semibold">Saved history</h3>
            <div className="mt-3 flex items-center gap-2 rounded-xl border border-slate-300 px-3 dark:border-slate-600">
              <FiSearch className="text-slate-500" />
              <input
                className="w-full bg-transparent py-2.5 outline-none"
                placeholder="Search previous codes..."
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
              />
            </div>
            <div className="mt-4">
              <button
                type="button"
                onClick={() => setHistory([])}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-100 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                <FiTrash2 /> Clear history
              </button>
            </div>

            <div className="mt-4 space-y-2">
              {filteredHistory.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500 dark:border-slate-600 dark:text-slate-300">
                  Empty state: your generated QR codes will appear here.
                </div>
              )}
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.label}</p>
                    <p className="text-xs uppercase text-slate-500">
                      {item.type}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setForm((prev) => ({
                          ...prev,
                          type: item.type,
                          value: item.payload,
                        }));
                        showToast("Reused from history");
                      }}
                      className="rounded-lg px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <FiCheck />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setHistory((prev) =>
                          prev.filter((x) => x.id !== item.id),
                        )
                      }
                      className="rounded-lg px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>

      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast("")} />}
      </AnimatePresence>
    </div>
  );
}
