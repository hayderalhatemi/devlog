import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DevLog API',
      version: '1.0.0',
      description:
        'API documentation for the DevLog issue tracking application',
    },

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    servers: [
      {
        url: 'https://devlog-api-10nk.onrender.com',
        description: 'Production',
      },
      {
        url: 'http://localhost:3001',
        description: 'Local development',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
