export function isCPFDigits(cpf) {
  return /^\d{11}$/.test(cpf || '');
}

// Ex.: CBF-UR-2025-0001 ou algo parecido
export function isCBFCode(code) {
  return /^[A-Z0-9-._]{6,}$/i.test(code || '');
}

export function required(value) {
  return value !== null && value !== undefined && String(value).trim() !== '';
}

export function collectErrors(rules) {
  // rules: { fieldName: [ { test: ()=>bool, message: '...' }, ... ] }
  const errs = {};
  for (const [field, checks] of Object.entries(rules)) {
    for (const c of checks) {
      const ok = c.test();
      if (!ok) {
        errs[field] = c.message;
        break;
      }
    }
  }
  return errs;
}

export function hasErrors(obj) {
  return Object.keys(obj).length > 0;
}
