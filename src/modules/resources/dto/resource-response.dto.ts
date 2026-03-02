export class ResourceResponseDto {
  id: string;
  name: string;
  type: string;
  description: string | null;
  location: string | null;
  floor: string | null;
  capacity: number | null;
  is_available: boolean;
  maintenance_required: boolean;
  assigned_practitioner_id: string | null;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry_date: string | null;
  last_maintenance_date: string | null;
  next_maintenance_date: string | null;
  cost_per_hour: number;
  contact_person: string | null;
  contact_phone: string | null;
  image_url: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;

  // Relations optionnelles
  schedules?: ResourceScheduleResponseDto[];
  bookings?: ResourceBookingResponseDto[];
  maintenance_logs?: MaintenanceLogResponseDto[];
}

export class ResourceScheduleResponseDto {
  id: string;
  resource_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_available: boolean;
  created_at: Date;
}

export class ResourceBookingResponseDto {
  id: string;
  resource_id: string;
  practitioner_id: string | null;
  appointment_id: string | null;
  start_time: Date;
  end_time: Date;
  notes: string | null;
  created_at: Date;

  // Relations
  practitioner?: {
    id: string;
    first_name: string | null;
    last_name: string | null;
  };
}

export class MaintenanceLogResponseDto {
  id: string;
  resource_id: string;
  maintenance_type: string;
  description: string | null;
  maintenance_date: string;
  next_scheduled_date: string | null;
  performed_by: string | null;
  cost: number;
  status: string;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}
