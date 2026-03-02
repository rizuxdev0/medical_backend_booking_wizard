import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
} from './dto/create-department.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('departments')
@ApiBearerAuth()
@Controller('departments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: 'Liste tous les départements' })
  findAll(): Promise<DepartmentResponseDto[]> {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Détail d'un département" })
  findOne(@Param('id') id: string): Promise<DepartmentResponseDto> {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer un département' })
  create(
    @Body() createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.create(createDepartmentDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier un département' })
  update(
    @Param('id') id: string,
    @Body() updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    return this.departmentsService.update(id, updateDepartmentDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un département' })
  delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.departmentsService.delete(id);
  }
}
