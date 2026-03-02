export class AppointmentResponseDto {
  id: string;
  patient_id: string;
  practitioner_id: string;
  appointment_type_id: string | null;
  resource_id: string | null;
  scheduled_at: Date;
  duration_minutes: number;
  status: string;
  notes: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;

  // Relations enrichies
  patient?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string | null;
  };

  practitioner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    specialty: string;
    calendar_color: string;
  };

  appointment_type?: {
    id: string;
    name: string;
    duration_minutes: number;
    color: string;
  } | null;

  resource?: {
    id: string;
    name: string;
    type: string;
  } | null;
}
