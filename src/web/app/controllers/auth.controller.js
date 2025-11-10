import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export class AuthController {
  static createToken = (req, res) => {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: 'User ID is required to create a token.' });
    }

    const token = jwt.sign({ id: userId }, process.env.SECRET_KEY, {
      expiresIn: '1h',
    });

    res.status(200).json({ auth: true, token, expiresIn: 3600 });
  };
}
