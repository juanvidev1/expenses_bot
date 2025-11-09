import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

const ExpenseModel = sequelize.define('Expense', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'telegramId',
    },
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    enum: [
      'Comida',
      'Transporte',
      'Entretenimiento',
      'Salud',
      'Educación',
      'Ropa',
      'Otros',
    ],
  },
  payment_method: {
    type: DataTypes.STRING,
    allowNull: false,
    enum: ['Efectivo', 'Tarjeta', 'Transferencia', 'Otro'],
  },
  number_of_installments: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  associated_card: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Cards',
      key: 'id',
    },
  },
  installment_value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  date: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
});

export { ExpenseModel };
