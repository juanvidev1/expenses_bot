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
    const expenses = await ExpenseModel.findAll({
      where: { userId },
    });
    const expensesWithCards = expenses.map(async (expense) => {
      const card = await CardModel.findOne({
        where: { id: expense.associated_card },
      });
      return Promise.resolve({ ...expense.toJSON(), card });
    });
    return Promise.all(expensesWithCards);
  } catch (error) {
    console.error('Error fetching expenses by user ID:', error);
    throw error;
  }
};

export { createExpense, findExpenseById, findExpensesByUserId };
