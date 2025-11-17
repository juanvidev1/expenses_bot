import { bot } from '#src/index.js';
import { getInvoiceAIData, getTextAIData } from '#src/services/aiService.js';
import { ExpenseModel, CardModel } from '#src/database/models/index.js';
import { createExpense } from '#src/services/expenseService.js';
import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { CardService } from '#src/services/cardService.js';
import { Logger } from '../../logger/index.js';

const invoiceImgLogger = new Logger('invoiceImgDataFlow.log');
const invoiceErrorLogger = new Logger('nvoiceImgErrors.log');

const processPdfBuffer = async (fileUrl) => {
  try {
    const parser = new PDFParse({ url: fileUrl });
    const data = await parser.getText({ partial: [0, 1, 2, 4] });
    return data.text;
  } catch (error) {
    console.error('Error processing PDF buffer:', error);
    throw error;
  }
};

export function invoiceImgDataFlow(ctx) {
  ctx.reply('Por favor, envíame la imagen de la factura que deseas procesar.');

  bot.on('photo', async (ctx) => {
    const photos = ctx.message.photo;
    const highestResPhoto = photos[photos.length - 1];
    const fileId = highestResPhoto.file_id;
    const model = 'mistralai/mistral-small-3.1-24b-instruct:free'; // Modelo con capacidad de visión
    const prompt = `
      Analiza la imagen de la factura y extrae los datos.
      
      IMPORTANTE: Tu respuesta debe ser EXCLUSIVAMENTE un objeto JSON válido, sin texto adicional, sin bloques de código, sin backticks, sin la palabra "json".
      
      Formato requerido:
      {"comercio":"","fecha":"","monto":"","impuestos":"","monto_sin_impuestos":"","metodo_pago":"","numero_factura":"","categoria_gasto":"", "descripcion":""}

      Reglas:
      - Respuesta: SOLO el JSON, nada más
      - Fecha: formato YYYY-MM-DD
      - Monto: solo números y punto decimal
      - Categoría: Comida, Transporte, Entretenimiento, Salud, Educación, Ropa, Otros
      - Método pago: Efectivo, Tarjeta, Otro
      - Descripción: generar un texto breve sobre la compra con base en los datos de la factura
      - Campos vacíos: usar ""
    `;

    bot.telegram.getFileLink(fileId).then(async (fileLink) => {
      try {
        console.log('File link:', fileLink);
        const textRes = await getInvoiceAIData(model, prompt, fileLink);
        // Limpiar respuesta de posibles backticks y texto extra
        const jsonData = textRes
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsedData = JSON.parse(jsonData);
        // return parsedData;
        console.log('AI Response JSON:', parsedData);
        // Aquí puedes agregar la lógica para procesar la imagen de la factura
        const expenseData = {
          userId: ctx.from.id,
          amount: parsedData.monto || 0,
          category: parsedData.categoria_gasto || 'Otros',
          payment_method: parsedData.metodo_pago || 'Otro',
          description:
            parsedData.descripcion || 'Gasto registrado desde factura',
          is_paid: parsedData.metodo_pago === 'Tarjeta' ? false : true,
          market_place: parsedData.comercio || null,
          date: parsedData.fecha || new Date().toISOString().split('T')[0],
        };
        await ExpenseModel.create(expenseData);
        ctx.reply(
          '✅ La factura ha sido procesada y el gasto registrado correctamente.',
        );
        invoiceImgLogger.log('Gasto registrado:', expenseData);
      } catch (error) {
        invoiceErrorLogger.log('Error procesando la factura:', error);
        ctx.reply('Lo siento, ocurrió un error al procesar la factura.');
      }
    });
  });
}

