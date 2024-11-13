import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { useLongStayNotesStore } from '../stores/useLongStayNotesStore';
import type { Patient } from '../types/patient';

interface ExportOptions {
  specialty?: string;
  doctorId?: number;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export const exportLongStayReport = async (patients: Patient[], options: ExportOptions): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  let currentY = 15;

  // Add header
  doc.setFontSize(20);
  doc.text('Long Stay Patient Report', pageWidth / 2, currentY, { align: 'center' });
  
  currentY += 10;
  doc.setFontSize(12);
  doc.text(`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, pageWidth / 2, currentY, { align: 'center' });

  if (options.specialty) {
    currentY += 7;
    doc.text(`Specialty: ${options.specialty}`, pageWidth / 2, currentY, { align: 'center' });
  }
  
  currentY += 15;

  // Add patient table
  if (patients.length > 0) {
    autoTable(doc, {
      startY: currentY,
      head: [['Patient Name', 'MRN', 'Department', 'Attending Doctor', 'Admission Date', 'Stay Duration']],
      body: patients.map(patient => {
        const admission = patient.admissions?.[0];
        if (!admission) return [];
        
        const stayDuration = Math.ceil(
          (new Date().getTime() - new Date(admission.admission_date).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return [
          patient.name,
          patient.mrn,
          admission.department,
          admission.users?.name || 'Not assigned',
          format(new Date(admission.admission_date), 'dd/MM/yyyy'),
          `${stayDuration} days`
        ];
      }),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [79, 70, 229] }
    });

    currentY = (doc as any).lastAutoTable.finalY + 15;

    // Add notes for each patient
    const { notes } = useLongStayNotesStore.getState();
    
    for (const patient of patients) {
      const patientNotes = notes[patient.id];
      if (patientNotes && patientNotes.length > 0) {
        // Add patient name as header for their notes
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text(`Notes for ${patient.name} (MRN: ${patient.mrn})`, 14, currentY);
        currentY += 10;

        // Add notes table
        autoTable(doc, {
          startY: currentY,
          head: [['Date', 'Author', 'Note']],
          body: patientNotes.map(note => [
            format(new Date(note.created_at), 'dd/MM/yyyy HH:mm'),
            note.created_by.name,
            note.content
          ]),
          styles: { fontSize: 9 },
          headStyles: { fillColor: [79, 70, 229] },
          columnStyles: {
            0: { cellWidth: 30 },
            1: { cellWidth: 40 },
            2: { cellWidth: 'auto' }
          }
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;

        // Add page if needed
        if (currentY > doc.internal.pageSize.height - 20) {
          doc.addPage();
          currentY = 15;
        }
      }
    }
  } else {
    doc.setFontSize(12);
    doc.text('No long stay patients found.', 14, currentY);
    currentY += 15;
  }

  // Save the PDF
  doc.save(`long-stay-report-${format(new Date(), 'dd-MM-yyyy-HHmm')}.pdf`);
};