import { create } from 'zustand'
import { supabase } from '../services/supabase'
import { User, Entity, UserGroup, RegistrationCode } from '../types/database.types'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { analyticsService } from '../services/analyticsService'
import { sessionService } from '../services/sessionService'
import { registrationCodeService } from '../services/registrationCodeService'

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
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select(`
            *,
            entity:entities(*),
            user_group:user_groups(*)
          `)
          .eq('id', session.user.id)
          .single()

        if (!profileError && userProfile) {
          // Restore or start new session
          if (!sessionService.restoreSession()) {
            await sessionService.startSession(session.user.id, userProfile.entity_id)
          }
          
          set({
            user: session.user,
            userProfile,
            entity: userProfile.entity as Entity,
            userGroup: userProfile.user_group as UserGroup,
            loading: false,
            initialized: true
          })
        } else {
          console.log('User profile not found, loading state:', { profileError, userId: session.user.id })
          set({ loading: false, initialized: true })
        }
      } else {
        set({ loading: false, initialized: true })
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
          // End session and cleanup analytics
          await sessionService.endSession()
          
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
            // Start new session
            await sessionService.startSession(session.user.id, userProfile.entity_id)
            
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

      // Update last login and log analytics
      if (data.user) {
        await supabase
          .from('users')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id)
        
        // Log login event
        await analyticsService.logLogin(data.user.id)
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
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
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
        } else {
          // Log registration analytics
          await analyticsService.logRegistration(
            data.user.id, 
            registrationCode, 
            codeValidation.entity?.id
          )
        }

        // Use registration code service to handle usage increment
        await registrationCodeService.useCode(registrationCode, data.user.id)
      }

      set({ loading: false })
      return { success: true }
    } catch (error) {
      set({ loading: false })
      return { success: false, error: 'An unexpected error occurred' }
    }
  },

  signOut: async () => {
    const { userProfile } = get()
    set({ loading: true })
    
    // End session and log logout
    if (userProfile) {
      await analyticsService.logLogout(userProfile.id)
    }
    await sessionService.endSession()
    
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
    console.log('🔐 AuthStore: Validating registration code:', code)
    
    // Use the registration code service for validation
    const validation = await registrationCodeService.validateCode(code)
    
    if (!validation.valid) {
      return { valid: false, error: validation.message }
    }

    // Fetch entity and user group if code has them
    let entity = null, userGroup = null;
    
    if (validation.codeData?.entity_id) {
      const { data: entityData } = await supabase
        .from('entities')
        .select('*')
        .eq('id', validation.codeData.entity_id)
        .single()
      entity = entityData
    }
    
    if (validation.codeData?.user_group_id) {
      const { data: groupData } = await supabase
        .from('user_groups')
        .select('*')
        .eq('id', validation.codeData.user_group_id)
        .single()
      userGroup = groupData
    }

    return {
      valid: true,
      entity: entity as Entity,
      userGroup: userGroup as UserGroup
    }
  }
}))