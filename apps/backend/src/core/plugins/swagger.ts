// src/core/plugins/swagger.ts
import fp from "fastify-plugin";

export default fp(async (app) => {
  const { default: swagger } = await import("@fastify/swagger");
  const { default: swaggerUI } = await import("@fastify/swagger-ui");

  await app.register(swagger, {
    openapi: {
      info: {
        title: "EqueEngage API",
        description: "API documentation for EqueEngage system",
        version: "1.0.0",
        contact: { name: "API Support", email: "support@equeengage.com" },
        license: { name: "MIT" },
      },
      components: {
        securitySchemes: {
          cookieAuth: {
            type: "apiKey",
            in: "cookie",
            name: "ee_auth",
          },
        },
      },
    },
  });

  await app.register(swaggerUI, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      persistAuthorization: true,
    },
  });
});
