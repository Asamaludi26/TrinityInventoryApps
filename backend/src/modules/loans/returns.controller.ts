import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ReturnsService } from "./returns.service";
import { CreateReturnDto } from "./dto/create-return.dto";
import { ProcessReturnDto } from "./dto/process-return.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { UserRole } from "@prisma/client";

@Controller("returns")
@UseGuards(JwtAuthGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Post()
  create(@Body() dto: CreateReturnDto) {
    return this.returnsService.create(dto);
  }

  @Get()
  findAll(@Query("loanRequestId") loanRequestId?: string) {
    return this.returnsService.findAll(loanRequestId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.returnsService.findOne(id);
  }

  @Post(":id/process")
  @UseGuards(RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN_LOGISTIK)
  @HttpCode(HttpStatus.OK)
  process(
    @Param("id") id: string,
    @Body() dto: ProcessReturnDto,
    @CurrentUser("name") userName: string,
  ) {
    return this.returnsService.processReturn(id, dto, userName);
  }
}
