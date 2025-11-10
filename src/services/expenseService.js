import { CardModel } from '#src/database/models/Card.js';
import { ExpenseModel } from '../database/models/Expense.js';

const createExpense = async (expenseData) => {
  try {
    const expense = await ExpenseModel.create(expenseData);
    return expense;
  } catch (error) {
    console.error('Error creating expense:', error);
    throw error;
  }
};

const findExpenseById = async (id) => {
  try {
    return await ExpenseModel.findOne({ where: { id } });
  } catch (error) {
    console.error('Error fetching expense by ID:', error);
    throw error;
  }
};

const findExpensesByUserId = async (userId) => {
  try {
    return await ExpenseModel.findAll({
      where: { userId },
      include: { model: CardModel, as: 'card' },
    });
  } catch (error) {
    console.error('Error fetching expenses by user ID:', error);
    throw error;
  }
};

export { createExpense, findExpenseById, findExpensesByUserId };
