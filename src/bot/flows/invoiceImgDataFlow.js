import { bot } from '#src/index.js';
import { getInvoiceAIData } from '#src/services/aiService.js';

export function invoiceImgDataFlow(ctx) {
  ctx.reply('Por favor, envíame la imagen de la factura que deseas procesar.');

  bot.on('photo', async (ctx) => {
    const photos = ctx.message.photo;
    const highestResPhoto = photos[photos.length - 1];
    const fileId = highestResPhoto.file_id;
    const model = 'mistralai/mistral-small-3.2-24b-instruct:free'; // Modelo con capacidad de visión
    const prompt = `
      Eres un asistente experto en reconocimiento de facturas.
      Analiza la imagen y responde estrictamente en JSON con este formato:

      {
        "comercio": "",
        "fecha": "",
        "monto": ""
      }

      Si algún dato no es visible, déjalo vacío.
    `;

    bot.telegram.getFileLink(fileId).then(async (fileLink) => {
      console.log('File link:', fileLink);
      const textRes = await getInvoiceAIData(model, prompt, fileLink);
      // Aquí puedes agregar la lógica para procesar la imagen de la factura
      ctx.reply(`Datos de la factura:\n${textRes}`);
    });
  });
}
