const EMAIL_PATTERN = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const BENEFITS = new Set(['Plano de saúde', 'Plano odontológico', 'Seguro de vida', 'Benefícios flexíveis', 'Previdência privada', 'Outros', 'Nenhum atualmente']);
const LIMITS = { nome: 120, empresa: 160, email: 254, telefone: 32, vidas: 50, interesse: 150, mensagem: 2000, website: 300 };
const escapeHtml = value => String(value || '—').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Método não permitido.' });
  }
  if (!String(req.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) {
    return res.status(415).json({ error: 'Envie os dados em formato JSON.' });
  }
  let body = req.body;
  try { if (typeof body === 'string') body = JSON.parse(body); }
  catch { return res.status(400).json({ error: 'Dados inválidos.' }); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return res.status(400).json({ error: 'Dados inválidos.' });
  const data = {};
  for (const [field, max] of Object.entries(LIMITS)) {
    const value = body[field] ?? '';
    if (typeof value !== 'string' || value.length > max) return res.status(400).json({ error: 'Confira os dados informados.' });
    data[field] = value.trim();
  }
  // The hidden field is carried through from the browser, so it also protects the endpoint.
  if (data.website) return res.status(202).json({ success: true });
  if (!data.nome || !data.empresa || !EMAIL_PATTERN.test(data.email) || /[\r\n]/.test(data.nome + data.empresa + data.email)) {
    return res.status(400).json({ error: 'Informe nome, empresa e um e-mail válido.' });
  }
  const benefits = body.beneficios ?? [];
  if (!Array.isArray(benefits) || benefits.length > BENEFITS.size || benefits.some(value => !BENEFITS.has(value))) {
    return res.status(400).json({ error: 'Benefícios informados inválidos.' });
  }
  if (benefits.includes('Nenhum atualmente') && benefits.length > 1) return res.status(400).json({ error: 'Confira os benefícios selecionados.' });
  if (!process.env.RESEND_API_KEY || !process.env.EMAIL_TO || !process.env.EMAIL_FROM) {
    return res.status(503).json({ error: 'Envio temporariamente indisponível. Entre em contato por e-mail.' });
  }
  const rows = [['Nome', data.nome], ['Empresa', data.empresa], ['E-mail', data.email], ['Telefone', data.telefone], ['Colaboradores', data.vidas], ['Benefícios atuais', [...new Set(benefits)].join(', ')], ['Principal desafio', data.interesse], ['Mensagem', data.mensagem]];
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [process.env.EMAIL_TO],
        reply_to: data.email,
        subject: `Novo contato pelo site — ${data.empresa}`,
        text: 'Novo contato — Orizon Benefits\n\n' + rows.map(([label, value]) => `${label}: ${value || '—'}`).join('\n\n'),
        html: '<h2>Novo contato — Orizon Benefits</h2>' + rows.map(([label, value]) => `<p><strong>${label}:</strong><br>${escapeHtml(value).replace(/\r?\n/g, '<br>')}</p>`).join('')
      })
    });
    if (!response.ok) return res.status(502).json({ error: 'Não foi possível confirmar o envio. Tente novamente ou entre em contato por e-mail.' });
    const result = await response.json();
    if (typeof result.id !== 'string' || !result.id) throw new Error('Invalid provider response');
    return res.status(200).json({ success: true });
  } catch {
    return res.status(502).json({ error: 'Não foi possível confirmar o envio. Tente novamente ou entre em contato por e-mail.' });
  }
}
