import dotenv from 'dotenv';

dotenv.config();

const getAIData = (model, prompt) => {
  if (!process.env.OPEN_ROUTER_TOKEN) {
    throw new Error('OPEN_ROUTER_TOKEN is not defined in the environment.');
  }

  if (!model) {
    model = 'openai/gpt-oss-20b:free';
  }

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_ROUTER_TOKEN}`,
    };

    const body = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      context: `Responde siempre en español. Utiliza el formato adecuado para Telegram, ya sea *Markdown* o <i>HTML</i>, para formatear el texto (negritas, itálicas, enlaces, etc.). Si no sabes cómo formatear, usa el formato más común para Telegram.`,
    });

    return { headers, body };
  } catch (error) {
    console.error('Error getting AI data:', error);
    throw error;
  }
};

export { getAIData };
