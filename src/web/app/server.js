import express from 'express';
import path from 'path';
import { router } from './routes.js';

const app = express();
const PORT = process.env.PORT || 3050;
const isLinux = process.env.IS_LINUX === true || process.env.IS_LINUX === 'true' ? true : false;

// Ruta absoluta hardcodeada para evitar problemas
const publicPath = '/home/juanvidev/expenses_bot/src/web/public';

console.log('Usando publicPath:', publicPath);

app.use(express.static(publicPath));
app.use(express.json());

app.get('/', (req, res) => {
  const indexPath = path.join(publicPath, 'index.html');
  console.log('Sirviendo archivo:', indexPath);
  res.sendFile(indexPath);
});

app.use('/api', router);

const startWebServer = () => {
  app.listen(PORT, () => {
    console.log('isLinux:', isLinux);
    console.log(`Servidor web ejecutándose en http://localhost:${PORT}`);
    console.log(`Archivos estáticos desde: ${publicPath}`);
  });
};

export { startWebServer };
