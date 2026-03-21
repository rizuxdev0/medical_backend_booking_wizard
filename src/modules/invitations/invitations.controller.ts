import { Controller, Post, Body, Get, Query, UseGuards, UnauthorizedException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user invitation (Admin only)' })
  createInvitation(@Body() body: { email: string; userId: string }) {
    return this.invitationsService.createInvitation(body.email, body.userId);
  }

  @Get('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code from email (Public)' })
  async verifyOtp(
    @Query('email') email: string,
    @Query('otp') otp: string,
  ) {
    if (!email || !otp) throw new UnauthorizedException('Email and OTP required');
    return this.invitationsService.verifyOtp(email, otp);
  }

  @Post('activate')
  @ApiOperation({ summary: 'Set password and activate account (Public)' })
  async activate(@Body() body: { email: string; otp: string; password: string }) {
    if (!body.email || !body.otp || !body.password) {
      throw new UnauthorizedException('Missing activation details');
    }
    return this.invitationsService.activateAccount(body.email, body.otp, body.password);
  }
}
