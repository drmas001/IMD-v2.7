export interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  reportType: 'all' | 'admissions' | 'consultations' | 'appointments';
  specialty: string;
  searchQuery: string;
}