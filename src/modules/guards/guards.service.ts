// import {
//   Injectable,
//   NotFoundException,
//   BadRequestException,
// } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, Between } from 'typeorm';
// import { PractitionerGuard } from '../practitioners/entities/practitioner-guard.entity';
// import { Practitioner } from '../practitioners/entities/practitioner.entity';
// import {
//   CreateGuardDto,
//   UpdateGuardDto,
//   GuardQueryDto,
//   GuardResponseDto,
// } from './dto/create-guard.dto';

// @Injectable()
// export class GuardsService {
//   constructor(
//     @InjectRepository(PractitionerGuard)
//     private guardRepo: Repository<PractitionerGuard>,
//     @InjectRepository(Practitioner)
//     private practitionerRepo: Repository<Practitioner>,
//   ) {}

//   async findAll(query: GuardQueryDto): Promise<GuardResponseDto[]> {
//     const { practitioner_id, month, from_date, to_date } = query;

//     const whereCondition: any = {};

//     if (practitioner_id) {
//       whereCondition.practitionerId = practitioner_id;
//     }

//     if (from_date && to_date) {
//       whereCondition.guardDate = Between(from_date, to_date);
//     } else if (month) {
//       const [year, monthNum] = month.split('-');
//       const startDate = `${year}-${monthNum}-01`;
//       const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
//         .toISOString()
//         .split('T')[0];
//       whereCondition.guardDate = Between(startDate, endDate);
//     }

//     const guards = await this.guardRepo.find({
//       where: whereCondition,
//       order: { guardDate: 'ASC' },
//       relations: ['practitioner'],
//     });

//     return guards.map((g) => this.mapToResponse(g));
//   }

//   async findOne(id: string): Promise<GuardResponseDto> {
//     const guard = await this.guardRepo.findOne({
//       where: { id },
//       relations: ['practitioner'],
//     });

//     if (!guard) {
//       throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
//     }

//     return this.mapToResponse(guard);
//   }

//   async create(createGuardDto: CreateGuardDto): Promise<GuardResponseDto> {
//     // Vérifier que le praticien existe
//     const practitioner = await this.practitionerRepo.findOne({
//       where: { id: createGuardDto.practitioner_id },
//     });

//     if (!practitioner) {
//       throw new NotFoundException(
//         `Praticien avec l'ID ${createGuardDto.practitioner_id} non trouvé`,
//       );
//     }

//     // Vérifier s'il n'y a pas déjà une garde pour ce praticien à cette date
//     const existing = await this.guardRepo.findOne({
//       where: {
//         practitionerId: createGuardDto.practitioner_id,
//         guardDate: createGuardDto.guard_date,
//       },
//     });

//     if (existing) {
//       throw new BadRequestException(
//         'Ce praticien a déjà une garde à cette date',
//       );
//     }

//     const guardData: Partial<PractitionerGuard> = {
//       practitionerId: createGuardDto.practitioner_id,
//       guardDate: createGuardDto.guard_date,
//       guardType: createGuardDto.guard_type || 'night',
//     };

//     if (createGuardDto.start_time) {
//       guardData.startTime = createGuardDto.start_time;
//     }

//     if (createGuardDto.end_time) {
//       guardData.endTime = createGuardDto.end_time;
//     }

//     if (createGuardDto.notes) {
//       guardData.notes = createGuardDto.notes;
//     }

//     const guard = this.guardRepo.create(guardData);
//     await this.guardRepo.save(guard);

//     const savedGuard = await this.guardRepo.findOne({
//       where: { id: guard.id },
//       relations: ['practitioner'],
//     });

//     return this.mapToResponse(savedGuard);
//   }

//   async update(
//     id: string,
//     updateGuardDto: UpdateGuardDto,
//   ): Promise<GuardResponseDto> {
//     const guard = await this.guardRepo.findOne({
//       where: { id },
//     });

//     if (!guard) {
//       throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
//     }

//     // Vérifier le praticien si modifié
//     if (
//       updateGuardDto.practitioner_id &&
//       updateGuardDto.practitioner_id !== guard.practitionerId
//     ) {
//       const practitioner = await this.practitionerRepo.findOne({
//         where: { id: updateGuardDto.practitioner_id },
//       });
//       if (!practitioner) {
//         throw new NotFoundException('Praticien non trouvé');
//       }
//     }

//     // Vérifier les conflits de date
//     if (
//       updateGuardDto.guard_date &&
//       updateGuardDto.guard_date !== guard.guardDate
//     ) {
//       const existing = await this.guardRepo.findOne({
//         where: {
//           practitionerId:
//             updateGuardDto.practitioner_id || guard.practitionerId,
//           guardDate: updateGuardDto.guard_date,
//         },
//       });
//       if (existing && existing.id !== id) {
//         throw new BadRequestException(
//           'Ce praticien a déjà une garde à cette date',
//         );
//       }
//     }

