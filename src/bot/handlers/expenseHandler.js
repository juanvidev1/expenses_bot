import {
  createExpense,
  findExpensesByUserId,
} from '#services/expenseService.js';
import { calculateTotal, formatCurrency } from '#utils/index.js';

class ExpenseHandler {
  static async addExpense(expenseData) {
    const expense = await createExpense(expenseData);
    return expense;
  }

  static async consultExpenses(ctx) {
    const userExpenses = await findExpensesByUserId(ctx.from?.id);
    // console.log('userExpenses:', userExpenses);
    if (userExpenses.length > 0) {
      const expensesList = userExpenses.map((expense) => {
        const formattedDate = expense.date
          ? expense.date.toLocaleDateString()
          : 'N/A';
        let newDt = new Date(expense.date);
        newDt = `${
          newDt.getDate() > 10 ? newDt.getDate() : '0' + newDt.getDate()
        }/${
          newDt.getMonth() + 1 > 10
            ? newDt.getMonth() + 1
            : '0' + (newDt.getMonth() + 1)
        }/${newDt.getFullYear()}`;
        return `🆔: ${expense.id}, 💵 Monto: ${formatCurrency(
          expense.amount,
        )}, 💰 Valor con TC: ${formatCurrency(
          expense.credit_total_value,
        )}, 📆 Fecha: ${newDt}, 🏷️ Categoría: ${expense.category}`;
      });
      const total = calculateTotal(
        userExpenses.map((expense) =>
          expense.credit_total_value
            ? expense.credit_total_value
            : expense.amount,
        ),
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
    const totalValue = calculateTotal(
      expenses.map((expense) =>
        expense.credit_total_value
          ? expense.credit_total_value
          : expense.amount,
      ),
    );
    console.log(`Total expenses value for user ${userId}: ${totalValue}`);
    return { expenses, totalValue };
  }
}

export { ExpenseHandler };
