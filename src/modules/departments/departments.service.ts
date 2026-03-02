import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
  DepartmentResponseDto,
} from './dto/create-department.dto';
import { Profile } from '../users/entities/profile.entity';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private departmentRepo: Repository<Department>,
    @InjectRepository(Profile)
    private profileRepo: Repository<Profile>,
  ) {}

  async findAll(): Promise<DepartmentResponseDto[]> {
    const departments = await this.departmentRepo.find({
      relations: ['head', 'parent', 'children'],
      order: { name: 'ASC' },
    });
    return departments.map((d) => this.mapToResponse(d));
  }

  async findOne(id: string): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepo.findOne({
      where: { id },
      relations: ['head', 'parent', 'children'],
    });

    if (!department) {
      throw new NotFoundException(`Département avec l'ID ${id} non trouvé`);
    }

    return this.mapToResponse(department);
  }

  async create(
    createDepartmentDto: CreateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    // Vérifier le responsable si fourni
    if (createDepartmentDto.head_user_id) {
      const head = await this.profileRepo.findOne({
        where: { id: createDepartmentDto.head_user_id },
      });
      if (!head) {
        throw new NotFoundException('Responsable non trouvé');
      }
    }

    // Vérifier le département parent si fourni
    if (createDepartmentDto.parent_department_id) {
      const parent = await this.departmentRepo.findOne({
        where: { id: createDepartmentDto.parent_department_id },
      });
      if (!parent) {
        throw new NotFoundException('Département parent non trouvé');
      }
    }

    const departmentData: Partial<Department> = {
      name: createDepartmentDto.name,
    };

    if (createDepartmentDto.code) {
      departmentData.code = createDepartmentDto.code;
    }

    if (createDepartmentDto.description) {
      departmentData.description = createDepartmentDto.description;
    }

    if (createDepartmentDto.head_user_id) {
      departmentData.headUserId = createDepartmentDto.head_user_id;
    }

    if (createDepartmentDto.parent_department_id) {
      departmentData.parentDepartmentId =
        createDepartmentDto.parent_department_id;
    }

    if (createDepartmentDto.is_active !== undefined) {
      departmentData.isActive = createDepartmentDto.is_active;
    }

    const department = this.departmentRepo.create(departmentData);
    await this.departmentRepo.save(department);

    return this.findOne(department.id);
  }

  async update(
    id: string,
    updateDepartmentDto: UpdateDepartmentDto,
  ): Promise<DepartmentResponseDto> {
    const department = await this.departmentRepo.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Département avec l'ID ${id} non trouvé`);
    }

    // Vérifier le responsable si modifié
    if (
      updateDepartmentDto.head_user_id &&
      updateDepartmentDto.head_user_id !== department.headUserId
    ) {
      const head = await this.profileRepo.findOne({
        where: { id: updateDepartmentDto.head_user_id },
      });
      if (!head) {
        throw new NotFoundException('Responsable non trouvé');
      }
    }

    // Vérifier le département parent si modifié
    if (
      updateDepartmentDto.parent_department_id &&
      updateDepartmentDto.parent_department_id !== department.parentDepartmentId
    ) {
      const parent = await this.departmentRepo.findOne({
        where: { id: updateDepartmentDto.parent_department_id },
      });
      if (!parent) {
        throw new NotFoundException('Département parent non trouvé');
      }
    }

    const updateData: Partial<Department> = {};

    if (updateDepartmentDto.name !== undefined) {
      updateData.name = updateDepartmentDto.name;
    }

    if (updateDepartmentDto.code !== undefined) {
      updateData.code = updateDepartmentDto.code;
    }

    if (updateDepartmentDto.description !== undefined) {
      updateData.description = updateDepartmentDto.description;
    }

    if (updateDepartmentDto.head_user_id !== undefined) {
      updateData.headUserId = updateDepartmentDto.head_user_id;
    }

    if (updateDepartmentDto.parent_department_id !== undefined) {
      updateData.parentDepartmentId = updateDepartmentDto.parent_department_id;
    }

    if (updateDepartmentDto.is_active !== undefined) {
      updateData.isActive = updateDepartmentDto.is_active;
    }

    if (Object.keys(updateData).length > 0) {
      await this.departmentRepo.update(id, updateData);
    }

    return this.findOne(id);
  }

  async delete(id: string): Promise<{ message: string }> {
    const department = await this.departmentRepo.findOne({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException(`Département avec l'ID ${id} non trouvé`);
    }

    await this.departmentRepo.remove(department);
    return { message: `Département ${department.name} supprimé avec succès` };
  }

  private mapToResponse(department: Department): DepartmentResponseDto {
    const response: DepartmentResponseDto = {
      id: department.id,
      name: department.name,
      code: department.code || null,
      description: department.description || null,
      head_user_id: department.headUserId || null,
      parent_department_id: department.parentDepartmentId || null,
      is_active: department.isActive,
      created_at: department.createdAt,
      updated_at: department.updatedAt,
    };

    if (department.head) {
      response.head = {
        id: department.head.id,
        first_name: department.head.first_name || null,
        last_name: department.head.last_name || null,
        email: department.head.email,
      };
    }

    if (department.children && department.children.length > 0) {
      response.children = department.children.map((c) => this.mapToResponse(c));
    }

    return response;
  }
}
