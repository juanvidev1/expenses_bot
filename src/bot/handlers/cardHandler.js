import { CardService } from '../../services/cardService.js';

class CardHandler {
  static async addCard(cardData) {
    const card = await CardService.createCard(cardData);
    return card;
  }

  static async listUserCards(ctx) {
    const userId = ctx.from?.id;
    const userCards = await CardService.getCardsByUserId(userId);
    if (userCards.length > 0) {
      const cardsList = userCards.map((card) => {
        return `🆔: ${card.get('id')}, 💳 Número: ${card.get(
          'card_number',
        )}, 🏦 Tipo: ${card.get('card_type')}, 🔖 Marca: ${card.get(
          'card_brand',
        )}`;
      });

      ctx.reply(`💳 Tus tarjetas:\n${cardsList.join('\n')}`);
      return userCards.map(card => ({
        id: card.get('id'),
        card_number: card.get('card_number'),
        card_type: card.get('card_type'),
        card_brand: card.get('card_brand')
      }));
    } else {
      ctx.reply('📋 No tienes tarjetas registradas.');
      return [];
    }
  }

  static async getCardById(cardId) {
    const card = await CardService.getCardById(cardId);
    return card;
  }

  static async updateCard(ctx, cardId, updatedData) {
    const updatedCard = await CardService.updateCard(cardId, updatedData);
    return updatedCard;
  }

  static async deleteCard(ctx, cardId) {
    const deletedCard = await CardService.deleteCard(cardId);
    return deletedCard;
  }
}

export { CardHandler };
