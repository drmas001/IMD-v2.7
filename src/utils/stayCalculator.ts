import { differenceInDays } from 'date-fns';

export const LONG_STAY_THRESHOLD = 6;

export const calculateStayDuration = (admissionDate: string): number => {
  const admissionDateTime = new Date(admissionDate);
  const currentDateTime = new Date();
  return differenceInDays(currentDateTime, admissionDateTime);
};

export const isLongStay = (admissionDate: string): boolean => {
  const stayDuration = calculateStayDuration(admissionDate);
  return stayDuration >= LONG_STAY_THRESHOLD;
};