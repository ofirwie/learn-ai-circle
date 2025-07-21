import { create } from 'zustand'
import { supabase } from '../services/supabase'
import { User, Entity, UserGroup, RegistrationCode } from '../types/database.types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthState {
  user: SupabaseUser | null
  userProfile: User | null
  entity: Entity | null
  userGroup: UserGroup | null
  loading: boolean
  initialized: boolean

  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, fullName: string, registrationCode: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>
  validateRegistrationCode: (code: string) => Promise<{ valid: boolean; entity?: Entity; userGroup?: UserGroup; error?: string }>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  userProfile: null,
  entity: null,
  userGroup: null,
  loading: true,
  initialized: false,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        // Get user profile
        const { data: userProfile } = await supabase
          .from('users')
          .select(`
            *,
            entity:entities(*),
            user_group:user_groups(*)
          `)
          .eq('id', session.user.id)
          .single()

        if (userProfile) {
          set({
            user: session.user,
            userProfile,
            entity: userProfile.entity as Entity,
            userGroup: userProfile.user_group as UserGroup,
            loading: false,
            initialized: true
          })
        }
      } else {
        set({ loading: false, initialized: true })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          set({
            user: null,
            userProfile: null,
            entity: null,
            userGroup: null,
            loading: false
          })
        } else if (session?.user && event === 'SIGNED_IN') {
          // Refresh user profile
          const { data: userProfile } = await supabase
            .from('users')
            .select(`
              *,
              entity:entities(*),
              user_group:user_groups(*)
            `)
            .eq('id', session.user.id)
            .single()

          if (userProfile) {
            set({
              user: session.user,
              userProfile,
              entity: userProfile.entity as Entity,
              userGroup: userProfile.user_group as UserGroup,
              loading: false
            })
          }
        }
      })
    } catch (error) {
      console.error('Auth initialization error:', error)
      set({ loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    set({ loading: true })
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        set({ loading: false })
        return { success: false, error: error.message }
      }

      // Update last login
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
      }

      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signUp: async (email: string, password: string, fullName: string, registrationCode: string) => {
    set({ loading: true })
    
    try {
      // First validate the registration code
      const codeValidation = await get().validateRegistrationCode(registrationCode)
      if (!codeValidation.valid) {
        set({ loading: false })
        return { success: false, error: codeValidation.error || 'Invalid registration code' }
      }

      // Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            registration_code: registrationCode
          }
        }
      })

      if (error) {
        set({ loading: false })
        return { success: false, error: error.message }
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            registration_code: registrationCode,
            entity_id: codeValidation.entity?.id,
            user_group_id: codeValidation.userGroup?.id,
            preferred_language: 'en'
          })

        if (profileError) {
          console.error('Profile creation error:', profileError)
        }

        // Increment registration code usage
        await supabase
          .from('registration_codes')
          .update({ current_uses: supabase.sql`current_uses + 1` })
          .eq('code', registrationCode)
      }

      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signOut: async () => {
    set({ loading: true })
    await supabase.auth.signOut()
    set({
      user: null,
      userProfile: null,
      entity: null,
      userGroup: null,
      loading: false
    })
  },

  updateProfile: async (updates: Partial<User>) => {
    const { userProfile } = get()
    if (!userProfile) return { success: false, error: 'No user profile found' }

    try {
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userProfile.id)

      if (error) {
        return { success: false, error: error.message }
      }

      // Update local state
      set({
        userProfile: { ...userProfile, ...updates }
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  validateRegistrationCode: async (code: string) => {
    try {
      const { data, error } = await supabase
        .from('registration_codes')
        .select(`
          *,
          entity:entities(*),
          user_group:user_groups(*)
        `)
        .eq('code', code)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        return { valid: false, error: 'Registration code not found' }
      }

      // Check if code has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return { valid: false, error: 'Registration code has expired' }
      }

      // Check if code has reached max uses
      if (data.max_uses && data.current_uses >= data.max_uses) {
        return { valid: false, error: 'Registration code has reached maximum uses' }
      }

      return {
        valid: true,
        entity: data.entity as Entity,
        userGroup: data.user_group as UserGroup
      }
    } catch (error) {
      return { valid: false, error: 'Error validating registration code' }
    }
  }
}))