//     const updateData: Partial<PractitionerGuard> = {};

//     if (updateGuardDto.practitioner_id !== undefined) {
//       updateData.practitionerId = updateGuardDto.practitioner_id;
//     }

//     if (updateGuardDto.guard_date !== undefined) {
//       updateData.guardDate = updateGuardDto.guard_date;
//     }

//     if (updateGuardDto.start_time !== undefined) {
//       updateData.startTime = updateGuardDto.start_time;
//     }

//     if (updateGuardDto.end_time !== undefined) {
//       updateData.endTime = updateGuardDto.end_time;
//     }

//     if (updateGuardDto.guard_type !== undefined) {
//       updateData.guardType = updateGuardDto.guard_type;
//     }

//     if (updateGuardDto.notes !== undefined) {
//       updateData.notes = updateGuardDto.notes;
//     }

//     if (Object.keys(updateData).length > 0) {
//       await this.guardRepo.update(id, updateData);
//     }

//     const updated = await this.guardRepo.findOne({
//       where: { id },
//       relations: ['practitioner'],
//     });

//     return this.mapToResponse(updated);
//   }

//   async delete(id: string): Promise<{ message: string }> {
//     const guard = await this.guardRepo.findOne({
//       where: { id },
//     });

//     if (!guard) {
//       throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
//     }

//     await this.guardRepo.remove(guard);
//     return { message: 'Garde supprimée avec succès' };
//   }

//   private mapToResponse(guard: PractitionerGuard): GuardResponseDto {
//     const response: GuardResponseDto = {
//       id: guard.id,
//       practitioner_id: guard.practitionerId,
//       guard_date: guard.guardDate,
//       start_time: guard.startTime,
//       end_time: guard.endTime,
//       guard_type: guard.guardType,
//       notes: guard.notes || null,
//       created_at: guard.createdAt,
//       updated_at: guard.updatedAt,
//     };

//     if (guard.practitioner) {
//       response.practitioner = {
//         id: guard.practitioner.id,
//         first_name: guard.practitioner.firstName || null,
//         last_name: guard.practitioner.lastName || null,
//         specialty: guard.practitioner.specialty,
//       };
//     }

//     return response;
//   }
// }
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { PractitionerGuard } from '../practitioners/entities/practitioner-guard.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import {
  CreateGuardDto,
  UpdateGuardDto,
  GuardQueryDto,
  GuardResponseDto,
} from './dto/create-guard.dto';

@Injectable()
export class GuardsService {
  constructor(
    @InjectRepository(PractitionerGuard)
    private guardRepo: Repository<PractitionerGuard>,
    @InjectRepository(Practitioner)
    private practitionerRepo: Repository<Practitioner>,
  ) {}

  async findAll(query: GuardQueryDto): Promise<GuardResponseDto[]> {
    const { practitioner_id, month, from_date, to_date, start, end } = query;

    const whereCondition: any = {};

    if (practitioner_id) {
      whereCondition.practitionerId = practitioner_id;
    }

    const from = from_date || start;
    const to = to_date || end;

    if (from && to) {
      whereCondition.guardDate = Between(from, to);
    } else if (month) {

      const [year, monthNum] = month.split('-');
      const startDate = `${year}-${monthNum}-01`;
      const endDate = new Date(parseInt(year), parseInt(monthNum), 0)
        .toISOString()
        .split('T')[0];
      whereCondition.guardDate = Between(startDate, endDate);
    }

    const guards = await this.guardRepo.find({
      where: whereCondition,
      order: { guardDate: 'ASC' },
      relations: ['practitioner'],
    });

    return guards.map((g) => this.mapToResponse(g));
  }

  async findOne(id: string): Promise<GuardResponseDto> {
    const guard = await this.guardRepo.findOne({
      where: { id },
      relations: ['practitioner'],
    });

    if (!guard) {
      throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
    }

    return this.mapToResponse(guard);
  }

