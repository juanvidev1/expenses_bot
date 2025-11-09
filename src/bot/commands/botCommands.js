import { bot } from '../../index.js';

const registerBotCommands = (commandName, commandHandler) => {
  bot.command(commandName, (ctx) => {
    commandHandler(ctx);
  });
};

export { registerBotCommands };
