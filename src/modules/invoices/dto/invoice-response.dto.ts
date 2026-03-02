export class InvoiceResponseDto {
  id: string;
  invoice_number: string;
  patient_id: string;
  practitioner_id: string | null;
  appointment_id: string | null;
  status: string;
  issue_date: Date;
  due_date: Date | null;
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  is_deferred: boolean;
  installment_count: number;
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
  };

  items?: InvoiceItemResponseDto[];
  payments?: PaymentResponseDto[];
  installments?: InvoiceInstallmentResponseDto[];
}

export class InvoiceItemResponseDto {
  id: string;
  invoice_id: string;
  billable_item_id: string | null;
  description: string;
  service_code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: Date;
}

export class PaymentResponseDto {
  id: string;
  payment_number: string;
  invoice_id: string;
  amount: number;
  payment_method: string;
  payment_date: Date;
  reference: string | null;
  notes: string | null;
  status: string;
  currency: string;
  received_by: string | null;
  created_at: Date;
}

export class InvoiceInstallmentResponseDto {
  id: string;
  invoice_id: string;
  installment_number: number;
  amount: number;
  due_date: Date;
  status: string;
  paid_amount: number;
  paid_at: Date | null;
  payment_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export class BillingDashboardDto {
  total_invoiced: number;
  total_paid: number;
  total_unpaid: number;
  total_overdue: number;
  invoice_count: number;
  paid_count: number;
  unpaid_count: number;
  overdue_count: number;
  by_status: {
    draft: number;
    sent: number;
    paid: number;
    partial: number;
    overdue: number;
    cancelled: number;
  };
}
