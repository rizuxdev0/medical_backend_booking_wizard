export class NotificationResponseDto {
  id: string;
  appointment_id: string;
  type: string;
  status: string;
  scheduled_for: Date;
  sent_at: Date | null;
  error_message: string | null;
  created_at: Date;
}

export class NotificationLogResponseDto {
  id: string;
  user_id: string | null;
  patient_id: string | null;
  type: string;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  created_at: Date;

  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };

  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  };
}
