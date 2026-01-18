import { Module } from "@nestjs/common";
import { LoansService } from "./loans.service";
import { LoansController } from "./loans.controller";
import { ReturnsController } from "./returns.controller";
import { ReturnsService } from "./returns.service";
import { AssetsModule } from "../assets/assets.module";

@Module({
  imports: [AssetsModule],
  controllers: [LoansController, ReturnsController],
  providers: [LoansService, ReturnsService],
  exports: [LoansService, ReturnsService],
})
export class LoansModule {}
