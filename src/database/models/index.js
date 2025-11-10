import { CardModel } from './Card.js';
import { ExpenseModel } from './Expense.js';
import { UserModel } from './User.js';

// Relación User -> Expense
UserModel.hasMany(ExpenseModel, { foreignKey: 'userId', as: 'expenses' });
ExpenseModel.belongsTo(UserModel, { foreignKey: 'userId', as: 'user' });

// Relación Card -> Expense
// CardModel.hasMany(ExpenseModel, { foreignKey: 'associated_card', as: 'expenses' });
// ExpenseModel.belongsTo(CardModel, {
//   foreignKey: 'associated_card',
//   as: 'card',
// });

export { CardModel, ExpenseModel, UserModel };
