import { Markup } from 'telegraf';
import { bot } from '../../index.js';
import { ExpenseHandler } from '../handlers/expenseHandler.js';
import { UserHandler } from '../handlers/userHandler.js';
import { CardHandler } from '../handlers/cardHandler.js';
import {
  formatCurrency,
  calculateCreditCardInstalments,
} from '../../utils/index.js';
import { inlineKeyboard } from 'telegraf/markup';

const userSteps = new Map();

const expenseCategories = [
  'Comida',
  'Transporte',
  'Entretenimiento',
  'Salud',
  'Educación',
  'Ropa',
  'Otros',
];

const addExpense = async (ctx) => {
  const telegramId = ctx.from?.id;
  if (!telegramId) {
    ctx.reply('No se pudo obtener tu ID de Telegram.');
    return;
  }

  const userId = await UserHandler.getUserIdByTelegramId(telegramId);

  if (!userId) {
    ctx.reply('Por favor, regístrate antes de agregar un gasto.');
    return;
  }

  userSteps.set(telegramId, { step: 1, expenseData: {} });

  await ctx.reply(
    '💰 Vamos a agregar un nuevo gasto. ¿Cuál es el monto del gasto?',
    Markup.keyboard([['Cancelar']])
      .oneTime()
      .resize(),
  );

  bot.on('message', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !userSteps.has(telegramId)) {
      return;
    }

    const userStep = userSteps.get(telegramId);

    if (!ctx.message || !('text' in ctx.message)) {
      return;
    }

    if (ctx.message.text.toLowerCase() === 'cancelar') {
      userSteps.delete(telegramId);
      await ctx.reply('Operación cancelada.', Markup.removeKeyboard());
      return;
    }

    switch (userStep.step) {
      case 1: // Solicita monto
        const amount = parseFloat(ctx.message.text);
        if (isNaN(amount) || amount <= 0) {
          await ctx.reply('Por favor, ingresa un monto válido.');
          return;
        }
        userStep.expenseData.amount = amount;
        userStep.step = 2;
        await ctx.reply('🏷️ ¿Cuál es la categoría del gasto?');
        break;

      case 2: // Solicita categoría
        const category = ctx.message.text.trim();
        if (!category || expenseCategories.includes(category) === false) {
          await ctx.reply('Por favor, ingresa una categoría válida.');
          return;
        }
        userStep.expenseData.category = category;
        userStep.step = 3;
        await ctx.reply(
          '💳 ¿Qué método de pago utilizaste? (e.g., efectivo, tarjeta)',
        );
        break;

      case 3: // Solicita método de pago
        const paymentMethod = ctx.message.text.trim();
        if (!paymentMethod) {
          await ctx.reply('Por favor, ingresa un método de pago válido.');
          return;
        }
        userStep.expenseData.paymentMethod = paymentMethod;
        if (paymentMethod.toLowerCase().includes('tarjeta')) {
          // userStep.step = 5;
          // await ctx.reply('¿A cuántas cuotas diferiste el pago?');
          // return;
          const userCards = await CardHandler.listUserCards(ctx);
          if (userCards.length === 0) {
            await ctx.reply(
              'No tienes tarjetas registradas. Por favor, registra una tarjeta primero.',
              Markup.removeKeyboard(),
            );
            userSteps.delete(telegramId);
            return;
          }
          await ctx.reply(
            '💳 Selecciona una tarjeta:',
            Markup.inlineKeyboard([
              ...userCards.map((card) => [
                {
                  text: `💳 ${card.card_number} (${card.card_type})`,
                  callback_data: `select_card_${card.id}`,
                },
              ]),
              [{ text: '❌ Cancelar', callback_data: 'cancel' }],
            ]),
          );
          userStep.step = 9;
          return;
        }
        userStep.step = 8;
        await ctx.reply(
          '¿El gasto está pagado?',
          Markup.keyboard([['Sí'], ['No'], ['Cancelar']])
            .oneTime()
            .resize(),
        );
        break;

      case 4: //Finalizar y guardar gasto
        const dateInput = ctx.message.text.trim();
        const date = new Date(dateInput);
        console.log('Fecha ingresada:', dateInput, 'Objeto Date:', date);
        if (isNaN(date.getTime())) {
          await ctx.reply(
            'Por favor, ingresa una fecha en formato YYYY-MM-DD.',
          );
          return;
        }

        userStep.expenseData.date = date;

        const dataToSave = {
          userId: telegramId,
          amount: userStep.expenseData.amount,
          category: userStep.expenseData.category,
          payment_method: userStep.expenseData.paymentMethod,
          number_of_installments:
            userStep.expenseData.numberOfInstallments || null,
          associated_card: userStep.expenseData.associatedCard || null,
          installment_value: userStep.expenseData.installmentValue || null,
          is_paid: userStep.expenseData.isPaid || false,
          description: userStep.expenseData.description || null,
          date: userStep.expenseData.date || null,
        };

        console.log('Datos del gasto a registrar:', dataToSave);

        const registeredExpense = await ExpenseHandler.addExpense(
          ctx,
          dataToSave,
        );
        console.log(registeredExpense.dataValues);
        const resData = registeredExpense.dataValues;

        await ctx.reply(
          `✅ Gasto agregado:\n💵 Monto: ${formatCurrency(
            resData.amount,
          )}\n🏷️ Categoría: ${
            resData.category
          }\n📅 Fecha: ${resData.date.toLocaleDateString(
            'es-CO',
          )}\n💳 Método de pago: ${resData.payment_method}\n${
            resData.is_paid ? '✅' : '❌'
          } Pagado: ${resData.is_paid ? 'Sí' : 'No'}\n🆔 ID del gasto: ${
            resData.id
          }`,
          Markup.removeKeyboard(),
        );

        userSteps.delete(telegramId);
        break;

      case 5: // Cuando es tarjeta, solicita número de cuotas
        const installments = parseInt(ctx.message.text);
        if (isNaN(installments) || installments <= 0) {
          await ctx.reply('Por favor, ingresa un número válido de cuotas.');
          return;
        }
        userStep.expenseData.numberOfInstallments = installments;
        userStep.step = 6;
        await ctx.reply(
          'Ingresa la fecha límite de pago de la tarjeta (formato YYYY-MM-DD).',
        );
        break;

      case 6: // Solicita una descripción del gasto.
        const paymentDayInput = ctx.message.text.trim();
        const paymentDay = new Date(paymentDayInput);
        if (isNaN(paymentDay.getTime())) {
          await ctx.reply(
            'Por favor, ingresa una fecha válida en formato YYYY-MM-DD.',
          );
          return;
        }
        userStep.expenseData.paymentDay = paymentDay.getDay();
        const installmentValue = calculateCreditCardInstalments(
          userStep.expenseData.amount,
          userStep.expenseData.numberOfInstallments,
          0.243, // Suponiendo una tasa de interés anual del 24.3%, se expresa como decimal o sea 0.243
        );
        userStep.expenseData.installmentValue = installmentValue;
        userStep.step = 7;
        await ctx.reply(
          `El valor de cada cuota es: ${formatCurrency(
            installmentValue,
          )}. Ahora, por favor ingresa una breve descripción del gasto.`,
        );
        break;

      case 7: // Confirma descripción y dirige al paso final (solicitud de fecha) en el case 4
        const description = ctx.message.text.trim();
        userStep.expenseData.description = description;
        userStep.step = 8;
        await ctx.reply(
          '¿El gasto está pagado?',
          Markup.keyboard([['Sí'], ['No'], ['Cancelar']])
            .oneTime()
            .resize(),
        );
        break;

      case 8: // Confirma si el gasto está pagado y pasa al paso final (validación de fecha) en el case 4
        console.log('Respuesta de pago:', ctx.message.text);
        const respuesta = ctx.message.text;
        if (respuesta === 'Sí') {
          userStep.expenseData.isPaid = true;
          userStep.step = 4;
          await ctx.reply(
            'Por favor, ingresa la fecha del gasto en formato YYYY-MM-DD.',
          );
        } else if (respuesta === 'No') {
          userStep.expenseData.isPaid = false;
          userStep.step = 4;
          await ctx.reply(
            'Por favor, ingresa la fecha del gasto en formato YYYY-MM-DD.',
          );
        } else {
          userSteps.delete(telegramId);
          await ctx.reply('❌ Operación cancelada.');
        }
        break;

      case 9: // Esperando selección de tarjeta
        // Los actions se manejan fuera del flujo de mensajes
        break;

      default:
        await ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo.');
        userSteps.delete(telegramId);
        break;
    }
  });

  // Manejar selección de tarjetas
  bot.action(/^select_card_(\d+)$/, async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId || !userSteps.has(telegramId)) {
      return;
    }

    const userStep = userSteps.get(telegramId);
    const cardId = ctx.match[1];
    const card = await CardHandler.getCardById(cardId);

    if (!card) {
      await ctx.reply('Tarjeta no encontrada.');
      return;
    }

    userStep.expenseData.associatedCard = card.get('id');

    if (card.get('card_type').toLowerCase() === 'crédito') {
      await ctx.reply(
        '¿A cuántas cuotas diferiste el pago? (Ingresa un número)',
      );
      userStep.step = 5;
    } else {
      await ctx.reply(
        '¿El gasto está pagado?',
        Markup.keyboard([['Sí'], ['No'], ['Cancelar']])
          .oneTime()
          .resize(),
      );
      userStep.step = 8;
    }

    await ctx.answerCbQuery();
  });

  bot.action('cancel', async (ctx) => {
    const telegramId = ctx.from?.id;
    if (telegramId && userSteps.has(telegramId)) {
      userSteps.delete(telegramId);
      await ctx.reply('❌ Operación cancelada.', Markup.removeKeyboard());
    }
    await ctx.answerCbQuery();
  });
};

export { addExpense };
