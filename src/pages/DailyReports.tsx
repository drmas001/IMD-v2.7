import React, { useState, useEffect } from 'react';
import { usePatientStore } from '../stores/usePatientStore';
import { useConsultationStore } from '../stores/useConsultationStore';
import { useAppointmentStore } from '../stores/useAppointmentStore';
import ReportFiltersComponent from '../components/Reports/ReportFilters';
import ReportTable from '../components/Reports/ReportTable';

interface DailyReportFilters {
  dateFrom: string;
  dateTo: string;
  reportType: string;
  specialty: string;
  searchQuery: string;
}

const DailyReports: React.FC = () => {
  const { patients, fetchPatients } = usePatientStore();
  const { consultations, fetchConsultations } = useConsultationStore();
  const { appointments, fetchAppointments } = useAppointmentStore();
  const [filters, setFilters] = useState<DailyReportFilters>({
    dateFrom: '',
    dateTo: '',
    reportType: 'all',
    specialty: 'all',
    searchQuery: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchConsultations();
    fetchAppointments();
  }, [fetchPatients, fetchConsultations, fetchAppointments]);

  const handleFilterChange = (newFilters: DailyReportFilters) => {
    setFilters(newFilters);
  };

  const filteredData = {
    patients,
    consultations,
    appointments,
    filters
  };

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
        <p className="text-gray-600">View and export daily patient reports</p>
      </div>
      
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <ReportFiltersComponent onFilterChange={handleFilterChange} />
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <ReportTable data={filteredData} />
        </div>
      </div>
    </div>
  );
};

export default DailyReports;