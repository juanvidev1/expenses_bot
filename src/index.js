import { Telegraf } from 'telegraf';
import { registerBotCommands } from './bot/commands/botCommands.js';
import { connectToDatabase, sequelize } from './database/config/database.js';
import { UserHandler } from './bot/handlers/userHandler.js';
import { startWebServer } from './web/app/server.js';
import { addExpense } from './bot/flows/addExpenseFlow.js';
import { ExpenseHandler } from './bot/handlers/expenseHandler.js';
import { addCardFlow } from './bot/flows/addCardFlow.js';
import { CardHandler } from './bot/handlers/cardHandler.js';
import { invoiceImgDataFlow } from './bot/flows/invoiceImgDataFlow.js';
import { checkOpenRouterAccount } from './services/aiService.js';
import './database/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const bot = new Telegraf(process.env.BOT_TOKEN);

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

registerBotCommands('check_models', async (ctx) => {
  const data = await checkOpenRouterAccount();
  ctx.reply(
    'Revisa la consola para ver los modelos disponibles y límites de cuenta.',
  );
});

registerBotCommands('procesar_factura', (ctx) => {
  invoiceImgDataFlow(ctx);
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
