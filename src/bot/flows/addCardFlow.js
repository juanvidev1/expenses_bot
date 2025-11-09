import { bot } from '../../index.js';
import { Markup } from 'telegraf';
import { CardHandler } from '../handlers/cardHandler.js';

const cardTypes = ['Crédito', 'Débito'];

export const addCardFlow = async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    ctx.reply('No se pudo obtener tu ID de Telegram.');
    return;
  }

  await ctx.reply(
    '💳 Vamos a agregar una nueva tarjeta. Agrégala de la siguiente forma (utilizando el salto de línea):\n\n' +
      '1. Número de tarjeta (sólo 4 últimos dígitos)\n' +
      '2. Tipo de tarjeta (Crédito o Débito)\n' +
      '3. Día de corte - Opcional (número del día)\n' +
      '4. Día de pago - Opcional (número del día)\n\n' +
      'POR NINGÚN MOTIVO INGRESES EL CCV EN ESTOS DATOS\n\n' +
      "Escribe 'Cancelar' para cancelar la operación.",
    Markup.keyboard([['Cancelar']])
      .oneTime()
      .resize(),
  );

  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) {
      return;
    }

    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    if (ctx.message.text.toLowerCase() === 'cancelar') {
      await ctx.reply('Operación cancelada.', Markup.removeKeyboard());
      return;
    }

    const cardData = ctx.message.text.trim().split('\n');
    const cardNumber = cardData[0];
    const cardType = cardData[1];
    const cutOffDay = cardData[2];
    const paymentDay = cardData[3];

    if (isNaN(parseInt(cardNumber)) || cardNumber.length !== 4) {
      await ctx.reply(
        'Por favor, ingresa un número de tarjeta válido (4 últimos dígitos).',
      );
      return;
    }

    if (!cardTypes.includes(cardType)) {
      await ctx.reply(
        'Por favor, ingresa un tipo de tarjeta válido (Crédito o Débito).',
      );
      return;
    }

    if (
      cutOffDay &&
      (isNaN(parseInt(cutOffDay)) ||
        parseInt(cutOffDay) < 1 ||
        parseInt(cutOffDay) > 31)
    ) {
      await ctx.reply(
        'Por favor, ingresa un día de corte válido (número entre 1 y 31) o déjalo vacío.',
      );
      return;
    }

    if (
      paymentDay &&
      (isNaN(parseInt(paymentDay)) ||
        parseInt(paymentDay) < 1 ||
        parseInt(paymentDay) > 31)
    ) {
      await ctx.reply(
        'Por favor, ingresa un día de pago válido (número entre 1 y 31) o déjalo vacío.',
      );
      return;
    }

    const cardInfo = {
      userId: telegramId,
      card_number: `**** **** **** ${cardNumber}`,
      card_type: cardType.toLowerCase(),
      card_holder_name:
        ctx.from?.first_name + ' ' + ctx.from?.last_name || 'N/A',
      cutoff_day: cutOffDay ? parseInt(cutOffDay) : null,
      payment_day: paymentDay ? parseInt(paymentDay) : null,
    };

    const card = await CardHandler.addCard(cardInfo);

    await ctx.reply(
      `Tarjeta con número **** **** **** ${card.card_number} agregada exitosamente!`,
      Markup.removeKeyboard(),
    );
  });
};
