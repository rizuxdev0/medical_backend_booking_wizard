import { Public } from '../../common/decorators/public.decorator';

@ApiTags('invitations')
@Controller('invitations')
export class InvitationsController {
  constructor(private readonly invitationsService: InvitationsService) {}

  @Post('create')
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user invitation (Admin only)' })
  createInvitation(@Body() body: { email: string; userId: string }) {
    return this.invitationsService.createInvitation(body.email, body.userId);
  }

  @Public()
  @Get('verify-otp')
  @ApiOperation({ summary: 'Verify OTP code from email (Public)' })
  async verifyOtp(
    @Query('email') email: string,
    @Query('otp') otp: string,
  ) {
    if (!email || !otp) throw new UnauthorizedException('Email and OTP required');
    return this.invitationsService.verifyOtp(email, otp);
  }

  @Public()
  @Post('activate')
  @ApiOperation({ summary: 'Set password and activate account (Public)' })
  async activate(@Body() body: { email: string; otp: string; password: string }) {

    if (!body.email || !body.otp || !body.password) {
      throw new UnauthorizedException('Missing activation details');
    }
    return this.invitationsService.activateAccount(body.email, body.otp, body.password);
  }
}
