import { Controller, Get, Post, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PharmacyInventoryService } from './pharmacy-inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('pharmacy-inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('pharmacy-inventory')
export class PharmacyInventoryController {
  constructor(private readonly service: PharmacyInventoryService) {}

  @Get()
  @Roles('admin', 'pharmacist', 'doctor')
  @ApiOperation({ summary: 'Liste du stock pharmacie' })
  findAll() {
    return this.service.findAll();
  }

  @Post()
  @Roles('admin', 'pharmacist')
  @ApiOperation({ summary: 'Ajouter un nouvel article' })
  create(@Body() data: any) {
    return this.service.create(data);
  }

  @Patch(':id/stock')
  @Roles('admin', 'pharmacist')
  @ApiOperation({ summary: 'Ajouter/Retirer du stock (Livraison)' })
  updateStock(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.service.updateStock(id, quantity);
  }

  @Post('run-automation')
  @Roles('admin', 'pharmacist')
  @ApiOperation({ summary: 'Lancer manuellement les alertes et commandes auto' })
  runAutomation() {
    return this.service.runInventoryAutomation();
  }
}
