import React, { useState } from 'react';
import { Plus, Calendar, User, Check, X, AlertCircle } from 'lucide-react';
import { useAppointmentStore } from '../../stores/useAppointmentStore';
import { formatDate } from '../../utils/dateFormat';
import AppointmentDetails from './AppointmentDetails';

interface AppointmentListProps {
  onBookNew: () => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ onBookNew }) => {
  const { appointments, loading, error, updateAppointment } = useAppointmentStore();
  const [selectedAppointment, setSelectedAppointment] = useState<any | null>(null);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState<number | null>(null);

  const handleStatusChange = async (id: number, status: 'completed' | 'cancelled') => {
    try {
      setStatusUpdateLoading(id);
      await updateAppointment(id, { status });
    } catch (error) {
      console.error('Error updating appointment status:', error);
    } finally {
      setStatusUpdateLoading(null);
    }
  };

  const handleViewDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-4 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
        <button
          onClick={onBookNew}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Book New</span>
        </button>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments scheduled</h3>
          <p className="text-gray-500 mb-4">Book your first appointment to get started</p>
          <button
            onClick={onBookNew}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Calendar className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{appointment.patientName}</h3>
                  <p className="text-sm text-gray-500">{appointment.medicalNumber}</p>
                  <div className="flex items-center space-x-4 mt-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(appointment.createdAt)}
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <User className="h-4 w-4 mr-1" />
                      {appointment.specialty}
                    </div>
                  </div>
                </div>
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

                {appointment.status === 'pending' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'completed')}
                      disabled={statusUpdateLoading === appointment.id}
                      className="p-1 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50"
                      title="Mark as completed"
                    >
                      {statusUpdateLoading === appointment.id ? (
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleStatusChange(appointment.id, 'cancelled')}
                      disabled={statusUpdateLoading === appointment.id}
                      className="p-1 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                      title="Cancel appointment"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => handleViewDetails(appointment)}
                  className="text-sm text-indigo-600 hover:text-indigo-700"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetails
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
        />
      )}
    </div>
  );
};

export default AppointmentList;