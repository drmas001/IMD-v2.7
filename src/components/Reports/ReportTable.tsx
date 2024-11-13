import React from 'react';
import { Download, Printer, FileText } from 'lucide-react';
import { formatDate, formatTime } from '../../utils/dateFormat';
import { exportToPDF } from '../../utils/pdfExport';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';
import type { Appointment } from '../../types/appointment';

interface ReportFilters {
  dateFrom: string;
  dateTo: string;
  reportType: string;
  specialty: string;
  searchQuery: string;
}

interface ReportTableProps {
  data: {
    patients: Patient[];
    consultations: Consultation[];
    appointments: Appointment[];
    filters: ReportFilters;
  };
}

const ReportTable: React.FC<ReportTableProps> = ({ data }) => {
  const filterDataByDate = (item: { created_at?: string; admission_date?: string }) => {
    if (!data.filters.dateFrom && !data.filters.dateTo) return true;
    const itemDate = new Date(item.created_at || item.admission_date || '');
    const fromDate = data.filters.dateFrom ? new Date(data.filters.dateFrom) : null;
    const toDate = data.filters.dateTo ? new Date(data.filters.dateTo) : null;

    if (fromDate && toDate) {
      return itemDate >= fromDate && itemDate <= toDate;
    } else if (fromDate) {
      return itemDate >= fromDate;
    } else if (toDate) {
      return itemDate <= toDate;
    }
    return true;
  };

  const filterBySpecialty = (item: { department?: string; consultation_specialty?: string }) => {
    if (data.filters.specialty === 'all') return true;
    return item.department === data.filters.specialty || 
           item.consultation_specialty === data.filters.specialty;
  };

  const filterBySearch = (item: { name?: string; mrn?: string; doctor_name?: string }) => {
    if (!data.filters.searchQuery) return true;
    const searchLower = data.filters.searchQuery.toLowerCase();
    return (
      (item.name?.toLowerCase().includes(searchLower) || false) ||
      (item.mrn?.toLowerCase().includes(searchLower) || false) ||
      (item.doctor_name?.toLowerCase().includes(searchLower) || false)
    );
  };

  const filteredPatients = data.patients.filter(patient => 
    filterDataByDate(patient) && filterBySpecialty(patient) && filterBySearch(patient)
  );

  const filteredConsultations = data.consultations.filter(consultation => 
    filterDataByDate(consultation) && filterBySpecialty(consultation) && filterBySearch(consultation)
  );

  const filteredAppointments = data.appointments.filter(appointment => 
    filterDataByDate({ created_at: appointment.createdAt }) && 
    filterBySpecialty({ department: appointment.specialty }) && 
    filterBySearch({ name: appointment.patientName, mrn: appointment.medicalNumber })
  );

  const handleExportPDF = () => {
    try {
      exportToPDF({
        patients: filteredPatients,
        consultations: filteredConsultations,
        appointments: filteredAppointments,
        activeTab: data.filters.reportType,
        dateFilter: {
          startDate: data.filters.dateFrom,
          endDate: data.filters.dateTo,
          period: 'custom'
        }
      });
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export report. Please try again.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Reports</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Printer className="h-4 w-4" />
            <span>Print</span>
          </button>
          <button 
            onClick={handleExportPDF}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="space-y-8">
          {/* Active Admissions Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Active Admissions ({filteredPatients.length})
            </h3>
            <div className="space-y-4">
              {filteredPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{patient.name}</span>
                        <span className="text-gray-500">({patient.mrn})</span>
                      </div>
                      
                      {patient.admission_date && (
                        <div className="text-sm text-gray-600">
                          Admission Date: {formatDate(patient.admission_date)}
                        </div>
                      )}

                      {patient.department && (
                        <div className="text-sm text-gray-600">
                          Department: {patient.department}
                        </div>
                      )}
                    </div>

                    {patient.admissions?.[0] && (
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          patient.admissions[0].status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {patient.admissions[0].status}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Consultations Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Medical Consultations ({filteredConsultations.length})
            </h3>
            <div className="space-y-4">
              {filteredConsultations.map((consultation) => (
                <div
                  key={consultation.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{consultation.patient_name}</span>
                        <span className="text-gray-500">({consultation.mrn})</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>Age: {consultation.age}</div>
                        <div>Gender: {consultation.gender}</div>
                        <div>Department: {consultation.requesting_department}</div>
                        <div>Location: {consultation.patient_location}</div>
                      </div>

                      <div className="text-sm text-gray-600">
                        Specialty: {consultation.consultation_specialty}
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div>Date: {formatDate(consultation.created_at)}</div>
                        <div>Time: {formatTime(consultation.created_at)}</div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consultation.urgency === 'emergency'
                          ? 'bg-red-100 text-red-800'
                          : consultation.urgency === 'urgent'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {consultation.urgency}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Clinic Appointments Section */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Clinic Appointments ({filteredAppointments.length})
            </h3>
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{appointment.patientName}</span>
                        <span className="text-gray-500">({appointment.medicalNumber})</span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div>Date: {formatDate(appointment.createdAt)}</div>
                        <div>Time: {formatTime(appointment.createdAt)}</div>
                      </div>

                      <div className="text-sm text-gray-600">
                        Specialty: {appointment.specialty}
                      </div>

                      {appointment.notes && (
                        <div className="text-sm text-gray-600">
                          Notes: {appointment.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.appointmentType === 'urgent'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {appointment.appointmentType}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTable;