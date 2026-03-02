import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PractitionersService } from './practitioners.service';
import { CreatePractitionerDto } from './dto/create-practitioner.dto';
import { UpdatePractitionerDto } from './dto/update-practitioner.dto';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { CreateAbsenceDto } from './dto/create-absence.dto';
import { AvailabilityQueryDto } from './dto/availability-query.dto';
import { PractitionerResponseDto } from './dto/practitioner-response.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('practitioners')
@ApiBearerAuth()
@Controller('practitioners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PractitionersController {
  constructor(private readonly practitionersService: PractitionersService) {}

  // ==================== CRUD PRINCIPAL ====================

  @Get()
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: 'Liste tous les praticiens' })
  findAll(): Promise<PractitionerResponseDto[]> {
    return this.practitionersService.findAll();
  }

  @Get(':id')
  @Roles('admin', 'doctor', 'secretary', 'nurse')
  @ApiOperation({ summary: "Détail d'un praticien" })
  findOne(@Param('id') id: string): Promise<PractitionerResponseDto> {
    return this.practitionersService.findOne(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer un nouveau praticien' })
  create(
    @Body() createPractitionerDto: CreatePractitionerDto,
  ): Promise<PractitionerResponseDto> {
    return this.practitionersService.create(createPractitionerDto);
  }

  @Patch(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Modifier un praticien' })
  update(
    @Param('id') id: string,
    @Body() updatePractitionerDto: UpdatePractitionerDto,
  ): Promise<PractitionerResponseDto> {
    return this.practitionersService.update(id, updatePractitionerDto);
  }

  // ==================== HORAIRES ====================

  @Get(':id/schedule')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Récupérer les horaires d'un praticien" })
  getSchedules(@Param('id') id: string) {
    return this.practitionersService.getSchedules(id);
  }

  @Put(':id/schedule')
  @Roles('admin')
  @ApiOperation({ summary: "Mettre à jour les horaires d'un praticien" })
  updateSchedules(
    @Param('id') id: string,
    @Body() schedules: CreateScheduleDto[],
  ) {
    return this.practitionersService.updateSchedules(id, schedules);
  }

  // ==================== ABSENCES ====================

  @Get(':id/absences')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({ summary: "Récupérer les absences d'un praticien" })
  getAbsences(@Param('id') id: string) {
    return this.practitionersService.getAbsences(id);
  }

  @Post(':id/absences')
  @Roles('admin')
  @ApiOperation({ summary: 'Ajouter une absence pour un praticien' })
  addAbsence(
    @Param('id') id: string,
    @Body() createAbsenceDto: CreateAbsenceDto,
  ) {
    return this.practitionersService.addAbsence(id, createAbsenceDto);
  }

  @Delete(':id/absences/:absenceId')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer une absence' })
  removeAbsence(
    @Param('id') id: string,
    @Param('absenceId') absenceId: string,
  ) {
    return this.practitionersService.removeAbsence(id, absenceId);
  }

  // ==================== DISPONIBILITÉ ====================

  @Get(':id/availability')
  @Roles('admin', 'doctor', 'secretary')
  @ApiOperation({
    summary: "Vérifier la disponibilité d'un praticien pour une date",
  })
  getAvailability(
    @Param('id') id: string,
    @Query() query: AvailabilityQueryDto,
  ) {
    return this.practitionersService.getAvailability(id, query);
  }

  // ==================== GARDES ====================

  @Get(':id/guards')
  @Roles('admin', 'doctor')
  @ApiOperation({ summary: "Récupérer les gardes d'un praticien" })
  getGuards(@Param('id') id: string, @Query('month') month?: string) {
    return this.practitionersService.getGuards(id, month);
  }
}
