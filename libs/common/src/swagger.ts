import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';

type SwaggerBaseConfig = Omit<OpenAPIObject, 'paths'>;

interface Document {
  path: string;
  config: SwaggerBaseConfig;
  module: any;
}

const documents: Document[] = [];

export const setupSwaggerDocument =
  (path: string, config: SwaggerBaseConfig) => (module: any) =>
    documents.push({ path, config, module });

export const setupSwaggerDocuments = (app: any, deepScanRoutes?: boolean) =>
  documents.forEach(({ path, config, module }) => {
    SwaggerModule.setup(
      `docs/${path}`,
      app,
      SwaggerModule.createDocument(app, config, {
        include: [module],
        deepScanRoutes: deepScanRoutes ?? false,
      }),
    );
  });
