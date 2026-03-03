// import {
//   Controller,
//   Get,
//   Post,
//   Body,
//   Patch,
//   Param,
//   Delete,
//   UseGuards,
//   Query,
// } from '@nestjs/common';
// import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// import { GuardsService } from './guards.service';
// import {
//   CreateGuardDto,
//   UpdateGuardDto,
//   GuardQueryDto,
//   GuardResponseDto,
// } from './dto/create-guard.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';

// @ApiTags('guards')
// @ApiBearerAuth()
// @Controller('guards')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class GuardsController {
//   constructor(private readonly guardsService: GuardsService) {}

//   @Get()
//   @Roles('admin', 'doctor')
//   @ApiOperation({ summary: 'Liste des gardes' })
//   findAll(@Query() query: GuardQueryDto): Promise<GuardResponseDto[]> {
//     return this.guardsService.findAll(query);
//   }

//   @Get(':id')
//   @Roles('admin', 'doctor')
//   @ApiOperation({ summary: "Détail d'une garde" })
//   findOne(@Param('id') id: string): Promise<GuardResponseDto> {
//     return this.guardsService.findOne(id);
//   }

//   @Post()
//   @Roles('admin')
//   @ApiOperation({ summary: 'Créer une garde' })
//   create(@Body() createGuardDto: CreateGuardDto): Promise<GuardResponseDto> {
//     return this.guardsService.create(createGuardDto);
//   }

//   @Patch(':id')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Modifier une garde' })
//   update(
//     @Param('id') id: string,
//     @Body() updateGuardDto: UpdateGuardDto,
//   ): Promise<GuardResponseDto> {
//     return this.guardsService.update(id, updateGuardDto);
//   }

//   @Delete(':id')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Supprimer une garde' })
//   delete(@Param('id') id: string): Promise<{ message: string }> {
//     return this.guardsService.delete(id);
//   }
// }
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GuardsService } from './guards.service';
import {
  CreateGuardDto,
  UpdateGuardDto,
  GuardResponseDto,
} from './dto/create-guard.dto';
import { GuardQueryDto } from './dto/guard-query.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('guards')
@ApiBearerAuth()
@Controller('guards')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GuardsController {
  constructor(private readonly guardsService: GuardsService) {}

  @Get()
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: 'Liste des gardes avec filtres (mois, praticien)' })
  findAll(@Query() query: GuardQueryDto): Promise<GuardResponseDto[]> {
    return this.guardsService.findAll(query);
  }

  @Get(':id')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: "Détail d'une garde" })
  findOne(@Param('id') id: string): Promise<GuardResponseDto> {
    return this.guardsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une garde' })
  create(@Body() createGuardDto: CreateGuardDto): Promise<GuardResponseDto> {
    return this.guardsService.create(createGuardDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier une garde' })
  update(
    @Param('id') id: string,
    @Body() updateGuardDto: UpdateGuardDto,
  ): Promise<GuardResponseDto> {
    return this.guardsService.update(id, updateGuardDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une garde' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.guardsService.delete(id);
  }
}
