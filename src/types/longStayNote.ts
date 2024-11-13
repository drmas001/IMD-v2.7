export interface LongStayNote {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: {
    name: string;
  };
}