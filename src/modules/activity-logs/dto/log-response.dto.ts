export class ActivityLogResponseDto {
  id: string;
  user_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  old_data: any;
  new_data: any;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;

  profile?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

