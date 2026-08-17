import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import {
  ChevronDown, ChevronRight, Filter, X, Upload, Wallet,
  Trash2, Plus, Download, FileText
} from "lucide-react";
import { CATEGORY_STYLE, CATEGORY_ORDER } from "./categorize.js";
import { parseCsvText, normalizeTitle } from "./parseStatement.js";
import { loadStatements, saveStatements, loadOverrides, saveOverrides } from "./storage.js";

function fmtBRL(v) {
  const sign = v < 0 ? "-" : "";
  const abs = Math.abs(v);
  return sign + "R$ " + abs.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDateShort(iso) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export default function App() {
  const [statements, setStatements] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [overrides, setOverrides] = useState({});
  const [filterPerson, setFilterPerson] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // carregar do localStorage na primeira renderização
  useEffect(() => {
    const st = loadStatements();
    setStatements(st);
    if (st.length > 0) setActiveId(st[0].id);
    setOverrides(loadOverrides());
  }, []);

  const persistStatements = useCallback((next) => {
    setStatements(next);
    saveStatements(next);
  }, []);

  const persistOverrides = useCallback((next) => {
    setOverrides(next);
    saveOverrides(next);
  }, []);

  const active = useMemo(
    () => statements.find(s => s.id === activeId) || null,
    [statements, activeId]
  );

  function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const { rows, dateRange } = parseCsvText(text, overrides);
      const statement = {
        id: uid(),
        name: dateRange || file.name.replace(/\.csv$/i, ""),
        fileName: file.name,
        importedAt: new Date().toISOString(),
        rows,
      };
      const next = [statement, ...statements];
      persistStatements(next);
      setActiveId(statement.id);
      setFilterPerson("");
      setCollapsed({});
    };
    reader.readAsText(file, "utf-8");
  }

  function onFileInputChange(e) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function updateRow(rowId, patch) {
    if (!active) return;
    const next = statements.map(s => {
      if (s.id !== active.id) return s;
      return {
        ...s,
        rows: s.rows.map(r => (r.id === rowId ? { ...r, ...patch } : r)),
      };
    });
    persistStatements(next);
  }

  function setCategory(rowId, category, title) {
    updateRow(rowId, { category });
    // aprende essa categoria para este estabelecimento nas próximas importações
    const norm = normalizeTitle(title);
    const nextOverrides = { ...overrides, [norm]: category };
    persistOverrides(nextOverrides);
  }

  function setResponsavel(rowId, name) {
    updateRow(rowId, { responsavel: name.trim() });
  }

  function deleteStatement(id) {
    const next = statements.filter(s => s.id !== id);
    persistStatements(next);
    if (activeId === id) {
      setActiveId(next.length > 0 ? next[0].id : null);
      setFilterPerson("");
    }
  }

  function exportCsv() {
    if (!active) return;
    const header = "date,title,amount,category,responsavel\n";
    const body = active.rows
      .map(r => [r.date, `"${r.title.replace(/"/g, '""')}"`, r.amount, r.category, r.responsavel || ""].join(","))
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `fatura-organizada-${active.name.replace(/[\s/]+/g, "_")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const expenseTx = useMemo(() => (active ? active.rows.filter(r => r.amount > 0) : []), [active]);
  const paymentTx = useMemo(() => (active ? active.rows.filter(r => r.amount < 0) : []), [active]);

  const people = useMemo(() => {
    const set = new Set(expenseTx.map(r => r.responsavel).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "pt-BR"));
  }, [expenseTx]);

  const filteredExpenses = useMemo(() => {
    if (!filterPerson) return expenseTx;
    return expenseTx.filter(r => r.responsavel === filterPerson);
  }, [expenseTx, filterPerson]);

  const totalFiltered = useMemo(() => filteredExpenses.reduce((s, r) => s + r.amount, 0), [filteredExpenses]);
  const totalAll = useMemo(() => expenseTx.reduce((s, r) => s + r.amount, 0), [expenseTx]);
  const unassignedCount = useMemo(() => expenseTx.filter(r => !r.responsavel).length, [expenseTx]);

  const grouped = useMemo(() => {
    const map = {};
    for (const r of filteredExpenses) {
      if (!map[r.category]) map[r.category] = [];
      map[r.category].push(r);
    }
    return map;
  }, [filteredExpenses]);

  const categoriesPresent = CATEGORY_ORDER.filter(c => grouped[c] && grouped[c].length > 0);

  function toggleCollapse(cat) {
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));
  }

  return (
    <div className="app">
      <div className="wrap">
        <header className="header">
          <div className="brand">
            <div className="brand-icon"><Wallet size={18} color="#fff" strokeWidth={2.2} /></div>
            <h1>Minhas Finanças</h1>
          </div>
          <p className="subtitle">Organize sua fatura por categoria e responsável, todo mês.</p>
        </header>

        {/* Seletor de meses / import */}
        <div className="toolbar">
          <div className="statement-select">
            {statements.length > 0 && (
              <select value={activeId || ""} onChange={e => { setActiveId(e.target.value); setFilterPerson(""); }}>
                {statements.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
          </div>
          <div className="toolbar-actions">
            <button className="btn btn-primary" onClick={() => fileInputRef.current?.click()}>
              <Upload size={15} /> Importar CSV
            </button>
            {active && (
              <button className="btn btn-ghost" onClick={exportCsv}>
                <Download size={15} /> Exportar
              </button>
            )}
            {active && (
              <button className="btn btn-ghost btn-danger" onClick={() => deleteStatement(active.id)}>
                <Trash2 size={15} />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            style={{ display: "none" }}
            onChange={onFileInputChange}
          />
        </div>

        {!active && (
          <div
            className={"dropzone" + (dragOver ? " dropzone-active" : "")}
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <FileText size={28} color="#9B8FBE" />
            <p><strong>Arraste seu CSV da fatura aqui</strong> ou clique para escolher o arquivo</p>
            <p className="dropzone-hint">Formato Nubank: colunas date, title, amount</p>
          </div>
        )}

        {active && (
          <>
            {/* Filtro + total */}
            <div className="total-card">
              <div className="filter-group">
                <Filter size={16} color="#C9B8E8" />
                <select value={filterPerson} onChange={e => setFilterPerson(e.target.value)}>
                  <option value="">Todos os responsáveis</option>
                  {people.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                {filterPerson && (
                  <button className="icon-btn" onClick={() => setFilterPerson("")} title="Limpar filtro">
                    <X size={16} />
                  </button>
                )}
              </div>
              <div className="total-value">
                <div className="total-label">
                  {filterPerson ? `Total de ${filterPerson}` : "Total geral (gastos)"}
                </div>
                <div className="total-amount">{fmtBRL(totalFiltered)}</div>
                {!filterPerson && unassignedCount > 0 && (
                  <div className="total-note">{unassignedCount} sem responsável</div>
                )}
                {filterPerson && (
                  <div className="total-note">
                    {filteredExpenses.length} lançamentos · {totalAll ? ((totalFiltered / totalAll) * 100).toFixed(0) : 0}% do total
                  </div>
                )}
              </div>
            </div>

            {categoriesPresent.length === 0 && (
              <div className="empty">Nenhum lançamento para este responsável.</div>
            )}

            {categoriesPresent.map(cat => {
              const items = grouped[cat];
              const subtotal = items.reduce((s, r) => s + r.amount, 0);
              const style = CATEGORY_STYLE[cat];
              const isCollapsed = !!collapsed[cat];

              return (
                <div className="category-block" key={cat}>
                  <button className="category-header" style={{ background: style.bg }} onClick={() => toggleCollapse(cat)}>
                    <div className="category-header-left">
                      {isCollapsed ? <ChevronRight size={16} color={style.fg} /> : <ChevronDown size={16} color={style.fg} />}
                      <span className="dot" style={{ background: style.dot }} />
                      <span className="category-name" style={{ color: style.fg }}>{cat}</span>
                      <span className="category-count" style={{ color: style.fg }}>({items.length})</span>
                    </div>
                    <span className="category-subtotal" style={{ color: style.fg }}>{fmtBRL(subtotal)}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="category-body">
                      {items.map((r, idx) => (
                        <div className="tx-row" key={r.id} style={{ borderTop: idx === 0 ? "none" : undefined }}>
                          <span className="tx-date">{fmtDateShort(r.date)}</span>
                          <span className="tx-title" title={r.title}>{r.title}</span>
                          <span className="tx-amount">{fmtBRL(r.amount)}</span>
                          <select
                            className="tx-category-select"
                            value={r.category}
                            onChange={e => setCategory(r.id, e.target.value, r.title)}
                          >
                            {CATEGORY_ORDER.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <input
                            className={"tx-resp-input" + (r.responsavel ? " tx-resp-filled" : "")}
                            list="people-list"
                            placeholder="+ responsável"
                            defaultValue={r.responsavel}
                            onBlur={e => setResponsavel(r.id, e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter") e.target.blur(); }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <datalist id="people-list">
              {people.map(p => <option key={p} value={p} />)}
            </datalist>

            {!filterPerson && paymentTx.length > 0 && (
              <div className="payments-box">
                <strong>Pagamentos da fatura (não contam como gasto):</strong>
                <div className="payments-list">
                  {paymentTx.map(r => (
                    <div className="payments-row" key={r.id}>
                      <span>{fmtDateShort(r.date)} · {r.title}</span>
                      <span>{fmtBRL(r.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="footer-note">
              As categorias e responsáveis ficam salvos neste navegador. Ao importar a fatura do próximo
              mês, os estabelecimentos que você já categorizou serão reconhecidos automaticamente.
            </div>
          </>
        )}
      </div>
    </div>
  );
}
