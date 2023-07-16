import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "@src/app.controller";
import { SplitModule } from "@src/split/split.module";
import configuration from "@src/common/config/configuration";
import { transformAndValidateSync } from "class-transformer-validator";
import { EnvironmentVariables } from "@src/common/config/env.validation";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    SplitModule,
  ],
  providers: [
    {
      provide: EnvironmentVariables,
      useValue: transformAndValidateSync(EnvironmentVariables, process.env),
    },
  ],
  controllers: [AppController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {}
}