export const invoicePdfDataFlow = (ctx) => {
  ctx.reply('Por favor, envíame el PDF de la factura que deseas procesar.');

  bot.on('document', async (ctx) => {
    const document = ctx.message.document;
    const fileId = document.file_id;
    const model = 'meta-llama/llama-4-maverick:free'; // Modelo con capacidad de visión
    const prompt = `
      Extrae todos los gastos listados en este extracto bancario.
      Devuelve un JSON con el formato:

      **Formato de salida (JSON válido sin texto adicional)**
      {
        "banco": "",
        "nombre_titular": "",
        "fecha_expiracion": "",
        "tipo_producto": "",
        "numero_tarjeta": "",
        "monto_total": "",
        "valor_cuota_mensual": "",
        "dia_corte": "",
        "dia_pago": "",
        "marca_tarjeta": "",
        "gastos": [
          {
            "comercio": "",
            "fecha": "",
            "monto": "",
            "impuestos": "",
            "monto_sin_impuestos": "",
            "metodo_pago": "",
            "valor_cuota": "",
            "numero_cuotas_totales": "",
            "numero_cuota_actual": "",
            "numero_cuotas_restantes": "",
            "categoria_gasto": "",
            "descripcion": ""
          }
        ]
      }

      Reglas
      - Devuelve **solo el objeto JSON**, sin explicaciones, sin texto adicional, sin la palabra “json” ni comillas invertidas.
      - Todas las fechas ("fecha", "fecha_expiracion") en formato **YYYY-MM-DD**.
      - "dia_corte" y "dia_pago" deben ser números enteros que representen el día del mes.
      - "marca_tarjeta" debe ser Visa, MasterCard, American Express, Discover, o N/A.
      - "valor_cuota_mensual" y "monto_total" deben contener **solo números y punto decimal** (ej. 24500.50).
      - *tipo_producto*: crédito, débito u otro.
      - *numero_tarjeta*: solamente últimos 4 dígitos de la tarjeta.
      - “monto” y “monto_sin_impuestos” deben contener **solo números y punto decimal** (ej. 24500.50).
      - "impuestos" debe ser la diferencia entre "monto" y "monto_sin_impuestos".
      - “categoria_gasto” debe ser una de las siguientes: Comida, Transporte, Entretenimiento, Salud, Educación, Ropa, Otros.
      - “metodo_pago” debe ser uno de: Efectivo, Tarjeta, Otro.
      - “descripcion” debe ser una frase corta que resuma la compra.
      - Si algún valor no está disponible, deja el campo vacío: "".
      - Si existen varios gastos, todos deben incluirse dentro del array "gastos".
    `;

    bot.telegram.getFileLink(fileId).then(async (fileLink) => {
      try {
        console.log('File link:', fileLink);
        const pdfText = await processPdfBuffer(fileLink);
        const fullPrompt = `${prompt}\n\nAquí está el texto extraído del PDF de la factura:\n${pdfText}`;
        const textRes = await getTextAIData(model, fullPrompt);
        // Limpiar respuesta de posibles backticks y texto extra
        const jsonData = textRes
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const parsedData = JSON.parse(jsonData);
        // return parsedData;
        // console.log('AI Response JSON:', parsedData);

        let cardId = '';

        const card = await CardService.getCardByNumber(
          parsedData.numero_tarjeta,
        );

        if (!card) {
          const crdData = {
            userId: ctx.from.id,
            card_number: parsedData.numero_tarjeta,
            card_type: parsedData.tipo_producto,
            card_brand: parsedData.marca_tarjeta,
            card_holder_name: parsedData.nombre_titular,
            expiration_date: parsedData.fecha_expiracion,
            cutoff_day: parsedData.dia_corte,
            payment_day: parsedData.dia_pago,
          };
          const newCard = await CardService.createCard(crdData);
          cardId = newCard.id;
        } else {
          cardId = card.id;
        }

        invoiceImgLogger.log('Card ID to associate expenses:', cardId);
        // Aquí puedes agregar la lógica para procesar la imagen de la factura
        const expenses = parsedData.gastos || [];
        for (const gasto of expenses) {
          const expenseData = {
            userId: ctx.from.id,
            amount: gasto.monto || 0,
            category: gasto.categoria_gasto || 'Otros',
            payment_method:
              gasto.metodo_pago === 'crédito' ? 'Tarjeta' : 'Otro',
            description: gasto.descripcion || 'Gasto registrado desde factura',
            is_paid: gasto.metodo_pago === 'Tarjeta' ? false : true,
            market_place: gasto.comercio || null,
            date: gasto.fecha || new Date().toISOString().split('T')[0],
            associated_card: cardId,
          };
          await ExpenseModel.create(expenseData);
        }
        ctx.reply(
          '✅ La factura ha sido procesada y el gasto registrado correctamente.',
        );
        // console.log('Gasto registrado:', expenseData);
      } catch (error) {
        invoiceErrorLogger.log('Error procesando la factura:', error);
        ctx.reply('Lo siento, ocurrió un error al procesar la factura.');
      }
    });
  });
};
