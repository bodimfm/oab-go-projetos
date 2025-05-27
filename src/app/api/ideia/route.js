import { NextResponse } from 'next/server';

export async function POST(request) {
  const { ideia } = await request.json();
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 });
  }

  const prompt = `A partir da seguinte ideia de projeto: "${ideia}"\n` +
    'sugira um nome, descricao curta, objetivos principais, resultados esperados, publico alvo, ' +
    'ate 3 tags e ate 3 possiveis comissoes ou projetos relacionados.\n' +
    'Responda apenas em JSON no formato: {"nome":"","descricao":"","objetivos":"","resultados_esperados":"","publico_alvo":"","tags":[""],"integracoes":[{"nome":"","descricao":""}]}';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4.1-mini"',
      messages: [
        { role: 'system', content: 'Você é um assistente que ajuda a criar projetos para as comissões da OAB-GO.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return NextResponse.json({ error: errorText }, { status: 500 });
  }

  const data = await response.json();
  const message = data.choices?.[0]?.message?.content || '';
  let sugestao;
  try {
    sugestao = JSON.parse(message);
  } catch (e) {
    sugestao = { texto: message };
  }

  return NextResponse.json({ data: sugestao });
}
