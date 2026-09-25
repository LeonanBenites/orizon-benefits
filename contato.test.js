import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/contato.js';

const realFetch = globalThis.fetch;
const keys = ['RESEND_API_KEY', 'EMAIL_TO', 'EMAIL_FROM'];
let previous;
let sent;
let calls;
beforeEach(() => {
  previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  process.env.RESEND_API_KEY = 'test-key';
  process.env.EMAIL_TO = 'recipient@example.com';
  process.env.EMAIL_FROM = 'Orizon <sender@example.com>';
  sent = undefined;
  calls = 0;
  globalThis.fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.resend.com/emails');
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: 'test-receipt' }) };
  };
});
afterEach(() => {
  globalThis.fetch = realFetch;
  keys.forEach(key => {
    if (previous[key] === undefined) delete process.env[key];
    else process.env[key] = previous[key];
  });
});
async function request(body = {}, method = 'POST', type = 'application/json') {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(data) { this.body = data; return this; } };
  await handler({ method, headers: { 'content-type': type }, body }, res);
  return res;
}
const valid = () => ({ nome: 'Pessoa de teste', empresa: 'Empresa exemplo', email: 'teste@example.com', beneficios: [] });

test('encaminha todos os campos, incluindo mensagem e múltiplos benefícios', async () => {
  const res = await request({ ...valid(), mensagem: 'Queremos rever a operação.', beneficios: ['Plano de saúde', 'Seguro de vida'], telefone: '(11) 99999-0000', vidas: '100 a 499', interesse: 'Melhorar os benefícios atuais' });
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { success: true });
  assert.equal(sent.reply_to, 'teste@example.com');
  assert.match(sent.html, /Queremos rever a operação/);
  assert.match(sent.html, /Plano de saúde, Seguro de vida/);
  assert.match(sent.text, /100 a 499/);
  assert.equal(calls, 1);
});
test('escapa HTML de campos de texto e preserva quebras de linha', async () => {
  const res = await request({ ...valid(), empresa: 'A & B <teste>', mensagem: '<img src=x onerror=alert(1)>\nSegunda linha' });
  assert.equal(res.code, 200);
  assert.ok(!sent.html.includes('<img'));
  assert.match(sent.html, /&lt;img/);
  assert.match(sent.html, /A &amp; B &lt;teste&gt;/);
  assert.match(sent.html, /<br>Segunda linha/);
});
test('bloqueia e-mail inválido, obrigatórios vazios e injeção em cabeçalho', async () => {
  for (const change of [{ email: 'inválido' }, { nome: ' ' }, { empresa: '' }, { email: 'a@example.com\r\nBcc: b@example.com' }, { empresa: 'A\nB' }]) {
    assert.equal((await request({ ...valid(), ...change })).code, 400);
  }
  assert.equal(calls, 0);
});
test('rejeita tipos e comprimentos inválidos', async () => {
  for (const change of [{ mensagem: 'a'.repeat(2001) }, { nome: {} }, { beneficios: 'Plano de saúde' }, { beneficios: ['Desconhecido'] }, { beneficios: ['Nenhum atualmente', 'Seguro de vida'] }]) {
    assert.equal((await request({ ...valid(), ...change })).code, 400);
  }
  assert.equal(calls, 0);
});
test('honeypot evita chamada ao provedor', async () => {
  const res = await request({ ...valid(), website: 'spam.example.com' });
  assert.equal(res.code, 202);
  assert.equal(calls, 0);
});
test('configuração ausente retorna indisponibilidade sem tentar enviar', async () => {
  delete process.env.RESEND_API_KEY;
  assert.equal((await request(valid())).code, 503);
  assert.equal(calls, 0);
});
test('rejeita método, conteúdo e JSON inválidos', async () => {
  const method = await request(valid(), 'GET');
  assert.equal(method.code, 405);
  assert.equal(method.headers.Allow, 'POST');
  assert.equal((await request(valid(), 'POST', 'text/plain')).code, 415);
  assert.equal((await request('{invalid')).code, 400);
  assert.equal((await request(null)).code, 400);
  assert.equal((await request([])).code, 400);
  assert.equal(calls, 0);
});
test('falhas do provedor não expõem detalhes nem geram sucesso', async () => {
  globalThis.fetch = async () => ({ ok: false, json: async () => ({ secret: 'private diagnostic' }) });
  const res = await request(valid());
  assert.equal(res.code, 502);
  assert.equal(res.body.success, undefined);
  assert.ok(!JSON.stringify(res.body).includes('private diagnostic'));
});
test('exceções ou confirmação malformada não geram sucesso', async () => {
  globalThis.fetch = async () => { throw new Error('Timeout'); };
  assert.equal((await request(valid())).code, 502);
  globalThis.fetch = async () => ({ ok: true, json: async () => ({}) });
  assert.equal((await request(valid())).code, 502);
});
