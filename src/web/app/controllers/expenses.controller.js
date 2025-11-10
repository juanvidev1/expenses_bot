import { ExpenseHandler } from '#bot/handlers/expenseHandler.js';

class ExpensesController {
  static async getExpenses(req, res) {
    const { userId } = req.query;

    if (!userId) {
      return res.status(404).json({ message: 'User not found' });
    }

    const expenses = await ExpenseHandler.getExpensesByUserId(userId);

    const totalValue = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    console.log(`Total expenses value for user ${userId}: ${totalValue}`);

    if (!expenses || expenses.length === 0) {
      return res
        .status(404)
        .json({ message: 'No expenses found for this user' });
    }

    return res.status(200).json({ expenses, totalValue });
  }
}

export { ExpensesController };
