import { Telegraf } from 'telegraf';
import { registerBotCommands } from './bot/commands/botCommands.js';
import { connectToDatabase, sequelize } from './database/config/database.js';
import { UserHandler } from './bot/handlers/userHandler.js';
import { startWebServer } from './web/app/server.js';
import { addExpense, addExpenseFormFlow } from './bot/flows/addExpenseFlow.js';
import { ExpenseHandler } from './bot/handlers/expenseHandler.js';
import { addCardFlow } from './bot/flows/addCardFlow.js';
import { CardHandler } from './bot/handlers/cardHandler.js';
import {
  invoiceImgDataFlow,
  invoicePdfDataFlow,
} from './bot/flows/invoiceImgDataFlow.js';
import { checkOpenRouterAccount } from './services/aiService.js';
import './database/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

// Middleware para capturar TODOS los updates (debe ir primero)
// bot.use((ctx, next) => {
//   console.log('=== UPDATE RECIBIDO ===');
//   console.log('Tipo de update:', Object.keys(ctx.update));
//   console.log('Update completo:', JSON.stringify(ctx.update, null, 2));

//   if (ctx.update.message && ctx.update.message.web_app_data) {
//     console.log('WEB APP DATA ENCONTRADO EN MESSAGE!');
//     console.log('Web App Data:', ctx.update.message.web_app_data);
//   }

//   return next();
// });

bot.start((ctx) => {
  ctx.reply(
    '¡Hola! Soy tu bot de gastos. Usa /help para ver los comandos disponibles.',
  );
});

bot.help((ctx) => {
  ctx.reply(
    'Comandos básicos:\n/start\n/help\n\n [Documentación completa](https://gastos.juanvidev.com/)',
    {
      parse_mode: 'MarkdownV2',
    },
  );
});

registerBotCommands('hello', (ctx) => {
  const message = helloCommand();
  ctx.reply(message);
});

registerBotCommands('prueba_web', async (ctx) => {
  await ctx.reply('Haz clic en el botón para abrir el formulario:', {
    reply_markup: {
      keyboard: [
        [
          {
            text: '📝 Abrir Formulario',
            web_app: {
              url: 'https://cb2c62086615.ngrok-free.app/testForm.html',
            },
          },
        ],
      ],
      resize_keyboard: true,
      one_time_keyboard: false,
    },
  });
});

registerBotCommands('add_expense', async (ctx) => {
  // await ctx.reply('Iniciando flujo para agregar gasto...');
  addExpenseFormFlow(ctx);
});

registerBotCommands('check_models', async (ctx) => {
  const data = await checkOpenRouterAccount();
  ctx.reply(
    'Revisa la consola para ver los modelos disponibles y límites de cuenta.',
  );
});

registerBotCommands('check_models', async (ctx) => {
  const data = await checkOpenRouterAccount();
  ctx.reply(
    'Revisa la consola para ver los modelos disponibles y límites de cuenta.',
  );
});

registerBotCommands('procesar_factura', (ctx) => {
  invoiceImgDataFlow(ctx);
});

registerBotCommands('procesar_factura_pdf', (ctx) => {
  invoicePdfDataFlow(ctx);
});

registerBotCommands('registrarse', async (ctx) => {
  UserHandler.registerUser(ctx);
});

registerBotCommands('consultar_usuario', async (ctx) => {
  UserHandler.consultUser(ctx);
});

registerBotCommands('agregar_gasto', async (ctx) => {
  addExpense(ctx);
});

registerBotCommands('consultar_gastos', async (ctx) => {
  ExpenseHandler.consultExpenses(ctx);
});

registerBotCommands('agregar_tarjeta', async (ctx) => {
  addCardFlow(ctx);
});

registerBotCommands('consultar_tarjetas', async (ctx) => {
  CardHandler.listUserCards(ctx);
});

function helloCommand() {
  return 'Hello, World!';
}

(async () => {
  await connectToDatabase();

  // Crear tablas
  await sequelize.sync();
  console.log('Tablas creadas correctamente');

  // Iniciar servidor web
  startWebServer();

  bot.launch();
})();

console.log('Bot iniciado correctamente');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export { bot };
