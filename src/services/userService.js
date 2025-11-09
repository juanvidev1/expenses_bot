import { UserModel } from '../database/models/User.js';

const createUser = async (userData) => {
  const user = await UserModel.create(userData);
  return user;
};

const findUserByTelegramId = async (telegramId) => {
  return await UserModel.findOne({ where: { telegramId } });
};

export { createUser, findUserByTelegramId };
