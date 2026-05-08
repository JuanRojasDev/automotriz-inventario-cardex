// Solo cargar .env en desarrollo local
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const express = require('express');
const cors = require('cors');
const { ApolloServer } = require('apollo-server-express');

const connectDB = require('./config/database');
const typeDefs = require('./graphql/typeDefs/index');
const resolvers = require('./graphql/resolvers/index');
const { getUsuarioDesdeToken } = require('./middlewares/auth');
const logger = require('./utils/logger');

const startServer = async () => {
  await connectDB();

  const app = express();

  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5173',
      /\.vercel\.app$/,
      /\.onrender\.com$/,
    ],
    credentials: true,
  }));

  // Health check (antes de Apollo para que no interfiera)
  app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

  // NO usar express.json() globalmente - Apollo Server maneja su propio body parsing

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }) => {
      try {
        const usuario = await getUsuarioDesdeToken(req);
        return { usuario };
      } catch (error) {
        return { usuario: null, authError: error.message };
      }
    },
    formatError: (error) => {
      logger.error('GraphQL Error', error.message);
      return {
        message: error.message,
        locations: error.locations,
        path: error.path,
      };
    },
    introspection: true,
    // Habilitar playground en desarrollo
    playground: process.env.NODE_ENV !== 'production',
  });

  await server.start();
  server.applyMiddleware({ app, path: '/graphql', cors: false });

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    logger.info(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    logger.info(`📊 GraphQL Playground: http://localhost:${PORT}/graphql`);
  });
};

startServer().catch((err) => {
  logger.error('Error iniciando servidor', err);
  process.exit(1);
});
