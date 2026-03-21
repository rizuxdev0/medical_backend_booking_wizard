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
import { UsersService } from './users.service';
import { PermissionsService } from '../permissions/permissions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AddRoleDto } from './dto/add-role.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly permissionsService: PermissionsService,
  ) {}

  @Get(':id/permissions')
  @ApiOperation({ summary: 'Récupérer toutes les permissions consolidées d\'un utilisateur' })
  getUserPermissions(@Param('id') id: string) {
    return this.permissionsService.getConsolidatedUserPermissions(id);
  }

  @Get()
  @ApiOperation({ summary: 'Liste tous les utilisateurs (admin uniquement)' })
  findAll(
    @Query() query: PaginationDto,
  ): Promise<{ data: UserResponseDto[]; meta: any }> {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: "Détail d'un utilisateur (admin uniquement)" })
  findOne(@Param('id') id: string): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Créer un utilisateur (admin uniquement)' })
  create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un utilisateur (admin uniquement)' })
  update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Post(':id/roles')
  @ApiOperation({
    summary: 'Ajouter un rôle à un utilisateur (admin uniquement)',
  })
  addRole(
    @Param('id') id: string,
    @Body() addRoleDto: AddRoleDto,
  ): Promise<RoleResponseDto> {
    return this.usersService.addRole(id, addRoleDto.role);
  }

  @Delete(':id/roles/:role')
  @ApiOperation({
    summary: "Retirer un rôle d'un utilisateur (admin uniquement)",
  })
  removeRole(
    @Param('id') id: string,
    @Param('role') role: string,
  ): Promise<{ message: string }> {
    return this.usersService.removeRole(id, role);
  }
}
