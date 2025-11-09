import {
  createExpense,
  findExpensesByUserId,
} from '../../services/expenseService.js';
import { calculateTotal, formatCurrency } from '../../utils/index.js';

class ExpenseHandler {
  static async addExpense(ctx, expenseData) {
    const expense = await createExpense(expenseData);
    return expense;
  }

  static async consultExpenses(ctx) {
    const userExpenses = await findExpensesByUserId(ctx.from?.id);
    if (userExpenses.length > 0) {
      const expensesList = userExpenses.map((expense) => {
        return `🆔: ${expense.get('id')}, 💵 Monto: ${formatCurrency(
          expense.get('amount'),
        )}, 🏷️ Categoría: ${expense.get('category')}`;
      });
      const total = calculateTotal(
        userExpenses.map((expense) => expense.get('amount')),
      );

      ctx.reply(
        `💰 Tus gastos:\n${expensesList.join(
          '\n',
        )}\n\n💵 Total: ${formatCurrency(total)}`,
      );
    } else {
      ctx.reply('📋 No tienes gastos registrados.');
    }
  }
}

export { ExpenseHandler };
