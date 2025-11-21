// src/api/files.js
import api from './api';

export async function downloadResultPdf(id) {
  // usa o axios "api" que já injeta Authorization via interceptor
  const resp = await api.get(`/test-results/${id}/pdf`, {
    responseType: 'blob',
    headers: { Accept: 'application/pdf' },
  });

  if (resp.status !== 200) {
    throw new Error('Falha ao baixar PDF');
  }

  const blob = new Blob([resp.data], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `resultado-${id}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
