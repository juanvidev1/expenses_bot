import {
  createExpense,
  findExpensesByUserId,
} from '#services/expenseService.js';
import { calculateTotal, formatCurrency } from '../../utils/index.js';

class ExpenseHandler {
  static async addExpense(expenseData) {
    const expense = await createExpense(expenseData);
    return expense;
  }

  static async consultExpenses(ctx) {
    const userExpenses = await findExpensesByUserId(ctx.from?.id);
    if (userExpenses.length > 0) {
      const expensesList = userExpenses.map((expense) => {
        const formattedDate = expense.get('date')
          ? expense.get('date').toLocaleDateString()
          : 'N/A';
        let newDt = new Date(expense.get('date'));
        newDt = `${
          newDt.getDate() > 10 ? newDt.getDate() : '0' + newDt.getDate()
        }/${
          newDt.getMonth() + 1 > 10
            ? newDt.getMonth() + 1
            : '0' + (newDt.getMonth() + 1)
        }/${newDt.getFullYear()}`;
        return `🆔: ${expense.get('id')}, 💵 Monto: ${formatCurrency(
          expense.get('amount'),
        )}, 💰 Valor con TC: ${formatCurrency(
          expense.get('credit_total_value'),
        )}, 📆 Fecha: ${newDt}, 🏷️ Categoría: ${expense.get('category')}`;
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

  static async getExpensesByUserId(userId) {
    const expenses = await findExpensesByUserId(userId);
    return expenses;
  }
}

export { ExpenseHandler };
