import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import type { Patient } from '../types/patient';
import type { Consultation } from '../types/consultation';

interface AdminReportData {
  title: string;
  dateRange: string;
  data: {
    patients: Patient[];
    consultations: Consultation[];
    dateFilter: {
      startDate: string;
      endDate: string;
      period: string;
    };
  };
}

export const exportAdminPDF = ({ title, dateRange, data }: AdminReportData): void => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const today = format(new Date(), 'dd/MM/yyyy');
    let currentY = 15;

    // Filter data based on date range
    const filteredPatients = data.patients.filter(patient => {
      const admissionDate = new Date(patient.admission_date || '');
      return admissionDate >= new Date(data.dateFilter.startDate) && 
             admissionDate <= new Date(data.dateFilter.endDate);
    });

    const filteredConsultations = data.consultations.filter(consultation => {
      const consultationDate = new Date(consultation.created_at);
      return consultationDate >= new Date(data.dateFilter.startDate) && 
             consultationDate <= new Date(data.dateFilter.endDate);
    });

    // Add header
    doc.setFontSize(20);
    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 10;
    doc.setFontSize(12);
    doc.text(`Generated on: ${today}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 7;
    doc.text(`Period: ${dateRange}`, pageWidth / 2, currentY, { align: 'center' });
    
    currentY += 15;

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
    doc.save(`imd-care-admin-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
  } catch (error) {
    console.error('Error generating admin PDF:', error);
    throw new Error('Failed to generate administrative report');
  }
};