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
    } else {
      ctx.reply('📋 No tienes tarjetas registradas.');
    }
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
