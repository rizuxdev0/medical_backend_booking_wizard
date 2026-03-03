// import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
// import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
// import { PermissionsService } from './permissions.service';
// import {
//   CreatePermissionDto,
//   AssignPermissionsDto,
//   PermissionResponseDto,
//   RolePermissionsResponseDto,
// } from './dto/create-permission.dto';
// import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
// import { RolesGuard } from '../../common/guards/roles.guard';
// import { Roles } from '../../common/decorators/roles.decorator';

// @ApiTags('permissions')
// @ApiBearerAuth()
// @Controller('permissions')
// @UseGuards(JwtAuthGuard, RolesGuard)
// export class PermissionsController {
//   constructor(private readonly permissionsService: PermissionsService) {}

//   @Get()
//   @Roles('admin')
//   @ApiOperation({ summary: 'Liste toutes les permissions' })
//   findAllPermissions(): Promise<PermissionResponseDto[]> {
//     return this.permissionsService.findAllPermissions();
//   }

//   @Get('role/:role')
//   @Roles('admin')
//   @ApiOperation({ summary: "Récupérer les permissions d'un rôle" })
//   getRolePermissions(
//     @Param('role') role: string,
//   ): Promise<RolePermissionsResponseDto> {
//     return this.permissionsService.getRolePermissions(role);
//   }

//   @Post()
//   @Roles('admin')
//   @ApiOperation({ summary: 'Créer une nouvelle permission' })
//   createPermission(
//     @Body() createPermissionDto: CreatePermissionDto,
//   ): Promise<PermissionResponseDto> {
//     return this.permissionsService.createPermission(createPermissionDto);
//   }

//   @Post('assign')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Assigner des permissions à un rôle' })
//   assignPermissions(
//     @Body() assignDto: AssignPermissionsDto,
//   ): Promise<RolePermissionsResponseDto> {
//     return this.permissionsService.assignPermissions(assignDto);
//   }

//   @Get('check/:role/:permission')
//   @Roles('admin')
//   @ApiOperation({ summary: 'Vérifier si un rôle a une permission' })
//   async checkPermission(
//     @Param('role') role: string,
//     @Param('permission') permission: string,
//   ): Promise<{ hasPermission: boolean }> {
//     const hasPermission = await this.permissionsService.hasPermission(
//       role,
//       permission,
//     );
//     return { hasPermission };
//   }
// }
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import {
  CreatePermissionDto,
  AssignPermissionsDto,
  PermissionResponseDto,
  RolePermissionsResponseDto,
} from './dto/create-permission.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Liste toutes les permissions' })
  findAllPermissions(): Promise<PermissionResponseDto[]> {
    return this.permissionsService.findAllPermissions();
  }

  @Get('role/:role')
  @Roles('admin')
  @ApiOperation({ summary: "Récupérer les permissions d'un rôle" })
  getRolePermissions(
    @Param('role') role: string,
  ): Promise<RolePermissionsResponseDto> {
    return this.permissionsService.getRolePermissions(role);
  }

  @Put('role/:role')
  @Roles('admin')
  @ApiOperation({ summary: "Définir les permissions d'un rôle" })
  setRolePermissions(
    @Param('role') role: string,
    @Body() permissionCodes: string[],
  ): Promise<RolePermissionsResponseDto> {
    const assignDto: AssignPermissionsDto = {
      role,
      permission_codes: permissionCodes,
    };
    return this.permissionsService.assignPermissions(assignDto);
  }

  @Get('check/:role/:permission')
  @Roles('admin')
  @ApiOperation({ summary: 'Vérifier si un rôle a une permission' })
  async checkPermission(
    @Param('role') role: string,
    @Param('permission') permission: string,
  ): Promise<{ hasPermission: boolean }> {
    const hasPermission = await this.permissionsService.hasPermission(
      role,
      permission,
    );
    return { hasPermission };
  }

  @Post('assign')
  @Roles('admin')
  @ApiOperation({ summary: 'Assigner des permissions à un rôle' })
  assignPermissions(
    @Body() assignDto: AssignPermissionsDto,
  ): Promise<RolePermissionsResponseDto> {
    return this.permissionsService.assignPermissions(assignDto);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer une nouvelle permission' })
  createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionResponseDto> {
    return this.permissionsService.createPermission(createPermissionDto);
  }
}
