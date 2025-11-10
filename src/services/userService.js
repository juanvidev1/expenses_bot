import { UserModel } from '#database/models/index.js';

const createUser = async (userData) => {
  const user = await UserModel.create(userData);
  return user;
};

const findUserByTelegramId = async (telegramId) => {
  return await UserModel.findOne({ where: { telegramId } });
};

const updateUser = async (telegramId, updateData) => {
  return await UserModel.update(updateData, { where: { telegramId } });
};

export { createUser, findUserByTelegramId, updateUser };
