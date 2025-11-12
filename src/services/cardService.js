import { CardModel } from '../database/models/Card.js';

export class CardService {
  static async createCard(card) {
    const createdCard = await CardModel.create(card);
    return createdCard;
  }

  static async getCards() {
    try {
      const cards = await CardModel.findAll();
      return cards;
    } catch (error) {
      console.error('Error fetching cards:', error);
      throw error;
    }
  }

  static async getCardsByUserId(userId) {
    try {
      const cards = await CardModel.findAll({ where: { userId } });
      return cards;
    } catch (error) {
      console.error('Error fetching cards by user ID:', error);
      throw error;
    }
  }

  static async getCardById(id) {
    try {
      const card = await CardModel.findByPk(id);
      return card;
    } catch (error) {
      console.error('Error fetching card by ID:', error);
      throw error;
    }
  }

  static async getCardByNumber(card_number) {
    try {
      const card = await CardModel.findOne({ where: { card_number } });
      return card;
    } catch (error) {
      console.error('Error fetching card by number:', error);
      throw error;
    }
  }

  static async updateCard(id, card) {
    try {
      const updatedCard = await CardModel.findByIdAndUpdate(id, card, {
        new: true,
      });
      return updatedCard;
    } catch (error) {
      console.error('Error updating card:', error);
      throw error;
    }
  }

  static async deleteCard(id) {
    try {
      const deletedCard = await CardModel.findByIdAndDelete(id);
      return deletedCard;
    } catch (error) {
      console.error('Error deleting card:', error);
      throw error;
    }
  }
}
