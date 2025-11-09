import { Markup } from 'telegraf';
import { bot } from '../../index.js';
import { ExpenseHandler } from '../handlers/expenseHandler.js';
import { UserHandler } from '../handlers/userHandler.js';
import {
  formatCurrency,
  calculateCreditCardInstalments,
} from '../../utils/index.js';

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
          userStep.step = 5;
          await ctx.reply('¿A cuántas cuotas diferiste el pago?');
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

        console.log('Datos del gasto a registrar:', userStep.expenseData);

        const dataToSave = {
          userId: telegramId,
          amount: userStep.expenseData.amount,
          category: userStep.expenseData.category,
          payment_method: userStep.expenseData.paymentMethod,
          number_of_installments:
            userStep.expenseData.numberOfInstallments || null,
          payment_day: userStep.expenseData.paymentDay || null,
          installment_value: userStep.expenseData.installmentValue || null,
          is_paid: userStep.expenseData.isPaid || false,
          description: userStep.expenseData.description || null,
          date: userStep.expenseData.date || null,
        };

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

      case 6:
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

      case 7:
        const description = ctx.message.text.trim();
        userStep.expenseData.description = description;
        ctx.reply(
          'Descripción guardada. Ahora, por favor ingresa la fecha del gasto (formato YYYY-MM-DD).',
        );
        userStep.step = 4;
        break;

      case 8:
        console.log('Respuesta de pago:', ctx.message.text);
        const respuesta = ctx.message.text;
        if (respuesta === 'Sí') {
          userStep.expenseData.isPaid = true;
          userStep.step = 7;
          await ctx.reply(
            'Por favor, ingresa una fecha en formato YYYY-MM-DD.',
          );
        } else if (respuesta === 'No') {
          userStep.expenseData.isPaid = false;
          userStep.step = 7;
          await ctx.reply(
            'Por favor, ingresa una fecha en formato YYYY-MM-DD.',
          );
        } else {
          userSteps.delete(telegramId);
          await ctx.reply('❌ Operación cancelada.');
        }
        break;

      default:
        await ctx.reply('Ha ocurrido un error. Por favor, intenta de nuevo.');
        userSteps.delete(telegramId);
        break;
    }
  });
};

export { addExpense };
