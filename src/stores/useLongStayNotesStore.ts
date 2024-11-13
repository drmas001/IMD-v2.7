import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { useUserStore } from './useUserStore';

interface DBNote {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: {
    name: string;
  };
}

interface Note {
  id: number;
  patient_id: number;
  content: string;
  created_at: string;
  updated_at: string;
  created_by: {
    name: string;
  };
}

interface LongStayNotesStore {
  notes: Record<number, Note[]>;
  loading: boolean;
  error: string | null;
  fetchNotes: (patientId: number) => Promise<void>;
  addNote: (patientId: number, content: string) => Promise<void>;
}

export const useLongStayNotesStore = create<LongStayNotesStore>((set, get) => ({
  notes: {},
  loading: false,
  error: null,

  fetchNotes: async (patientId: number) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('long_stay_notes')
        .select(`
          id,
          patient_id,
          content,
          created_at,
          updated_at,
          created_by:users!long_stay_notes_created_by_fkey (
            name
          )
        `)
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedNotes = (data as unknown as DBNote[]).map(note => ({
        id: note.id,
        patient_id: note.patient_id,
        content: note.content,
        created_at: note.created_at,
        updated_at: note.updated_at,
        created_by: {
          name: note.created_by?.name || 'Unknown'
        }
      }));

      set(state => ({
        notes: {
          ...state.notes,
          [patientId]: formattedNotes
        },
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred', 
        loading: false 
      });
    }
  },

  addNote: async (patientId: number, content: string) => {
    set({ loading: true, error: null });
    try {
      const currentUser = useUserStore.getState().currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('long_stay_notes')
        .insert([{
          patient_id: patientId,
          content,
          created_by: currentUser.id
        }])
        .select(`
          id,
          patient_id,
          content,
          created_at,
          updated_at,
          created_by:users!long_stay_notes_created_by_fkey (
            name
          )
        `)
        .single();

      if (error) throw error;

      const formattedNote = {
        id: data.id,
        patient_id: data.patient_id,
        content: data.content,
        created_at: data.created_at,
        updated_at: data.updated_at,
        created_by: {
          name: data.created_by?.name || 'Unknown'
        }
      };

      set(state => ({
        notes: {
          ...state.notes,
          [patientId]: [formattedNote, ...(state.notes[patientId] || [])]
        },
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'An error occurred', 
        loading: false 
      });
    }
  }
}));