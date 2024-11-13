import React from 'react';
import { FileText } from 'lucide-react';
import { format } from 'date-fns';
import type { Patient } from '../../types/patient';
import type { Consultation } from '../../types/consultation';
import type { Appointment } from '../../types/appointment';

interface PDFPreviewProps {
  patients: Patient[];
  consultations: Consultation[];
  appointments: Appointment[];
  dateFilter: {
    startDate: string;
    endDate: string;
  };
}

const PDFPreview: React.FC<PDFPreviewProps> = ({
  patients,
  consultations,
  appointments,
  dateFilter
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">Report Preview</h2>
        </div>
      </div>

      <div className="space-y-6 print:space-y-4">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">IMD-Care Report</h1>
          <p className="text-sm text-gray-600">Generated on: {format(new Date(), 'dd/MM/yyyy HH:mm')}</p>
          {dateFilter.startDate && dateFilter.endDate && (
            <p className="text-sm text-gray-600">
              Period: {format(new Date(dateFilter.startDate), 'dd/MM/yyyy')} to{' '}
              {format(new Date(dateFilter.endDate), 'dd/MM/yyyy')}
            </p>
          )}
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-900">Active Patients</p>
            <p className="text-2xl font-bold text-indigo-600">{patients.length}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-900">Active Consultations</p>
            <p className="text-2xl font-bold text-indigo-600">{consultations.length}</p>
          </div>
          <div className="p-4 bg-indigo-50 rounded-lg">
            <p className="text-sm font-medium text-indigo-900">Total Appointments</p>
            <p className="text-2xl font-bold text-indigo-600">{appointments.length}</p>
          </div>
        </div>

        {/* Preview sections */}
        <div className="space-y-8">
          {patients.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Active Admissions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Safety Type
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {patients.slice(0, 3).map((patient) => (
                      <tr key={patient.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">{patient.mrn}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {patient.doctor_name || 'Not assigned'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {patient.admissions?.[0]?.safety_type && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.admissions[0].safety_type === 'emergency'
                                ? 'bg-red-100 text-red-800'
                                : patient.admissions[0].safety_type === 'observation'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                            }`}>
                              {patient.admissions[0].safety_type}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {patients.length > 3 && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    And {patients.length - 3} more patients...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Preview footer */}
          <div className="text-center text-sm text-gray-500 pt-6 border-t border-gray-200">
            <p>End of Report Preview</p>
            <p>The full PDF will include all records and additional details</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFPreview;