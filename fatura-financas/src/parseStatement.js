import Papa from "papaparse";
import { autoCategory, normalizeTitle } from "./categorize.js";

// Converte "1.234,56" -> 1234.56 e "- 2.000,00" -> -2000
function parseAmount(raw) {
  let s = String(raw).trim();
  const neg = s.startsWith("-");
  s = s.replace(/^-/, "").trim();
  s = s.replace(/\./g, "").replace(",", ".");
  const val = parseFloat(s);
  return neg ? -val : val;
}

export function parseCsvText(text, overrides) {
  const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
  const rows = parsed.data
    .filter(r => r.date && r.title && r.amount !== undefined && r.amount !== "")
    .map((r, idx) => {
      const amount = parseAmount(r.amount);
      const title = r.title.trim();
      return {
        id: `${r.date}__${title}__${amount}__${idx}`,
        date: r.date.trim(),
        title,
        amount,
        category: autoCategory(title, overrides),
        responsavel: "",
      };
    });

  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const dates = rows.map(r => r.date).sort();
  const dateRange = dates.length
    ? `${formatDate(dates[0])} – ${formatDate(dates[dates.length - 1])}`
    : "";

  return { rows, dateRange };
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export { normalizeTitle };
