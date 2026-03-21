import { RoleResponseDto } from './role-response.dto';

export class UserResponseDto {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  department: string | null;
  job_title: string | null;
  employee_id: string | null;
  notes: string | null;
  is_active: boolean;
  last_login_at: Date | null;
  created_at: Date;
  updated_at: Date;
  roles: RoleResponseDto[];
  temp_password?: string;
  otp_code?: string;
}
