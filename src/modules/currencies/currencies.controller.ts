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
import { CurrenciesService } from './currencies.service';
import {
  CreateCurrencyDto,
  UpdateCurrencyDto,
  CurrencyResponseDto,
} from './dto/create-currency.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('currencies')
@ApiBearerAuth()
@Controller('currencies')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CurrenciesController {
  constructor(private readonly currenciesService: CurrenciesService) {}

  @Get()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Liste toutes les devises' })
  findAll(@Query('active') active?: string): Promise<CurrencyResponseDto[]> {
    const activeOnly = active === 'true';
    return this.currenciesService.findAll(activeOnly);
  }

  @Get('default')
  @Roles('admin', 'accountant', 'secretary')
  @ApiOperation({ summary: 'Récupérer la devise par défaut' })
  getDefault(): Promise<CurrencyResponseDto> {
    return this.currenciesService.getDefault();
  }

  @Get('code/:code')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Récupérer une devise par son code' })
  findByCode(@Param('code') code: string): Promise<CurrencyResponseDto> {
    return this.currenciesService.findByCode(code);
  }

  @Get(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: "Détail d'une devise" })
  findOne(@Param('id') id: string): Promise<CurrencyResponseDto> {
    return this.currenciesService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une nouvelle devise' })
  create(
    @Body() createCurrencyDto: CreateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    return this.currenciesService.create(createCurrencyDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier une devise' })
  update(
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    return this.currenciesService.update(id, updateCurrencyDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une devise' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.currenciesService.delete(id);
  }
}
