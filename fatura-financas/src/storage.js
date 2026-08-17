// Tudo é salvo no localStorage do navegador — nada sai da sua máquina.

const STATEMENTS_KEY = "ff_statements_v1";
const OVERRIDES_KEY = "ff_category_overrides_v1";

export function loadStatements() {
  try {
    const raw = localStorage.getItem(STATEMENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStatements(statements) {
  localStorage.setItem(STATEMENTS_KEY, JSON.stringify(statements));
}

export function loadOverrides() {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveOverrides(overrides) {
  localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides));
}
