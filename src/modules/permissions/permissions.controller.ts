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
  Req,
  ForbiddenException,
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

  // --- Direct User Permissions (Extra Permissions) ---

  @Get('user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Liste les permissions directes d\'un utilisateur' })
  getUserDirectPermissions(@Param('userId') userId: string) {
    return this.permissionsService.getUserDirectPermissions(userId);
  }

  @Post('user/:userId')
  @Roles('admin')
  @ApiOperation({ summary: 'Assigner une permission directe (Grant/Deny) à un utilisateur' })
  assignUserPermission(
    @Param('userId') userId: string,
    @Body() data: { permissionCode: string; is_granted: boolean }
  ) {
    return this.permissionsService.assignUserPermission(userId, data.permissionCode, data.is_granted);
  }

  @Put('user/:userId/remove/:permissionCode')
  @Roles('admin')
  @ApiOperation({ summary: 'Retirer une permission directe d\'un utilisateur' })
  removeUserPermission(
    @Param('userId') userId: string,
    @Param('permissionCode') permissionCode: string
  ) {
    return this.permissionsService.removeUserPermission(userId, permissionCode);
  }

  @Get('user/:userId/consolidated')
  @ApiOperation({ summary: 'Récupérer les permissions consolidées (Rôles + Directes) d\'un utilisateur' })
  async getConsolidatedPermissions(@Param('userId') userId: string, @Req() req: any) {
    const user = req.user;
    const isAdmin = user.roles && user.roles.includes('admin');
    
    if (!isAdmin && user.id !== userId) {
      throw new ForbiddenException('Vous ne pouvez consulter que vos propres permissions');
    }
    
    return this.permissionsService.getConsolidatedUserPermissions(userId);
  }
}
