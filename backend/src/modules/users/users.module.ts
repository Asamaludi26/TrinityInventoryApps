import { Module } from "@nestjs/common";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { DivisionsController } from "./divisions.controller";
import { DivisionsService } from "./divisions.service";

@Module({
  controllers: [UsersController, DivisionsController],
  providers: [UsersService, DivisionsService],
  exports: [UsersService, DivisionsService],
})
export class UsersModule {}
