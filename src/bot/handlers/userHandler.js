import { createUser, findUserByTelegramId } from '../../services/userService.js';

class UserHandler {
  static async registerUser(ctx) {
    const telegramId = ctx.from?.id;
    const name = `${ctx.from?.first_name} ${ctx.from?.last_name}` || 'Usuario';
    const username = ctx.from?.username || null;

    if (!telegramId) {
      ctx.reply('No se pudo obtener tu ID de Telegram.');
      return;
    }

    const userData = {
      telegramId,
      name,
      username,
    };

    const user = await createUser(userData);
    ctx.reply(
      `Usuario registrado: ${user.get('name')} (ID: ${user.get('telegramId')})`,
    );
  }

  static async consultUser(ctx) {
    const telegramId = ctx.from?.id;

    if (!telegramId) {
      ctx.reply('No se pudo obtener tu ID de Telegram.');
      return;
    }

    const user = await findUserByTelegramId(telegramId);

    if (user) {
      ctx.reply(
        `Usuario encontrado: ${user.get('name')} (ID: ${user.get(
          'telegramId',
        )})`,
      );
    } else {
      ctx.reply('Usuario no encontrado. Por favor, regístrate primero.');
    }
  }

  static async getUserIdByTelegramId(telegramId) {
    const user = await findUserByTelegramId(telegramId);
    return user ? user.get('id') : null;
  }
}

export { UserHandler };
