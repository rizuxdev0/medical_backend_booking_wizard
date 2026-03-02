export class QueueEntryResponseDto {
  id: string;
  patient_id: string;
  practitioner_id: string | null;
  appointment_id: string | null;
  resource_id: string | null;
  queue_number: number;
  priority: number;
  status: string;
  check_in_time: Date;
  called_time: Date | null;
  start_time: Date | null;
  end_time: Date | null;
  estimated_wait_minutes: number | null;
  notes: string | null;
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
  };

  appointment?: {
    id: string;
    scheduled_at: Date;
    status: string;
  };

  position?: number; // Position dans la file
  estimated_wait_time?: string; // Temps d'attente estimé formaté
}

export class QueueSettingsResponseDto {
  id: string;
  practitioner_id: string | null;
  resource_id: string | null;
  average_service_time_minutes: number;
  max_queue_size: number | null;
  auto_call_enabled: boolean;
  display_position_to_patient: boolean;
  created_at: Date;
  updated_at: Date;
}

export class QueueStatsDto {
  total_waiting: number;
  total_in_progress: number;
  total_called: number;
  total_completed_today: number;
  average_wait_time_minutes: number;
  longest_wait_minutes: number;
  by_practitioner: {
    [key: string]: {
      name: string;
      waiting: number;
      in_progress: number;
    };
  };
}
