import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BillableItemsService } from './billable-items.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('billable-items')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('billable-items')
export class BillableItemsController {
  constructor(private readonly billableItemsService: BillableItemsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'accountant')
  @ApiOperation({ summary: 'Liste tous les articles facturables' })
  findAll() {
    return this.billableItemsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary', 'accountant')
  @ApiOperation({ summary: 'Détail d\'un article' })
  findOne(@Param('id') id: string) {
    return this.billableItemsService.findOne(id);
  }

  @Post()
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Créer un nouvel article' })
  create(@Body() data: any) {
    return this.billableItemsService.create(data);
  }

  @Patch(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Modifier un article' })
  update(@Param('id') id: string, @Body() data: any) {
    return this.billableItemsService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin', 'accountant')
  @ApiOperation({ summary: 'Supprimer un article' })
  remove(@Param('id') id: string) {
    return this.billableItemsService.remove(id);
  }
}
