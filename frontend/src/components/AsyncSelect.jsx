import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './asyncSelect.css';

export default function AsyncSelect({
  value,
  onChange,
  fetchOptions,   // async (query) => [{value, label, ...}]
  placeholder = 'Pesquisar...',
  labelKey = 'label',
  valueKey = 'value',
  debounceMs = 300,
}) {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapRef = useRef(null);
  const debounceTimer = useRef();

  const label = useMemo(() => {
    const found = opts.find(o => o[valueKey] === value);
    return found?.[labelKey] || '';
  }, [value, opts, labelKey, valueKey]);

  const load = useCallback(async (query) => {
    setLoading(true);
    try {
      const items = await fetchOptions(query ?? '');
      setOpts(items || []);
    } catch {
      setOpts([]);
    } finally {
      setLoading(false);
    }
  }, [fetchOptions]);

  // Carrega imediatamente ao abrir (mesmo sem digitar)
  useEffect(() => {
    if (open) {
      load('');
      setQ('');
    }
  }, [open, load]);

  // Busca com debounce quando digitar
  useEffect(() => {
    if (!open) return;
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      load(q);
    }, debounceMs);
    return () => clearTimeout(debounceTimer.current);
  }, [q, open, load, debounceMs]);

  // Fecha ao clicar fora (em vez de usar onBlur)
  useEffect(() => {
    function onDocClick(e) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  return (
    <div className="as-wrap" ref={wrapRef}>
      <div className="as-control" onClick={() => setOpen(v => !v)} role="button" tabIndex={0}>
        <div className={`as-value ${label ? '' : 'placeholder'}`}>
          {label || placeholder}
        </div>
        <div className="as-caret">▾</div>
      </div>

      {open && (
        <div className="as-panel">
          <input
            className="as-input"
            placeholder={placeholder}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            autoFocus
          />
          <div className="as-list">
            {loading && <div className="as-item muted">Carregando...</div>}
            {!loading && opts.length === 0 && (
              <div className="as-item muted">Sem resultados</div>
            )}
            {!loading && opts.map((o) => (
              <div
                key={o[valueKey]}
                className={`as-item ${o[valueKey] === value ? 'active' : ''}`}
                onClick={() => {
                  onChange(o[valueKey], o);
                  setOpen(false);
                  setQ('');
                }}
              >
                {o[labelKey]}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
