import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';
import type { Appointment } from '../types/appointment';

interface ExportData {
  patients: Patient[];
  consultations: Consultation[];
  appointments: Appointment[];
  activeTab: string;
  dateFilter: {
    startDate: string;
    endDate: string;
    period: string;
  };
}

export const exportToPDF = ({ patients, consultations, appointments, activeTab, dateFilter }: ExportData): void => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    let currentY = 15;

    // Add header
    doc.setFontSize(20);
    doc.text('IMD-Care Report', pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, currentY, { align: 'center' });
    
    if (dateFilter.startDate && dateFilter.endDate) {
      currentY += 7;
      doc.text(
        `Period: ${format(new Date(dateFilter.startDate), 'dd/MM/yyyy')} to ${format(new Date(dateFilter.endDate), 'dd/MM/yyyy')}`,
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
    }
    
    currentY += 15;

    // Add active patients section if applicable
    if (activeTab === 'all' || activeTab === 'admissions') {
      doc.setFontSize(14);
      doc.text('Active Admissions', 14, currentY);
      currentY += 10;

      if (patients.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Name', 'MRN', 'Department', 'Admission Date', 'Doctor', 'Safety Type']],
          body: patients.map(patient => [
            patient.name,
            patient.mrn,
            patient.department || 'N/A',
            patient.admission_date ? format(new Date(patient.admission_date), 'dd/MM/yyyy') : 'N/A',
            patient.doctor_name || 'Not assigned',
            patient.admissions?.[0]?.safety_type || 'N/A'
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [79, 70, 229] }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No active admissions found.', 14, currentY);
        currentY += 15;
      }
    }

    // Add consultations section if applicable
    if (activeTab === 'all' || activeTab === 'consultations') {
      doc.setFontSize(14);
      doc.text('Medical Consultations', 14, currentY);
      currentY += 10;

      if (consultations.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Patient', 'MRN', 'Specialty', 'Created', 'Doctor', 'Urgency']],
          body: consultations.map(consultation => [
            consultation.patient_name,
            consultation.mrn,
            consultation.consultation_specialty,
            format(new Date(consultation.created_at), 'dd/MM/yyyy'),
            consultation.doctor_name || 'Pending Assignment',
            consultation.urgency
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [79, 70, 229] }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No active consultations found.', 14, currentY);
        currentY += 15;
      }
    }

    // Add appointments section if applicable
    if (activeTab === 'all' || activeTab === 'appointments') {
      doc.setFontSize(14);
      doc.text('Clinic Appointments', 14, currentY);
      currentY += 10;

      if (appointments.length > 0) {
        autoTable(doc, {
          startY: currentY,
          head: [['Patient', 'MRN', 'Specialty', 'Date', 'Type', 'Status']],
          body: appointments.map(appointment => [
            appointment.patientName,
            appointment.medicalNumber,
            appointment.specialty,
            format(new Date(appointment.createdAt), 'dd/MM/yyyy'),
            appointment.appointmentType,
            appointment.status
          ]),
          styles: { fontSize: 10 },
          headStyles: { fillColor: [79, 70, 229] }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      } else {
        doc.setFontSize(10);
        doc.text('No appointments found.', 14, currentY);
        currentY += 15;
      }
    }

    // Add summary section
    doc.setFontSize(14);
    doc.text('Summary', 14, currentY);
    currentY += 10;

    const summaryData = [
      ['Total Active Patients', patients.length.toString()],
      ['Total Active Consultations', consultations.length.toString()],
      ['Total Appointments', appointments.length.toString()]
    ];

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Count']],
      body: summaryData,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] },
      margin: { left: 14 },
      tableWidth: 100
    });

    // Add footer with page numbers
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`imd-care-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate report');
  }
};