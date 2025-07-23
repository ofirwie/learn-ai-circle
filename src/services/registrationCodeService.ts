import { supabase } from './supabase';
import { analyticsService } from './analyticsService';

export interface RegistrationCode {
  id?: string;
  code: string;
  entity_id?: string;
  user_group_id?: string;
  max_uses?: number;
  current_uses: number;
  expires_at?: string;
  is_active: boolean;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RegistrationCodeUsage {
  id: string;
  code: string;
  user_id: string;
  used_at: string;
  user_email?: string;
  user_name?: string;
  entity_name?: string;
  success: boolean;
  error_message?: string;
}

export interface CodeAnalytics {
  code: string;
  total_uses: number;
  successful_uses: number;
  failed_attempts: number;
  conversion_rate: number;
  average_uses_per_day: number;
  entity_name?: string;
  user_group_name?: string;
  remaining_uses?: number;
  expires_at?: string;
  status: 'active' | 'expired' | 'exhausted' | 'inactive';
}

class RegistrationCodeService {
  // Create new registration code
  async createCode(codeData: {
    code: string;
    entity_id?: string;
    user_group_id?: string;
    max_uses?: number;
    expires_at?: string;
    created_by?: string;
  }): Promise<RegistrationCode | null> {
    try {
      // Check if code already exists
      const existingCode = await this.getCodeByValue(codeData.code);
      if (existingCode) {
        throw new Error('Registration code already exists');
      }

      const { data, error } = await supabase
        .from('registration_codes')
        .insert([{
          ...codeData,
          current_uses: 0,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      // Log code creation
      await analyticsService.logEvent({
        event_type: 'registration_code_created',
        target_type: 'registration_code',
        target_id: data.code,
        metadata: {
          entity_id: codeData.entity_id,
          user_group_id: codeData.user_group_id,
          max_uses: codeData.max_uses,
          expires_at: codeData.expires_at
        }
      });

      return data;
    } catch (error) {
      console.error('Failed to create registration code:', error);
      return null;
    }
  }

  // Get registration code by value
  async getCodeByValue(code: string): Promise<RegistrationCode | null> {
    try {
      const { data, error } = await supabase
        .from('registration_codes')
        .select('*')
        .eq('code', code.toUpperCase())
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || null;
    } catch (error) {
      console.error('Failed to get registration code:', error);
      return null;
    }
  }

  // Validate registration code
  async validateCode(code: string): Promise<{
    valid: boolean;
    message: string;
    codeData?: RegistrationCode;
  }> {
    try {
      const codeData = await this.getCodeByValue(code);
      
      if (!codeData) {
        await analyticsService.logRegistrationCodeUsage(code, false, 'Code not found');
        return { valid: false, message: 'Invalid registration code' };
      }

      if (!codeData.is_active) {
        await analyticsService.logRegistrationCodeUsage(code, false, 'Code inactive');
        return { valid: false, message: 'Registration code is inactive' };
      }

      if (codeData.expires_at && new Date(codeData.expires_at) < new Date()) {
        await analyticsService.logRegistrationCodeUsage(code, false, 'Code expired');
        return { valid: false, message: 'Registration code has expired' };
      }

      if (codeData.max_uses && codeData.current_uses >= codeData.max_uses) {
        await analyticsService.logRegistrationCodeUsage(code, false, 'Code exhausted');
        return { valid: false, message: 'Registration code has reached maximum uses' };
      }

      return { valid: true, message: 'Code is valid', codeData };
    } catch (error) {
      console.error('Failed to validate registration code:', error);
      return { valid: false, message: 'Error validating code' };
    }
  }

  // Use registration code (increment usage)
  async useCode(code: string, userId: string): Promise<boolean> {
    try {
      const validation = await this.validateCode(code);
      if (!validation.valid) {
        return false;
      }

      // Increment usage count
      const { error } = await supabase
        .from('registration_codes')
        .update({ 
          current_uses: validation.codeData!.current_uses + 1,
          updated_at: new Date().toISOString()
        })
        .eq('code', code.toUpperCase());

      if (error) throw error;

      // Log successful usage
      await analyticsService.logRegistrationCodeUsage(code, true);
      
      return true;
    } catch (error) {
      console.error('Failed to use registration code:', error);
      await analyticsService.logRegistrationCodeUsage(code, false, error.message);
      return false;
    }
  }

  // Get all registration codes with details
  async getAllCodes(): Promise<RegistrationCode[]> {
    try {
      const { data, error } = await supabase
        .from('registration_codes')
        .select(`
          *,
          entities:entity_id(name),
          user_groups:user_group_id(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get registration codes:', error);
      return [];
    }
  }

  // Get codes for specific entity
  async getCodesByEntity(entityId: string): Promise<RegistrationCode[]> {
    try {
      const { data, error } = await supabase
        .from('registration_codes')
        .select('*')
        .eq('entity_id', entityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Failed to get entity codes:', error);
      return [];
    }
  }

  // Update registration code
  async updateCode(code: string, updates: Partial<RegistrationCode>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('registration_codes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('code', code.toUpperCase());

      if (error) throw error;

      // Log code update
      await analyticsService.logEvent({
        event_type: 'registration_code_updated',
        target_type: 'registration_code',
        target_id: code,
        metadata: updates
      });

      return true;
    } catch (error) {
      console.error('Failed to update registration code:', error);
      return false;
    }
  }

  // Deactivate registration code
  async deactivateCode(code: string): Promise<boolean> {
    return this.updateCode(code, { is_active: false });
  }

  // Extend code expiration
  async extendExpiration(code: string, newExpirationDate: string): Promise<boolean> {
    return this.updateCode(code, { expires_at: newExpirationDate });
  }

  // Get registration code usage history
  async getCodeUsageHistory(code: string): Promise<RegistrationCodeUsage[]> {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select(`
          *,
          users:user_id(email, full_name)
        `)
        .eq('event_type', 'registration_code_used')
        .eq('target_id', code.toUpperCase())
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(event => ({
        id: event.id,
        code: event.target_id,
        user_id: event.user_id,
        used_at: event.created_at,
        user_email: event.users?.email,
        user_name: event.users?.full_name,
        success: event.metadata?.success || false,
        error_message: event.metadata?.error
      }));
    } catch (error) {
      console.error('Failed to get code usage history:', error);
      return [];
    }
  }

  // Get registration analytics for all codes
  async getCodeAnalytics(days: number = 30): Promise<CodeAnalytics[]> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get all codes
      const codes = await this.getAllCodes();
      
      // Get usage events for the period
      const { data: events, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'registration_code_used')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const analytics = codes.map(code => {
        const codeEvents = events.filter(e => e.target_id === code.code);
        const successfulUses = codeEvents.filter(e => e.metadata?.success).length;
        const failedAttempts = codeEvents.filter(e => !e.metadata?.success).length;
        const totalUses = codeEvents.length;

        // Determine status
        let status: 'active' | 'expired' | 'exhausted' | 'inactive' = 'active';
        if (!code.is_active) status = 'inactive';
        else if (code.expires_at && new Date(code.expires_at) < new Date()) status = 'expired';
        else if (code.max_uses && code.current_uses >= code.max_uses) status = 'exhausted';

        return {
          code: code.code,
          total_uses: totalUses,
          successful_uses: successfulUses,
          failed_attempts: failedAttempts,
          conversion_rate: totalUses > 0 ? (successfulUses / totalUses) * 100 : 0,
          average_uses_per_day: totalUses / days,
          entity_name: code.entities?.name,
          user_group_name: code.user_groups?.name,
          remaining_uses: code.max_uses ? code.max_uses - code.current_uses : undefined,
          expires_at: code.expires_at,
          status
        };
      });

      return analytics.sort((a, b) => b.total_uses - a.total_uses);
    } catch (error) {
      console.error('Failed to get code analytics:', error);
      return [];
    }
  }

  // Generate bulk registration codes
  async generateBulkCodes(config: {
    prefix: string;
    count: number;
    entity_id?: string;
    user_group_id?: string;
    max_uses?: number;
    expires_at?: string;
    created_by?: string;
  }): Promise<RegistrationCode[]> {
    try {
      const codes: RegistrationCode[] = [];
      
      for (let i = 1; i <= config.count; i++) {
        const code = `${config.prefix}_${i.toString().padStart(3, '0')}`;
        
        const codeData = await this.createCode({
          code,
          entity_id: config.entity_id,
          user_group_id: config.user_group_id,
          max_uses: config.max_uses,
          expires_at: config.expires_at,
          created_by: config.created_by
        });

        if (codeData) {
          codes.push(codeData);
        }
      }

      // Log bulk generation
      await analyticsService.logEvent({
        event_type: 'bulk_codes_generated',
        target_type: 'registration_code',
        target_id: config.prefix,
        metadata: {
          count: codes.length,
          prefix: config.prefix,
          entity_id: config.entity_id,
          user_group_id: config.user_group_id
        }
      });

      return codes;
    } catch (error) {
      console.error('Failed to generate bulk codes:', error);
      return [];
    }
  }

  // Get code statistics summary
  async getCodeStatistics(): Promise<{
    total_codes: number;
    active_codes: number;
    expired_codes: number;
    exhausted_codes: number;
    total_uses: number;
    success_rate: number;
    most_used_code: string;
    recent_registrations: number;
  }> {
    try {
      const codes = await this.getAllCodes();
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get recent usage events
      const { data: recentEvents, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'registration_code_used')
        .gte('created_at', weekAgo.toISOString());

      if (error) throw error;

      const stats = {
        total_codes: codes.length,
        active_codes: codes.filter(c => c.is_active && 
          (!c.expires_at || new Date(c.expires_at) > now) &&
          (!c.max_uses || c.current_uses < c.max_uses)).length,
        expired_codes: codes.filter(c => c.expires_at && new Date(c.expires_at) <= now).length,
        exhausted_codes: codes.filter(c => c.max_uses && c.current_uses >= c.max_uses).length,
        total_uses: codes.reduce((sum, code) => sum + code.current_uses, 0),
        success_rate: 0,
        most_used_code: '',
        recent_registrations: recentEvents.filter(e => e.metadata?.success).length
      };

      // Calculate success rate
      const allEvents = await supabase
        .from('analytics_events')
        .select('metadata')
        .eq('event_type', 'registration_code_used');

      if (allEvents.data) {
        const successful = allEvents.data.filter(e => e.metadata?.success).length;
        stats.success_rate = allEvents.data.length > 0 ? (successful / allEvents.data.length) * 100 : 0;
      }

      // Find most used code
      const mostUsed = codes.reduce((max, code) => 
        code.current_uses > max.current_uses ? code : max, 
        codes[0] || { current_uses: 0, code: 'N/A' }
      );
      stats.most_used_code = mostUsed.code;

      return stats;
    } catch (error) {
      console.error('Failed to get code statistics:', error);
      return {
        total_codes: 0,
        active_codes: 0,
        expired_codes: 0,
        exhausted_codes: 0,
        total_uses: 0,
        success_rate: 0,
        most_used_code: 'N/A',
        recent_registrations: 0
      };
    }
  }

  // Export codes to CSV
  async exportCodesToCSV(): Promise<string> {
    try {
      const codes = await this.getAllCodes();
      const analytics = await this.getCodeAnalytics();
      
      const headers = [
        'Code',
        'Entity',
        'User Group',
        'Max Uses',
        'Current Uses',
        'Success Rate',
        'Status',
        'Expires At',
        'Created At'
      ];

      const rows = codes.map(code => {
        const codeAnalytics = analytics.find(a => a.code === code.code);
        return [
          code.code,
          code.entities?.name || 'N/A',
          code.user_groups?.name || 'N/A',
          code.max_uses || 'Unlimited',
          code.current_uses,
          codeAnalytics ? `${codeAnalytics.conversion_rate.toFixed(1)}%` : '0%',
          codeAnalytics?.status || 'unknown',
          code.expires_at ? new Date(code.expires_at).toLocaleDateString() : 'Never',
          code.created_at ? new Date(code.created_at).toLocaleDateString() : 'Unknown'
        ];
      });

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      return csvContent;
    } catch (error) {
      console.error('Failed to export codes to CSV:', error);
      return '';
    }
  }
}

// Export singleton instance
export const registrationCodeService = new RegistrationCodeService();
export default registrationCodeService;