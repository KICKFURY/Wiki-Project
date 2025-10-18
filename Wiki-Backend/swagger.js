// swagger.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Swagger
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Wiki Project API 🧠",
      version: "1.0.0",
      description: "Documentación de la API del Wiki Project",
      contact: {
        name: "Equipo Wiki Project",
        email: "contacto@wikiproject.com",
      },
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Servidor local de desarrollo",
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")], 
};

const swaggerSpec = swaggerJsdoc(options);

export default function swaggerDocs(app) {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .info hgroup.main a { display: none }
        body { background-color: #f5f7fa; }
      `,
      customSiteTitle: "Wiki API Docs",
    })
  );

  console.log("📘 Swagger disponible en: http://localhost:4000/api-docs");
}
