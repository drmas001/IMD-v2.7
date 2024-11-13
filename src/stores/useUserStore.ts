import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User } from '../types/user';

interface UserStore {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  login: (medicalCode: string) => Promise<void>;
  logout: () => void;
  fetchUsers: () => Promise<void>;
  addUser: (userData: Omit<User, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updateUser: (id: number, updates: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  users: [],
  currentUser: null,
  loading: false,
  error: null,

  login: async (medicalCode: string) => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('medical_code', medicalCode)
        .eq('status', 'active')
        .single();

      if (error) throw new Error('Invalid medical code');
      if (!data) throw new Error('User not found or inactive');

      set({ currentUser: data as User, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Authentication failed', 
        loading: false 
      });
      throw error;
    }
  },

  logout: () => {
    set({ currentUser: null });
  },

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ users: data as User[] || [], loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch users', 
        loading: false 
      });
    }
  },

  addUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('medical_code')
        .eq('medical_code', userData.medical_code)
        .single();

      if (existingUser) {
        throw new Error('Medical code already exists');
      }

      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        users: [data as User, ...state.users],
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add user', 
        loading: false 
      });
      throw error;
    }
  },

  updateUser: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      if (updates.medical_code) {
        const { data: existingUser } = await supabase
          .from('users')
          .select('id, medical_code')
          .eq('medical_code', updates.medical_code)
          .neq('id', id)
          .single();

        if (existingUser) {
          throw new Error('Medical code already exists');
        }
      }

      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      set(state => ({
        users: state.users.map(user => user.id === id ? (data as User) : user),
        currentUser: state.currentUser?.id === id ? (data as User) : state.currentUser,
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update user', 
        loading: false 
      });
      throw error;
    }
  },

  deleteUser: async (id) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        users: state.users.filter(user => user.id !== id),
        loading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete user', 
        loading: false 
      });
      throw error;
    }
  }
}));