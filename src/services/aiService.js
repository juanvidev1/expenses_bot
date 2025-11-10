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

export const getInvoiceAIData = async (model, prompt, imageLink) => {
  if (!process.env.OPEN_ROUTER_TOKEN) {
    throw new Error('OPEN_ROUTER_TOKEN is not defined in the environment.');
  }

  if (!model) {
    model = 'google/gemini-2.0-flash-exp:free'; // Modelo con capacidad de visión
  }
  console.log('Image link received:', imageLink);
  console.log('Model:', model);
  console.log('Valid token:', !!process.env.OPEN_ROUTER_TOKEN);

  try {
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPEN_ROUTER_TOKEN}`,
      'HTTP-Referer': 'http://localhost:3050',
      'X-Title': 'Expenses Bot',
    };

    const body = JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'Eres un analizador de facturas escaneadas',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageLink } },
          ],
        },
      ],
      context: 'Siempre responde utilizando estructura JSON',
    });

    console.log('Request body:', body, headers);

    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: headers,
      body: body,
    });

    console.log('Response status:', res.status, res.statusText);

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error getting AI data:', error.message);
    throw error;
  }
};

// Función para verificar modelos disponibles y límites de cuenta
export const checkOpenRouterAccount = async () => {
  try {
    const headers = {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_TOKEN}`,
    };

    // Verificar límites de cuenta
    const limitsRes = await fetch('https://openrouter.ai/api/v1/auth/key', {
      headers,
    });

    if (limitsRes.ok) {
      const limits = await limitsRes.json();
      console.log('Account info:', limits);
    }

    // Verificar modelos disponibles
    const modelsRes = await fetch('https://openrouter.ai/api/v1/models', {
      headers,
    });

    if (modelsRes.ok) {
      const models = await modelsRes.json();
      const visionModels = models.data.filter(
        (model) =>
          model.id.includes('vision') ||
          model.id.includes('gemini') ||
          model.id.includes('gpt-4'),
      );
      console.log(
        'Vision models available:',
        visionModels.map((m) => m.id),
      );
    }
  } catch (error) {
    console.error('Error checking account:', error);
  }
};

export { getAIData };
