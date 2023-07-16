import { NestFactory } from "@nestjs/core";
import { AppModule } from "@src/app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    })
  );
  const config = new DocumentBuilder()
    .setTitle("Bill Split Service")
    .setDescription("Api documentation for bill split service apis")
    .setVersion("1.0")
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("/docs", app, document);
  const { PORT } = process.env;
  await app.listen(PORT);
  console.info(`Application is running on: ${await app.getUrl()}`);
  console.error = () => {
    return;
  };
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
