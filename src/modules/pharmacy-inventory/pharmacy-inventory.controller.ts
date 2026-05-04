import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PharmacyInventoryService } from './pharmacy-inventory.service';
import { Permissions } from '../../common/decorators/permissions.decorator';

@ApiTags('pharmacy-inventory')
@ApiBearerAuth()
@Controller('pharmacy-inventory')
export class PharmacyInventoryController {
  constructor(private readonly service: PharmacyInventoryService) {}

  @Get()
  @Permissions('pharmacy.view')
  @ApiOperation({ summary: 'Liste du stock pharmacie' })
  findAll() {
    return this.service.findAll();
  }
  
  @Get('alerts')
  @Permissions('pharmacy.view')
  @ApiOperation({ summary: 'Récupérer les alertes de stock et péremption' })
  getAlerts() {
    return this.service.getAlerts();
  }

  @Post()
  @Permissions('pharmacy.manage')
  @ApiOperation({ summary: 'Ajouter un nouvel article' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Patch(':id/stock')
  @Permissions('pharmacy.manage')
  @ApiOperation({ summary: 'Ajuster le stock avec enregistrement du mouvement' })
  updateStock(
    @Param('id') id: string, 
    @Body() body: { quantity: number, type?: any, reason?: string, user_id?: string },
  ) {
    return this.service.updateStock(id, body.quantity, body.type, body.reason, body.user_id);
  }

  @Get('movements')
  @Permissions('pharmacy.view')
  @ApiOperation({ summary: 'Historique de tous les mouvements de stock' })
  findAllMovements() {
    return this.service.findAllMovements();
  }

  @Get(':id/movements')
  @Permissions('pharmacy.view')
  @ApiOperation({ summary: 'Historique des mouvements pour un article' })
  findMovementsByItem(@Param('id') id: string) {
    return this.service.findMovementsByItem(id);
  }

  @Post('run-automation')
  @Permissions('pharmacy.manage')
  @ApiOperation({ summary: 'Lancer manuellement les alertes et commandes auto' })
  runAutomation() {
    return this.service.runInventoryAutomation();
  }
}

