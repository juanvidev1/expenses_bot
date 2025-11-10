import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

export const CardModel = sequelize.define('Card', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'telegramId',
    },
  },
  card_number: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  card_type: {
    type: DataTypes.STRING,
    allowNull: false,
    enum: ['debit', 'credit', 'débito', 'crédito'],
  },
  card_brand: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  card_holder_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  expiration_date: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  cutoff_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  payment_day: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

// Association will be defined in the main database setup
