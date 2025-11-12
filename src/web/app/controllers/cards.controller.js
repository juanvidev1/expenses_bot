import { CardService } from '#src/services/cardService.js';

export class CardsController {
  static async listUserCards(req, res) {
    try {
      const userId = req.params.userId;
      const cards = await CardService.getCardsByUserId(userId);
      res.status(200).json({ cards });
    } catch (error) {
      console.error('Error fetching user cards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}
