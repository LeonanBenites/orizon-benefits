export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido." });
  }

  const {
    nome,
    empresa,
    email,
    telefone,
    vidas,
    beneficios,
    interesse
  } = req.body || {};

  if (!nome || !empresa || !email) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes." });
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: [process.env.EMAIL_TO],
        reply_to: email,
        subject: `Novo lead pelo site — ${empresa}`,
        html: `
          <h2>Novo lead - Orizon Benefits</h2>
          <p><strong>Nome:</strong> ${nome}</p>
          <p><strong>Empresa:</strong> ${empresa}</p>
          <p><strong>E-mail:</strong> ${email}</p>
          <p><strong>Telefone:</strong> ${telefone || "-"}</p>
          <p><strong>Número aproximado de vidas:</strong> ${vidas || "-"}</p>
          <p><strong>Benefícios atuais:</strong> ${beneficios || "-"}</p>
          <p><strong>Interesse:</strong> ${interesse || "-"}</p>
        `
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Resend error:", data);
      return res.status(500).json({
        error: "Erro ao enviar e-mail.",
        details: data
      });
    }

    return res.status(200).json({
      success: true,
      id: data.id
    });

  } catch (error) {
    console.error("Contato API error:", error);

    return res.status(500).json({
      error: "Erro interno ao processar contato."
    });
  }
}
