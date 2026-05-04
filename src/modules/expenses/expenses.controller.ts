import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Post()
  @Roles('admin', 'accountant')
  create(@Body() createExpenseDto: any) {
    return this.expensesService.create(createExpenseDto);
  }

  @Get()
  @Roles('admin', 'accountant', 'manager')
  findAll() {
    return this.expensesService.findAll();
  }

  @Get('summary')
  @Roles('admin', 'accountant', 'manager')
  getSummary() {
    return this.expensesService.getSummary();
  }

  @Get(':id')
  @Roles('admin', 'accountant', 'manager')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'accountant')
  update(@Param('id') id: string, @Body() updateExpenseDto: any) {
    return this.expensesService.update(id, updateExpenseDto);
  }

  @Delete(':id')
  @Roles('admin', 'accountant')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
