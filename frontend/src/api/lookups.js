import api from './api';

export async function searchFederations(q) {
  const { data } = await api.get('/federations', { params: { q, limit: 10 } });
  return (data.items || []).map((f) => ({ value: f.id, label: `${f.uf} — ${f.name}` }));
}

export async function searchClubs(q, federationId) {
  const { data } = await api.get('/clubs', { params: { q, federationId, limit: 10 } });
  return (data.items || []).map((c) => ({ value: c.id, label: c.name }));
}

export async function searchAthletes(q) {
  const { data } = await api.get('/athletes', { params: { q, limit: 10 } });
  return (data.items || []).map((a) => ({ value: a.id, label: `${a.fullName} (${a.cbfCode})` }));
}

export async function searchTestOrders(q) {
  const { data } = await api.get('/test-orders/lookup', { params: { q, limit: 10 } });
  return (data.items || []).map((o) => ({
    value: o.id,
    label: `#${o.id.slice(0, 8)} • ${o.athleteId || o.clubId || o.federationId || '—'} • ${o.reason}/${o.priority}`,
  }));
}

export async function searchUsers(q) {
  const { data } = await api.get('/users', { params: { q, limit: 10 } });
  return (data.items || []).map((u) => ({
    value: u.id,
    label: `${u.name} • ${u.role}`,
  }));
}

export async function searchLabs(q) {
  const params = { q, limit: 10 };

  // Preferência: rota /labs (lista com filtro q). Se você expôs /labs/lookup, também funciona.
  // Tenta /labs primeiro; se der 404, tenta /labs/lookup.
  try {
    const { data } = await api.get('/labs', { params });
    const rows = data.items || data; // tanto faz se vier {items:[]} ou []
    return (rows || []).map((l) => ({
      value: l.id,
      label: l.code ? `${l.name} • ${l.code}` : l.name,
    }));
  } catch (e) {
    // fallback opcional para /labs/lookup
    try {
      const { data } = await api.get('/labs/lookup', { params });
      const rows = data.items || data;
      return (rows || []).map((l) => ({
        value: l.id,
        label: l.code ? `${l.name} • ${l.code}` : l.name,
      }));
    } catch {
      return [];
    }
  }
}

export async function searchSamples(q, testOrderId) {
  const params = { q, limit: 10 };
  if (testOrderId) params.testOrderId = testOrderId;

  // Primeiro tenta /samples/lookup; se não existir, cai no /samples (lista)
  try {
    const { data } = await api.get('/samples/lookup', { params });
    const rows = data.items || data;
    return (rows || []).map((s) => ({
      value: s.id,
      label: s.code ? `${s.code} • ${s.type}` : s.id,
    }));
  } catch {
    const { data } = await api.get('/samples', { params });
    const rows = data.items || data;
    return (rows || []).map((s) => ({
      value: s.id,
      label: s.code ? `${s.code} • ${s.type}` : s.id,
    }));
  }
}