  async create(createGuardDto: CreateGuardDto): Promise<GuardResponseDto> {
    // Vérifier que le praticien existe
    const practitioner = await this.practitionerRepo.findOne({
      where: { id: createGuardDto.practitioner_id },
    });

    if (!practitioner) {
      throw new NotFoundException(
        `Praticien avec l'ID ${createGuardDto.practitioner_id} non trouvé`,
      );
    }

    // Vérifier s'il n'y a pas déjà une garde pour ce praticien à cette date
    const existing = await this.guardRepo.findOne({
      where: {
        practitionerId: createGuardDto.practitioner_id,
        guardDate: createGuardDto.guard_date,
      },
    });

    if (existing) {
      throw new BadRequestException(
        'Ce praticien a déjà une garde à cette date',
      );
    }

    const guardData: Partial<PractitionerGuard> = {
      practitionerId: createGuardDto.practitioner_id,
      guardDate: createGuardDto.guard_date,
      guardType: createGuardDto.guard_type || 'night',
    };

    if (createGuardDto.start_time) {
      guardData.startTime = createGuardDto.start_time;
    }

    if (createGuardDto.end_time) {
      guardData.endTime = createGuardDto.end_time;
    }

    if (createGuardDto.notes) {
      guardData.notes = createGuardDto.notes;
    }

    const guard = this.guardRepo.create(guardData);
    await this.guardRepo.save(guard);

    const savedGuard = await this.guardRepo.findOne({
      where: { id: guard.id },
      relations: ['practitioner'],
    });

    if (!savedGuard) {
      throw new NotFoundException('Garde non trouvée après création');
    }

    return this.mapToResponse(savedGuard);
  }

  async update(
    id: string,
    updateGuardDto: UpdateGuardDto,
  ): Promise<GuardResponseDto> {
    const guard = await this.guardRepo.findOne({
      where: { id },
    });

    if (!guard) {
      throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
    }

    // Vérifier le praticien si modifié
    if (
      updateGuardDto.practitioner_id &&
      updateGuardDto.practitioner_id !== guard.practitionerId
    ) {
      const practitioner = await this.practitionerRepo.findOne({
        where: { id: updateGuardDto.practitioner_id },
      });
      if (!practitioner) {
        throw new NotFoundException('Praticien non trouvé');
      }
    }

    // Vérifier les conflits de date
    if (
      updateGuardDto.guard_date &&
      updateGuardDto.guard_date !== guard.guardDate
    ) {
      const existing = await this.guardRepo.findOne({
        where: {
          practitionerId:
            updateGuardDto.practitioner_id || guard.practitionerId,
          guardDate: updateGuardDto.guard_date,
        },
      });
      if (existing && existing.id !== id) {
        throw new BadRequestException(
          'Ce praticien a déjà une garde à cette date',
        );
      }
    }

    const updateData: Partial<PractitionerGuard> = {};

    if (updateGuardDto.practitioner_id !== undefined) {
      updateData.practitionerId = updateGuardDto.practitioner_id;
    }

    if (updateGuardDto.guard_date !== undefined) {
      updateData.guardDate = updateGuardDto.guard_date;
    }

    if (updateGuardDto.start_time !== undefined) {
      updateData.startTime = updateGuardDto.start_time;
    }

    if (updateGuardDto.end_time !== undefined) {
      updateData.endTime = updateGuardDto.end_time;
    }

    if (updateGuardDto.guard_type !== undefined) {
      updateData.guardType = updateGuardDto.guard_type;
    }

    if (updateGuardDto.notes !== undefined) {
      updateData.notes = updateGuardDto.notes;
    }

    if (Object.keys(updateData).length > 0) {
      await this.guardRepo.update(id, updateData);
    }

    const updated = await this.guardRepo.findOne({
      where: { id },
      relations: ['practitioner'],
    });

    if (!updated) {
      throw new NotFoundException(
        `Garde avec l'ID ${id} non trouvée après mise à jour`,
      );
    }

    return this.mapToResponse(updated);
  }

  async delete(id: string): Promise<{ message: string }> {
    const guard = await this.guardRepo.findOne({
      where: { id },
    });

    if (!guard) {
      throw new NotFoundException(`Garde avec l'ID ${id} non trouvée`);
    }

    await this.guardRepo.remove(guard);
    return { message: 'Garde supprimée avec succès' };
  }

  private mapToResponse(guard: PractitionerGuard): GuardResponseDto {
    const response: GuardResponseDto = {
      id: guard.id,
      practitioner_id: guard.practitionerId,
      guard_date: guard.guardDate,
      start_time: guard.startTime,
      end_time: guard.endTime,
      guard_type: guard.guardType,
      notes: guard.notes || null,
      created_at: guard.createdAt,
      updated_at: guard.updatedAt,
    };

    if (guard.practitioner) {
      response.practitioner = {
        id: guard.practitioner.id,
        first_name: guard.practitioner.firstName || null,
        last_name: guard.practitioner.lastName || null,
        specialty: guard.practitioner.specialty,
      };
    }

    return response;
  }
}
