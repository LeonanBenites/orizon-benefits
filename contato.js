const RESEND_API_URL = 'https://api.resend.com/emails';

function clean(value, max = 300) {
  return String(value ?? '').trim().slice(0, max);
}

function escapeHtml(value) {
  return clean(value, 2000)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Método não permitido.' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY não configurada.');
    return res.status(500).json({ ok: false, error: 'Serviço de e-mail não configurado.' });
  }

  const body = req.body || {};
  const nome = clean(body.nome || body.name, 120);
  const email = clean(body.email, 180).toLowerCase();
  const empresa = clean(body.empresa || body.company, 160);
  const telefone = clean(body.telefone || body.phone, 80);
  const colaboradores = clean(body.colaboradores || body.funcionarios || body.vidas, 100);
  const beneficios = clean(body.beneficios, 200);
  const interesse = clean(body.interesse || body.assunto || body.subject, 200);
  const mensagem = clean(body.mensagem || body.message, 2000);
  const origem = clean(body.origem || 'website', 80);
  const dataHora = clean(body.data_hora || new Date().toISOString(), 80);

  if (!nome || !email || !empresa || !validEmail(email)) {
    return res.status(400).json({ ok: false, error: 'Dados obrigatórios inválidos.' });
  }

  const to = process.env.EMAIL_TO || 'comercial@orizonbenefits.com.br';
  const from = process.env.EMAIL_FROM || 'Orizon Benefits <site@orizonbenefits.com.br>';

  const rows = [
    ['Nome', nome],
    ['E-mail', email],
    ['Empresa', empresa],
    ['Telefone', telefone],
    ['Número aproximado de vidas', colaboradores],
    ['Benefícios atuais', beneficios],
    ['Interesse', interesse],
    ['Mensagem', mensagem],
    ['Origem', origem],
    ['Data/hora', dataHora],
  ].filter(([, value]) => value);

  const htmlRows = rows.map(([label, value]) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #ece7df;font-weight:700;vertical-align:top;width:150px;">${escapeHtml(label)}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #ece7df;vertical-align:top;white-space:pre-wrap;">${escapeHtml(value)}</td>
    </tr>`).join('');

  const subjectCompany = empresa || nome;
  const payload = {
    from,
    to: [to],
    reply_to: email,
    subject: `Novo lead pelo site — ${subjectCompany}`,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;color:#171717;max-width:680px;margin:0 auto;">
        <p style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#9a7a3f;margin:0 0 8px;">Orizon Benefits</p>
        <h1 style="font-size:24px;line-height:1.2;margin:0 0 18px;">Novo contato comercial pelo site</h1>
        <table role="presentation" style="border-collapse:collapse;width:100%;background:#faf8f4;border:1px solid #ece7df;border-radius:8px;overflow:hidden;">
          ${htmlRows}
        </table>
        <p style="font-size:12px;color:#777;margin-top:18px;">Ao responder este e-mail, a resposta será direcionada para ${escapeHtml(email)}.</p>
      </div>`
  };

  try {
    const response = await fetch(RESEND_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error('Erro Resend:', response.status, result);
      return res.status(502).json({ ok: false, error: 'Falha ao enviar e-mail.' });
    }

    return res.status(200).json({ ok: true, id: result.id });
  } catch (error) {
    console.error('Erro ao enviar contato:', error);
    return res.status(500).json({ ok: false, error: 'Falha ao enviar contato.' });
  }
};
