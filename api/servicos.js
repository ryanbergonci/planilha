const URL_ = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

async function redis(cmd) {
  const r = await fetch(URL_, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmd)
  });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

module.exports = async (req, res) => {
  if (!process.env.SENHA || req.headers['x-senha'] !== process.env.SENHA) {
    return res.status(401).json({ erro: 'senha' });
  }
  try {
    if (req.method === 'GET') {
      const v = await redis(['GET', 'servicos']);
      return res.status(200).json({ itens: v ? JSON.parse(v) : [] });
    }
    if (req.method === 'PUT') {
      const itens = req.body && Array.isArray(req.body.itens) ? req.body.itens : null;
      if (!itens) return res.status(400).json({ erro: 'dados' });
      await redis(['SET', 'servicos', JSON.stringify(itens.slice(0, 500))]);
      return res.status(200).json({ ok: true });
    }
    return res.status(405).end();
  } catch (e) {
    return res.status(500).json({ erro: 'servidor' });
  }
};
