export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admissions: {
        Row: {
          actual_discharge_date: string | null
          admission_date: string
          admission_number: string
          admission_time: string
          admission_type: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id: string | null
          attending_doctor_id: string | null
          bed_id: string | null
          branch_id: string
          chief_complaint: string | null
          clinical_notes: string | null
          condition_at_discharge: string | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          deposit_amount: number | null
          diagnosis_on_admission: string | null
          discharge_diagnosis: string | null
          discharge_instructions: string | null
          discharge_summary: string | null
          discharge_time: string | null
          discharge_type: Database["public"]["Enums"]["discharge_type"] | null
          discharged_by: string | null
          emergency_case_id: string | null
          estimated_cost: number | null
          expected_discharge_date: string | null
          follow_up_date: string | null
          follow_up_instructions: string | null
          history_of_present_illness: string | null
          id: string
          organization_id: string
          patient_id: string
          referring_doctor_id: string | null
          status: Database["public"]["Enums"]["admission_status"] | null
          updated_at: string | null
          ward_id: string | null
        }
        Insert: {
          actual_discharge_date?: string | null
          admission_date: string
          admission_number: string
          admission_time: string
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          bed_id?: string | null
          branch_id: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          condition_at_discharge?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          diagnosis_on_admission?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_summary?: string | null
          discharge_time?: string | null
          discharge_type?: Database["public"]["Enums"]["discharge_type"] | null
          discharged_by?: string | null
          emergency_case_id?: string | null
          estimated_cost?: number | null
          expected_discharge_date?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          history_of_present_illness?: string | null
          id?: string
          organization_id: string
          patient_id: string
          referring_doctor_id?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Update: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_number?: string
          admission_time?: string
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          bed_id?: string | null
          branch_id?: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          condition_at_discharge?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          deposit_amount?: number | null
          diagnosis_on_admission?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_summary?: string | null
          discharge_time?: string | null
          discharge_type?: Database["public"]["Enums"]["discharge_type"] | null
          discharged_by?: string | null
          emergency_case_id?: string | null
          estimated_cost?: number | null
          expected_discharge_date?: string | null
          follow_up_date?: string | null
          follow_up_instructions?: string | null
          history_of_present_illness?: string | null
          id?: string
          organization_id?: string
          patient_id?: string
          referring_doctor_id?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_admitting_doctor_id_fkey"
            columns: ["admitting_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_attending_doctor_id_fkey"
            columns: ["attending_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_discharged_by_fkey"
            columns: ["discharged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_referring_doctor_id_fkey"
            columns: ["referring_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admissions_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      ambulance_alerts: {
        Row: {
          ambulance_id: string | null
          arrival_time: string | null
          branch_id: string
          caller_name: string | null
          caller_phone: string | null
          condition_summary: string | null
          created_at: string
          created_by: string | null
          eta_minutes: number | null
          id: string
          linked_er_id: string | null
          organization_id: string
          patient_count: number | null
          prehospital_care: string | null
          priority: number | null
          status: Database["public"]["Enums"]["ambulance_status"]
          updated_at: string
        }
        Insert: {
          ambulance_id?: string | null
          arrival_time?: string | null
          branch_id: string
          caller_name?: string | null
          caller_phone?: string | null
          condition_summary?: string | null
          created_at?: string
          created_by?: string | null
          eta_minutes?: number | null
          id?: string
          linked_er_id?: string | null
          organization_id: string
          patient_count?: number | null
          prehospital_care?: string | null
          priority?: number | null
          status?: Database["public"]["Enums"]["ambulance_status"]
          updated_at?: string
        }
        Update: {
          ambulance_id?: string | null
          arrival_time?: string | null
          branch_id?: string
          caller_name?: string | null
          caller_phone?: string | null
          condition_summary?: string | null
          created_at?: string
          created_by?: string | null
          eta_minutes?: number | null
          id?: string
          linked_er_id?: string | null
          organization_id?: string
          patient_count?: number | null
          prehospital_care?: string | null
          priority?: number | null
          status?: Database["public"]["Enums"]["ambulance_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambulance_alerts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambulance_alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambulance_alerts_linked_er_id_fkey"
            columns: ["linked_er_id"]
            isOneToOne: false
            referencedRelation: "emergency_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambulance_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string | null
          appointment_type:
            | Database["public"]["Enums"]["appointment_type"]
            | null
          branch_id: string
          check_in_at: string | null
          check_in_by: string | null
          check_in_vitals: Json | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          doctor_id: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          priority: number | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          token_number: number | null
          updated_at: string
        }
        Insert: {
          appointment_date: string
          appointment_time?: string | null
          appointment_type?:
            | Database["public"]["Enums"]["appointment_type"]
            | null
          branch_id: string
          check_in_at?: string | null
          check_in_by?: string | null
          check_in_vitals?: Json | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          priority?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: number | null
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string | null
          appointment_type?:
            | Database["public"]["Enums"]["appointment_type"]
            | null
          branch_id?: string
          check_in_at?: string | null
          check_in_by?: string | null
          check_in_vitals?: Json | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          priority?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_check_in_by_fkey"
            columns: ["check_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_corrections: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attendance_id: string | null
          corrected_check_in: string | null
          corrected_check_out: string | null
          correction_date: string
          created_at: string | null
          employee_id: string
          id: string
          original_check_in: string | null
          original_check_out: string | null
          reason: string
          rejection_reason: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["leave_request_status"] | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          corrected_check_in?: string | null
          corrected_check_out?: string | null
          correction_date: string
          created_at?: string | null
          employee_id: string
          id?: string
          original_check_in?: string | null
          original_check_out?: string | null
          reason: string
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["leave_request_status"] | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attendance_id?: string | null
          corrected_check_in?: string | null
          corrected_check_out?: string | null
          correction_date?: string
          created_at?: string | null
          employee_id?: string
          id?: string
          original_check_in?: string | null
          original_check_out?: string | null
          reason?: string
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["leave_request_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_corrections_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_attendance_id_fkey"
            columns: ["attendance_id"]
            isOneToOne: false
            referencedRelation: "attendance_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_corrections_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      attendance_records: {
        Row: {
          adjusted_at: string | null
          adjusted_by: string | null
          adjustment_reason: string | null
          attendance_date: string
          branch_id: string
          check_in: string | null
          check_in_location: string | null
          check_in_source: string | null
          check_out: string | null
          check_out_location: string | null
          check_out_source: string | null
          created_at: string | null
          device_id: string | null
          early_leave_minutes: number | null
          employee_id: string
          id: string
          is_half_day: boolean | null
          late_minutes: number | null
          organization_id: string
          overtime_hours: number | null
          remarks: string | null
          status: Database["public"]["Enums"]["attendance_status"] | null
          updated_at: string | null
          working_hours: number | null
        }
        Insert: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_reason?: string | null
          attendance_date: string
          branch_id: string
          check_in?: string | null
          check_in_location?: string | null
          check_in_source?: string | null
          check_out?: string | null
          check_out_location?: string | null
          check_out_source?: string | null
          created_at?: string | null
          device_id?: string | null
          early_leave_minutes?: number | null
          employee_id: string
          id?: string
          is_half_day?: boolean | null
          late_minutes?: number | null
          organization_id: string
          overtime_hours?: number | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
          working_hours?: number | null
        }
        Update: {
          adjusted_at?: string | null
          adjusted_by?: string | null
          adjustment_reason?: string | null
          attendance_date?: string
          branch_id?: string
          check_in?: string | null
          check_in_location?: string | null
          check_in_source?: string | null
          check_out?: string | null
          check_out_location?: string | null
          check_out_source?: string | null
          created_at?: string | null
          device_id?: string | null
          early_leave_minutes?: number | null
          employee_id?: string
          id?: string
          is_half_day?: boolean | null
          late_minutes?: number | null
          organization_id?: string
          overtime_hours?: number | null
          remarks?: string | null
          status?: Database["public"]["Enums"]["attendance_status"] | null
          updated_at?: string | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_records_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "biometric_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attendance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_transfers: {
        Row: {
          admission_id: string
          created_at: string | null
          from_bed_id: string | null
          from_ward_id: string | null
          id: string
          notes: string | null
          ordered_by: string | null
          to_bed_id: string
          to_ward_id: string
          transfer_reason: string | null
          transferred_at: string | null
          transferred_by: string | null
        }
        Insert: {
          admission_id: string
          created_at?: string | null
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          to_bed_id: string
          to_ward_id: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_by?: string | null
        }
        Update: {
          admission_id?: string
          created_at?: string | null
          from_bed_id?: string | null
          from_ward_id?: string | null
          id?: string
          notes?: string | null
          ordered_by?: string | null
          to_bed_id?: string
          to_ward_id?: string
          transfer_reason?: string | null
          transferred_at?: string | null
          transferred_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_transfers_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_from_bed_id_fkey"
            columns: ["from_bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_from_ward_id_fkey"
            columns: ["from_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_to_bed_id_fkey"
            columns: ["to_bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_to_ward_id_fkey"
            columns: ["to_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_transfers_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      beds: {
        Row: {
          bed_number: string
          bed_type: string | null
          created_at: string | null
          current_admission_id: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          notes: string | null
          position_col: number | null
          position_row: number | null
          status: Database["public"]["Enums"]["bed_status"] | null
          updated_at: string | null
          ward_id: string
        }
        Insert: {
          bed_number: string
          bed_type?: string | null
          created_at?: string | null
          current_admission_id?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          position_col?: number | null
          position_row?: number | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          updated_at?: string | null
          ward_id: string
        }
        Update: {
          bed_number?: string
          bed_type?: string | null
          created_at?: string | null
          current_admission_id?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          position_col?: number | null
          position_row?: number | null
          status?: Database["public"]["Enums"]["bed_status"] | null
          updated_at?: string | null
          ward_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beds_current_admission_id_fkey"
            columns: ["current_admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beds_ward_id_fkey"
            columns: ["ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
        ]
      }
      biometric_devices: {
        Row: {
          branch_id: string
          created_at: string | null
          device_name: string
          device_serial: string | null
          device_type: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_sync_at: string | null
          location: string | null
          organization_id: string
          port: number | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          device_name: string
          device_serial?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          organization_id: string
          port?: number | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          device_name?: string
          device_serial?: string | null
          device_type?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          organization_id?: string
          port?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_devices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_settings: {
        Row: {
          branch_id: string
          created_at: string
          id: string
          setting_key: string
          setting_type: Database["public"]["Enums"]["setting_type"] | null
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          id?: string
          setting_key: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          id?: string
          setting_key?: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branch_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
        ]
      }
      branches: {
        Row: {
          address: string | null
          city: string | null
          code: string
          created_at: string
          email: string | null
          id: string
          is_active: boolean | null
          is_main_branch: boolean | null
          name: string
          organization_id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          code: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_branch?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          code?: string
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_branch?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "branches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          appointment_id: string
          branch_id: string
          chief_complaint: string | null
          clinical_notes: string | null
          created_at: string
          diagnosis: string | null
          doctor_id: string
          follow_up_date: string | null
          id: string
          patient_id: string
          symptoms: string | null
          updated_at: string
          vitals: Json | null
        }
        Insert: {
          appointment_id: string
          branch_id: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id: string
          follow_up_date?: string | null
          id?: string
          patient_id: string
          symptoms?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Update: {
          appointment_id?: string
          branch_id?: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          created_at?: string
          diagnosis?: string | null
          doctor_id?: string
          follow_up_date?: string | null
          id?: string
          patient_id?: string
          symptoms?: string | null
          updated_at?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_field_values: {
        Row: {
          created_at: string
          custom_field_id: string
          entity_id: string
          id: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          custom_field_id: string
          entity_id: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          custom_field_id?: string
          entity_id?: string
          id?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_field_values_custom_field_id_fkey"
            columns: ["custom_field_id"]
            isOneToOne: false
            referencedRelation: "custom_fields"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_fields: {
        Row: {
          created_at: string
          entity_type: string
          field_label: string
          field_name: string
          field_type: Database["public"]["Enums"]["field_type"] | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string
          entity_type: string
          field_label: string
          field_name: string
          field_type?: Database["public"]["Enums"]["field_type"] | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string
          entity_type?: string
          field_label?: string
          field_name?: string
          field_type?: Database["public"]["Enums"]["field_type"] | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_fields_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_rounds: {
        Row: {
          activity_orders: string | null
          admission_id: string
          condition_status: string | null
          created_at: string | null
          critical_notes: string | null
          diagnosis_update: string | null
          diet_orders: string | null
          doctor_id: string
          findings: string | null
          id: string
          instructions: string | null
          medications_changed: boolean | null
          notes: string | null
          round_date: string
          round_time: string
          vitals: Json | null
        }
        Insert: {
          activity_orders?: string | null
          admission_id: string
          condition_status?: string | null
          created_at?: string | null
          critical_notes?: string | null
          diagnosis_update?: string | null
          diet_orders?: string | null
          doctor_id: string
          findings?: string | null
          id?: string
          instructions?: string | null
          medications_changed?: boolean | null
          notes?: string | null
          round_date: string
          round_time: string
          vitals?: Json | null
        }
        Update: {
          activity_orders?: string | null
          admission_id?: string
          condition_status?: string | null
          created_at?: string | null
          critical_notes?: string | null
          diagnosis_update?: string | null
          diet_orders?: string | null
          doctor_id?: string
          findings?: string | null
          id?: string
          instructions?: string | null
          medications_changed?: boolean | null
          notes?: string | null
          round_date?: string
          round_time?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_rounds_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_rounds_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      departments: {
        Row: {
          code: string
          cost_center_code: string | null
          created_at: string | null
          description: string | null
          head_employee_id: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          parent_department_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          cost_center_code?: string | null
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          cost_center_code?: string | null
          created_at?: string | null
          description?: string | null
          head_employee_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          parent_department_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_head_employee_id_fkey"
            columns: ["head_employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "departments_parent_department_id_fkey"
            columns: ["parent_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      designations: {
        Row: {
          code: string
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          job_description: string | null
          level: number | null
          max_salary: number | null
          min_salary: number | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          job_description?: string | null
          level?: number | null
          max_salary?: number | null
          min_salary?: number | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          job_description?: string | null
          level?: number | null
          max_salary?: number | null
          min_salary?: number | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designations_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_charts: {
        Row: {
          admission_id: string
          allergies: string | null
          calories_target: number | null
          carbs_target: number | null
          created_at: string | null
          custom_diet: string | null
          diet_type: Database["public"]["Enums"]["diet_type"] | null
          effective_from: string
          effective_to: string | null
          fat_target: number | null
          fluid_restriction_ml: number | null
          id: string
          meal_timings: Json | null
          preferences: string | null
          prescribed_by: string | null
          protein_target: number | null
          restrictions: string | null
          special_instructions: string | null
        }
        Insert: {
          admission_id: string
          allergies?: string | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          custom_diet?: string | null
          diet_type?: Database["public"]["Enums"]["diet_type"] | null
          effective_from?: string
          effective_to?: string | null
          fat_target?: number | null
          fluid_restriction_ml?: number | null
          id?: string
          meal_timings?: Json | null
          preferences?: string | null
          prescribed_by?: string | null
          protein_target?: number | null
          restrictions?: string | null
          special_instructions?: string | null
        }
        Update: {
          admission_id?: string
          allergies?: string | null
          calories_target?: number | null
          carbs_target?: number | null
          created_at?: string | null
          custom_diet?: string | null
          diet_type?: Database["public"]["Enums"]["diet_type"] | null
          effective_from?: string
          effective_to?: string | null
          fat_target?: number | null
          fluid_restriction_ml?: number | null
          id?: string
          meal_timings?: Json | null
          preferences?: string | null
          prescribed_by?: string | null
          protein_target?: number | null
          restrictions?: string | null
          special_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_charts_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diet_charts_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      discharge_summaries: {
        Row: {
          activity_instructions: string | null
          admission_diagnosis: string | null
          admission_id: string
          approved_at: string | null
          approved_by: string | null
          condition_at_admission: string | null
          condition_at_discharge: string | null
          created_at: string | null
          diet_instructions: string | null
          discharge_diagnosis: string | null
          follow_up_appointments: Json | null
          follow_up_instructions: string | null
          hospital_course: string | null
          id: string
          investigations_summary: Json | null
          medications_on_discharge: Json | null
          medications_stopped: Json | null
          prepared_by: string | null
          procedures_performed: Json | null
          referrals: Json | null
          significant_findings: string | null
          status: string | null
          summary_date: string
          updated_at: string | null
          warning_signs: string | null
        }
        Insert: {
          activity_instructions?: string | null
          admission_diagnosis?: string | null
          admission_id: string
          approved_at?: string | null
          approved_by?: string | null
          condition_at_admission?: string | null
          condition_at_discharge?: string | null
          created_at?: string | null
          diet_instructions?: string | null
          discharge_diagnosis?: string | null
          follow_up_appointments?: Json | null
          follow_up_instructions?: string | null
          hospital_course?: string | null
          id?: string
          investigations_summary?: Json | null
          medications_on_discharge?: Json | null
          medications_stopped?: Json | null
          prepared_by?: string | null
          procedures_performed?: Json | null
          referrals?: Json | null
          significant_findings?: string | null
          status?: string | null
          summary_date?: string
          updated_at?: string | null
          warning_signs?: string | null
        }
        Update: {
          activity_instructions?: string | null
          admission_diagnosis?: string | null
          admission_id?: string
          approved_at?: string | null
          approved_by?: string | null
          condition_at_admission?: string | null
          condition_at_discharge?: string | null
          created_at?: string | null
          diet_instructions?: string | null
          discharge_diagnosis?: string | null
          follow_up_appointments?: Json | null
          follow_up_instructions?: string | null
          hospital_course?: string | null
          id?: string
          investigations_summary?: Json | null
          medications_on_discharge?: Json | null
          medications_stopped?: Json | null
          prepared_by?: string | null
          procedures_performed?: Json | null
          referrals?: Json | null
          significant_findings?: string | null
          status?: string | null
          summary_date?: string
          updated_at?: string | null
          warning_signs?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discharge_summaries_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_summaries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discharge_summaries_prepared_by_fkey"
            columns: ["prepared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_schedules: {
        Row: {
          created_at: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id: string
          is_active: boolean | null
          max_patients_per_slot: number | null
          slot_duration_minutes: number | null
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          doctor_id: string
          end_time: string
          id?: string
          is_active?: boolean | null
          max_patients_per_slot?: number | null
          slot_duration_minutes?: number | null
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          doctor_id?: string
          end_time?: string
          id?: string
          is_active?: boolean | null
          max_patients_per_slot?: number | null
          slot_duration_minutes?: number | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_schedules_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          branch_id: string | null
          consultation_fee: number | null
          created_at: string
          employee_id: string | null
          id: string
          is_available: boolean | null
          license_number: string | null
          organization_id: string
          profile_id: string
          qualification: string | null
          specialization: string | null
          updated_at: string
        }
        Insert: {
          branch_id?: string | null
          consultation_fee?: number | null
          created_at?: string
          employee_id?: string | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          organization_id: string
          profile_id: string
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Update: {
          branch_id?: string | null
          consultation_fee?: number | null
          created_at?: string
          employee_id?: string | null
          id?: string
          is_available?: boolean | null
          license_number?: string | null
          organization_id?: string
          profile_id?: string
          qualification?: string | null
          specialization?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctors_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctors_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_registrations: {
        Row: {
          admission_id: string | null
          arrival_mode: Database["public"]["Enums"]["arrival_mode"]
          arrival_time: string
          assigned_doctor_id: string | null
          assigned_zone: string | null
          branch_id: string
          brought_by_name: string | null
          brought_by_phone: string | null
          brought_by_relation: string | null
          chief_complaint: string | null
          created_at: string
          created_by: string | null
          disposition_notes: string | null
          disposition_time: string | null
          er_number: string
          fir_number: string | null
          id: string
          is_mlc: boolean | null
          is_trauma: boolean | null
          mechanism_of_injury: string | null
          organization_id: string
          patient_id: string | null
          police_station: string | null
          status: Database["public"]["Enums"]["er_status"]
          triage_level: Database["public"]["Enums"]["triage_level"] | null
          triage_time: string | null
          triaged_by: string | null
          unknown_patient_details: Json | null
          updated_at: string
          vitals: Json | null
        }
        Insert: {
          admission_id?: string | null
          arrival_mode?: Database["public"]["Enums"]["arrival_mode"]
          arrival_time?: string
          assigned_doctor_id?: string | null
          assigned_zone?: string | null
          branch_id: string
          brought_by_name?: string | null
          brought_by_phone?: string | null
          brought_by_relation?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          disposition_notes?: string | null
          disposition_time?: string | null
          er_number: string
          fir_number?: string | null
          id?: string
          is_mlc?: boolean | null
          is_trauma?: boolean | null
          mechanism_of_injury?: string | null
          organization_id: string
          patient_id?: string | null
          police_station?: string | null
          status?: Database["public"]["Enums"]["er_status"]
          triage_level?: Database["public"]["Enums"]["triage_level"] | null
          triage_time?: string | null
          triaged_by?: string | null
          unknown_patient_details?: Json | null
          updated_at?: string
          vitals?: Json | null
        }
        Update: {
          admission_id?: string | null
          arrival_mode?: Database["public"]["Enums"]["arrival_mode"]
          arrival_time?: string
          assigned_doctor_id?: string | null
          assigned_zone?: string | null
          branch_id?: string
          brought_by_name?: string | null
          brought_by_phone?: string | null
          brought_by_relation?: string | null
          chief_complaint?: string | null
          created_at?: string
          created_by?: string | null
          disposition_notes?: string | null
          disposition_time?: string | null
          er_number?: string
          fir_number?: string | null
          id?: string
          is_mlc?: boolean | null
          is_trauma?: boolean | null
          mechanism_of_injury?: string | null
          organization_id?: string
          patient_id?: string | null
          police_station?: string | null
          status?: Database["public"]["Enums"]["er_status"]
          triage_level?: Database["public"]["Enums"]["triage_level"] | null
          triage_time?: string | null
          triaged_by?: string | null
          unknown_patient_details?: Json | null
          updated_at?: string
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_registrations_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_assigned_doctor_id_fkey"
            columns: ["assigned_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_registrations_triaged_by_fkey"
            columns: ["triaged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          default_working_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          overtime_eligible: boolean | null
          requires_license: boolean | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          default_working_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          overtime_eligible?: boolean | null
          requires_license?: boolean | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          default_working_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          overtime_eligible?: boolean | null
          requires_license?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_dependents: {
        Row: {
          created_at: string | null
          date_of_birth: string | null
          employee_id: string
          id: string
          is_emergency_contact: boolean | null
          name: string
          national_id: string | null
          phone: string | null
          relationship: string | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth?: string | null
          employee_id: string
          id?: string
          is_emergency_contact?: boolean | null
          name: string
          national_id?: string | null
          phone?: string | null
          relationship?: string | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string | null
          employee_id?: string
          id?: string
          is_emergency_contact?: boolean | null
          name?: string
          national_id?: string | null
          phone?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_dependents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_documents: {
        Row: {
          created_at: string | null
          document_category:
            | Database["public"]["Enums"]["document_category"]
            | null
          document_name: string
          document_number: string | null
          document_type: string
          employee_id: string
          expiry_date: string | null
          file_url: string
          id: string
          issue_date: string | null
          notes: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_category?:
            | Database["public"]["Enums"]["document_category"]
            | null
          document_name: string
          document_number?: string | null
          document_type: string
          employee_id: string
          expiry_date?: string | null
          file_url: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_category?:
            | Database["public"]["Enums"]["document_category"]
            | null
          document_name?: string
          document_number?: string | null
          document_type?: string
          employee_id?: string
          expiry_date?: string | null
          file_url?: string
          id?: string
          issue_date?: string | null
          notes?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_documents_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_documents_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_licenses: {
        Row: {
          created_at: string | null
          document_url: string | null
          employee_id: string
          expiry_date: string | null
          id: string
          is_verified: boolean | null
          issue_date: string | null
          issuing_authority: string | null
          license_number: string
          license_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          license_number: string
          license_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          expiry_date?: string | null
          id?: string
          is_verified?: boolean | null
          issue_date?: string | null
          issuing_authority?: string | null
          license_number?: string
          license_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_licenses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_licenses_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_loans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          employee_id: string
          id: string
          installment_amount: number
          interest_rate: number | null
          loan_amount: number
          loan_type: string
          notes: string | null
          organization_id: string
          paid_installments: number | null
          remaining_amount: number | null
          start_month: number | null
          start_year: number | null
          status: Database["public"]["Enums"]["loan_status"] | null
          total_installments: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          installment_amount: number
          interest_rate?: number | null
          loan_amount: number
          loan_type: string
          notes?: string | null
          organization_id: string
          paid_installments?: number | null
          remaining_amount?: number | null
          start_month?: number | null
          start_year?: number | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          total_installments: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          installment_amount?: number
          interest_rate?: number | null
          loan_amount?: number
          loan_type?: string
          notes?: string | null
          organization_id?: string
          paid_installments?: number | null
          remaining_amount?: number | null
          start_month?: number | null
          start_year?: number | null
          status?: Database["public"]["Enums"]["loan_status"] | null
          total_installments?: number
        }
        Relationships: [
          {
            foreignKeyName: "employee_loans_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_loans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_qualifications: {
        Row: {
          certificate_url: string | null
          completion_year: number | null
          created_at: string | null
          degree_name: string
          employee_id: string
          field_of_study: string | null
          grade: string | null
          id: string
          institution: string | null
          is_highest_qualification: boolean | null
          start_year: number | null
        }
        Insert: {
          certificate_url?: string | null
          completion_year?: number | null
          created_at?: string | null
          degree_name: string
          employee_id: string
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string | null
          is_highest_qualification?: boolean | null
          start_year?: number | null
        }
        Update: {
          certificate_url?: string | null
          completion_year?: number | null
          created_at?: string | null
          degree_name?: string
          employee_id?: string
          field_of_study?: string | null
          grade?: string | null
          id?: string
          institution?: string | null
          is_highest_qualification?: boolean | null
          start_year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_qualifications_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_salaries: {
        Row: {
          basic_salary: number
          component_overrides: Json | null
          created_at: string | null
          created_by: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          is_current: boolean | null
          salary_structure_id: string | null
        }
        Insert: {
          basic_salary: number
          component_overrides?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          is_current?: boolean | null
          salary_structure_id?: string | null
        }
        Update: {
          basic_salary?: number
          component_overrides?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          is_current?: boolean | null
          salary_structure_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_salaries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_salaries_salary_structure_id_fkey"
            columns: ["salary_structure_id"]
            isOneToOne: false
            referencedRelation: "salary_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_work_history: {
        Row: {
          company_name: string
          created_at: string | null
          designation: string | null
          duties: string | null
          employee_id: string
          end_date: string | null
          id: string
          last_salary: number | null
          leaving_reason: string | null
          reference_contact: string | null
          start_date: string | null
        }
        Insert: {
          company_name: string
          created_at?: string | null
          designation?: string | null
          duties?: string | null
          employee_id: string
          end_date?: string | null
          id?: string
          last_salary?: number | null
          leaving_reason?: string | null
          reference_contact?: string | null
          start_date?: string | null
        }
        Update: {
          company_name?: string
          created_at?: string | null
          designation?: string | null
          duties?: string | null
          employee_id?: string
          end_date?: string | null
          id?: string
          last_salary?: number | null
          leaving_reason?: string | null
          reference_contact?: string | null
          start_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_work_history_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          account_number: string | null
          account_title: string | null
          bank_branch: string | null
          bank_name: string | null
          blood_group: string | null
          branch_id: string | null
          category_id: string | null
          city: string | null
          confirmation_date: string | null
          created_at: string | null
          created_by: string | null
          current_address: string | null
          date_of_birth: string | null
          department_id: string | null
          designation_id: string | null
          driving_license: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          employee_number: string
          employee_type: Database["public"]["Enums"]["employee_type"] | null
          employment_status:
            | Database["public"]["Enums"]["employment_status"]
            | null
          father_husband_name: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          iban: string | null
          id: string
          join_date: string
          last_name: string | null
          last_working_date: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          national_id: string | null
          nationality: string | null
          notes: string | null
          organization_id: string
          passport_expiry: string | null
          passport_number: string | null
          permanent_address: string | null
          personal_email: string | null
          personal_phone: string | null
          postal_code: string | null
          probation_period_months: number | null
          profile_id: string | null
          profile_photo_url: string | null
          religion: string | null
          reporting_manager_id: string | null
          resignation_date: string | null
          shift_id: string | null
          updated_at: string | null
          work_email: string | null
          work_location: string | null
          work_phone: string | null
          working_hours: number | null
        }
        Insert: {
          account_number?: string | null
          account_title?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          blood_group?: string | null
          branch_id?: string | null
          category_id?: string | null
          city?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          driving_license?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number: string
          employee_type?: Database["public"]["Enums"]["employee_type"] | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          father_husband_name?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          iban?: string | null
          id?: string
          join_date: string
          last_name?: string | null
          last_working_date?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id: string
          passport_expiry?: string | null
          passport_number?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          postal_code?: string | null
          probation_period_months?: number | null
          profile_id?: string | null
          profile_photo_url?: string | null
          religion?: string | null
          reporting_manager_id?: string | null
          resignation_date?: string | null
          shift_id?: string | null
          updated_at?: string | null
          work_email?: string | null
          work_location?: string | null
          work_phone?: string | null
          working_hours?: number | null
        }
        Update: {
          account_number?: string | null
          account_title?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          blood_group?: string | null
          branch_id?: string | null
          category_id?: string | null
          city?: string | null
          confirmation_date?: string | null
          created_at?: string | null
          created_by?: string | null
          current_address?: string | null
          date_of_birth?: string | null
          department_id?: string | null
          designation_id?: string | null
          driving_license?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          employee_number?: string
          employee_type?: Database["public"]["Enums"]["employee_type"] | null
          employment_status?:
            | Database["public"]["Enums"]["employment_status"]
            | null
          father_husband_name?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          iban?: string | null
          id?: string
          join_date?: string
          last_name?: string | null
          last_working_date?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          organization_id?: string
          passport_expiry?: string | null
          passport_number?: string | null
          permanent_address?: string | null
          personal_email?: string | null
          personal_phone?: string | null
          postal_code?: string | null
          probation_period_months?: number | null
          profile_id?: string | null
          profile_photo_url?: string | null
          religion?: string | null
          reporting_manager_id?: string | null
          resignation_date?: string | null
          shift_id?: string | null
          updated_at?: string | null
          work_email?: string | null
          work_location?: string | null
          work_phone?: string | null
          working_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "employee_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_reporting_manager_id_fkey"
            columns: ["reporting_manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      er_treatments: {
        Row: {
          created_at: string
          description: string
          er_id: string
          id: string
          notes: string | null
          performed_by: string | null
          treatment_time: string
          treatment_type: Database["public"]["Enums"]["er_treatment_type"]
        }
        Insert: {
          created_at?: string
          description: string
          er_id: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          treatment_time?: string
          treatment_type: Database["public"]["Enums"]["er_treatment_type"]
        }
        Update: {
          created_at?: string
          description?: string
          er_id?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          treatment_time?: string
          treatment_type?: Database["public"]["Enums"]["er_treatment_type"]
        }
        Relationships: [
          {
            foreignKeyName: "er_treatments_er_id_fkey"
            columns: ["er_id"]
            isOneToOne: false
            referencedRelation: "emergency_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "er_treatments_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      holidays: {
        Row: {
          applies_to_categories: string[] | null
          created_at: string | null
          description: string | null
          holiday_date: string
          id: string
          is_optional: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          applies_to_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          holiday_date: string
          id?: string
          is_optional?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          applies_to_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          holiday_date?: string
          id?: string
          is_optional?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "holidays_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string
          description: string
          discount_percent: number | null
          id: string
          invoice_id: string
          medicine_inventory_id: string | null
          quantity: number | null
          service_type_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          created_at?: string
          description: string
          discount_percent?: number | null
          id?: string
          invoice_id: string
          medicine_inventory_id?: string | null
          quantity?: number | null
          service_type_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          created_at?: string
          description?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string
          medicine_inventory_id?: string | null
          quantity?: number | null
          service_type_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_medicine_inventory_id_fkey"
            columns: ["medicine_inventory_id"]
            isOneToOne: false
            referencedRelation: "medicine_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          branch_id: string
          created_at: string
          created_by: string | null
          discount_amount: number | null
          id: string
          invoice_date: string | null
          invoice_number: string
          notes: string | null
          organization_id: string
          paid_amount: number | null
          patient_id: string
          status: Database["public"]["Enums"]["invoice_status"] | null
          subtotal: number | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number: string
          notes?: string | null
          organization_id: string
          paid_amount?: number | null
          patient_id: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number | null
          id?: string
          invoice_date?: string | null
          invoice_number?: string
          notes?: string | null
          organization_id?: string
          paid_amount?: number | null
          patient_id?: string
          status?: Database["public"]["Enums"]["invoice_status"] | null
          subtotal?: number | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_charges: {
        Row: {
          added_by: string | null
          admission_id: string
          charge_date: string
          charge_type: string
          created_at: string | null
          description: string
          discount_percent: number | null
          id: string
          invoice_id: string | null
          is_billed: boolean | null
          quantity: number | null
          service_type_id: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          added_by?: string | null
          admission_id: string
          charge_date?: string
          charge_type: string
          created_at?: string | null
          description: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          quantity?: number | null
          service_type_id?: string | null
          total_amount: number
          unit_price: number
        }
        Update: {
          added_by?: string | null
          admission_id?: string
          charge_date?: string
          charge_type?: string
          created_at?: string | null
          description?: string
          discount_percent?: number | null
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          quantity?: number | null
          service_type_id?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "ipd_charges_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_charges_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_charges_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_charges_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_medications: {
        Row: {
          admission_id: string
          created_at: string | null
          discontinue_reason: string | null
          discontinued_at: string | null
          discontinued_by: string | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          is_active: boolean | null
          is_prn: boolean | null
          medicine_id: string | null
          medicine_name: string
          prescribed_by: string | null
          prescription_id: string | null
          prn_indication: string | null
          route: Database["public"]["Enums"]["medication_route"] | null
          special_instructions: string | null
          start_date: string
          timing_schedule: Json | null
        }
        Insert: {
          admission_id: string
          created_at?: string | null
          discontinue_reason?: string | null
          discontinued_at?: string | null
          discontinued_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_prn?: boolean | null
          medicine_id?: string | null
          medicine_name: string
          prescribed_by?: string | null
          prescription_id?: string | null
          prn_indication?: string | null
          route?: Database["public"]["Enums"]["medication_route"] | null
          special_instructions?: string | null
          start_date: string
          timing_schedule?: Json | null
        }
        Update: {
          admission_id?: string
          created_at?: string | null
          discontinue_reason?: string | null
          discontinued_at?: string | null
          discontinued_by?: string | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          is_active?: boolean | null
          is_prn?: boolean | null
          medicine_id?: string | null
          medicine_name?: string
          prescribed_by?: string | null
          prescription_id?: string | null
          prn_indication?: string | null
          route?: Database["public"]["Enums"]["medication_route"] | null
          special_instructions?: string | null
          start_date?: string
          timing_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_medications_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_medications_discontinued_by_fkey"
            columns: ["discontinued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_medications_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_medications_prescribed_by_fkey"
            columns: ["prescribed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_medications_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_vitals: {
        Row: {
          admission_id: string
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar: number | null
          consciousness_level: string | null
          created_at: string | null
          gcs_score: number | null
          height: number | null
          id: string
          intake_ml: number | null
          intake_type: string | null
          notes: string | null
          output_ml: number | null
          output_type: string | null
          oxygen_saturation: number | null
          pain_score: number | null
          pulse: number | null
          recorded_at: string | null
          recorded_by: string
          respiratory_rate: number | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          admission_id: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          consciousness_level?: string | null
          created_at?: string | null
          gcs_score?: number | null
          height?: number | null
          id?: string
          intake_ml?: number | null
          intake_type?: string | null
          notes?: string | null
          output_ml?: number | null
          output_type?: string | null
          oxygen_saturation?: number | null
          pain_score?: number | null
          pulse?: number | null
          recorded_at?: string | null
          recorded_by: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          admission_id?: string
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar?: number | null
          consciousness_level?: string | null
          created_at?: string | null
          gcs_score?: number | null
          height?: number | null
          id?: string
          intake_ml?: number | null
          intake_type?: string | null
          notes?: string | null
          output_ml?: number | null
          output_type?: string | null
          oxygen_saturation?: number | null
          pain_score?: number | null
          pulse?: number | null
          recorded_at?: string | null
          recorded_by?: string
          respiratory_rate?: number | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_vitals_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_vitals_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_order_items: {
        Row: {
          created_at: string
          id: string
          instructions: string | null
          lab_order_id: string
          performed_by: string | null
          result: string | null
          result_date: string | null
          result_notes: string | null
          result_values: Json | null
          service_type_id: string | null
          status: Database["public"]["Enums"]["lab_item_status"]
          test_category: string
          test_name: string
        }
        Insert: {
          created_at?: string
          id?: string
          instructions?: string | null
          lab_order_id: string
          performed_by?: string | null
          result?: string | null
          result_date?: string | null
          result_notes?: string | null
          result_values?: Json | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["lab_item_status"]
          test_category?: string
          test_name: string
        }
        Update: {
          created_at?: string
          id?: string
          instructions?: string | null
          lab_order_id?: string
          performed_by?: string | null
          result?: string | null
          result_date?: string | null
          result_notes?: string | null
          result_values?: Json | null
          service_type_id?: string | null
          status?: Database["public"]["Enums"]["lab_item_status"]
          test_category?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_order_items_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_order_items_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_orders: {
        Row: {
          branch_id: string
          clinical_notes: string | null
          completed_at: string | null
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          order_number: string
          patient_id: string
          priority: Database["public"]["Enums"]["lab_order_priority"]
          result_notes: string | null
          status: Database["public"]["Enums"]["lab_order_status"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          clinical_notes?: string | null
          completed_at?: string | null
          consultation_id: string
          created_at?: string
          doctor_id: string
          id?: string
          order_number: string
          patient_id: string
          priority?: Database["public"]["Enums"]["lab_order_priority"]
          result_notes?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          clinical_notes?: string | null
          completed_at?: string | null
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          order_number?: string
          patient_id?: string
          priority?: Database["public"]["Enums"]["lab_order_priority"]
          result_notes?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_test_templates: {
        Row: {
          created_at: string
          fields: Json
          id: string
          is_active: boolean | null
          organization_id: string | null
          test_category: string
          test_name: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          test_category?: string
          test_name: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          test_category?: string
          test_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_balances: {
        Row: {
          adjustment: number | null
          carried_forward: number | null
          created_at: string | null
          employee_id: string
          entitled: number | null
          id: string
          leave_type_id: string
          pending: number | null
          updated_at: string | null
          used: number | null
          year: number
        }
        Insert: {
          adjustment?: number | null
          carried_forward?: number | null
          created_at?: string | null
          employee_id: string
          entitled?: number | null
          id?: string
          leave_type_id: string
          pending?: number | null
          updated_at?: string | null
          used?: number | null
          year: number
        }
        Update: {
          adjustment?: number | null
          carried_forward?: number | null
          created_at?: string | null
          employee_id?: string
          entitled?: number | null
          id?: string
          leave_type_id?: string
          pending?: number | null
          updated_at?: string | null
          used?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_balances_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_balances_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_encashments: {
        Row: {
          amount_per_day: number
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_encashed: number
          employee_id: string
          id: string
          leave_type_id: string
          processed_in_payroll_id: string | null
          status: Database["public"]["Enums"]["leave_request_status"] | null
          total_amount: number
          year: number
        }
        Insert: {
          amount_per_day: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_encashed: number
          employee_id: string
          id?: string
          leave_type_id: string
          processed_in_payroll_id?: string | null
          status?: Database["public"]["Enums"]["leave_request_status"] | null
          total_amount: number
          year: number
        }
        Update: {
          amount_per_day?: number
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_encashed?: number
          employee_id?: string
          id?: string
          leave_type_id?: string
          processed_in_payroll_id?: string | null
          status?: Database["public"]["Enums"]["leave_request_status"] | null
          total_amount?: number
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_encashments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_encashments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_encashments_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_requests: {
        Row: {
          applied_at: string | null
          approver_1_action:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_1_at: string | null
          approver_1_id: string | null
          approver_1_remarks: string | null
          approver_2_action:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_2_at: string | null
          approver_2_id: string | null
          approver_2_remarks: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          contact_address: string | null
          contact_phone: string | null
          created_at: string | null
          document_url: string | null
          employee_id: string
          end_date: string
          half_day_type: string | null
          id: string
          is_half_day: boolean | null
          leave_type_id: string
          organization_id: string
          reason: string | null
          start_date: string
          status: Database["public"]["Enums"]["leave_request_status"] | null
          total_days: number
        }
        Insert: {
          applied_at?: string | null
          approver_1_action?:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_1_at?: string | null
          approver_1_id?: string | null
          approver_1_remarks?: string | null
          approver_2_action?:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_2_at?: string | null
          approver_2_id?: string | null
          approver_2_remarks?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id: string
          end_date: string
          half_day_type?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id: string
          organization_id: string
          reason?: string | null
          start_date: string
          status?: Database["public"]["Enums"]["leave_request_status"] | null
          total_days: number
        }
        Update: {
          applied_at?: string | null
          approver_1_action?:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_1_at?: string | null
          approver_1_id?: string | null
          approver_1_remarks?: string | null
          approver_2_action?:
            | Database["public"]["Enums"]["leave_request_status"]
            | null
          approver_2_at?: string | null
          approver_2_id?: string | null
          approver_2_remarks?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          contact_address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          document_url?: string | null
          employee_id?: string
          end_date?: string
          half_day_type?: string | null
          id?: string
          is_half_day?: boolean | null
          leave_type_id?: string
          organization_id?: string
          reason?: string | null
          start_date?: string
          status?: Database["public"]["Enums"]["leave_request_status"] | null
          total_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approver_1_id_fkey"
            columns: ["approver_1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_approver_2_id_fkey"
            columns: ["approver_2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_leave_type_id_fkey"
            columns: ["leave_type_id"]
            isOneToOne: false
            referencedRelation: "leave_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      leave_types: {
        Row: {
          annual_quota: number | null
          applicable_categories: string[] | null
          applicable_genders: string[] | null
          carry_forward_expiry_months: number | null
          carry_forward_limit: number | null
          code: string
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_encashable: boolean | null
          is_paid: boolean | null
          max_consecutive_days: number | null
          min_days_notice: number | null
          name: string
          organization_id: string
          requires_approval: boolean | null
          requires_document: boolean | null
        }
        Insert: {
          annual_quota?: number | null
          applicable_categories?: string[] | null
          applicable_genders?: string[] | null
          carry_forward_expiry_months?: number | null
          carry_forward_limit?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_encashable?: boolean | null
          is_paid?: boolean | null
          max_consecutive_days?: number | null
          min_days_notice?: number | null
          name: string
          organization_id: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Update: {
          annual_quota?: number | null
          applicable_categories?: string[] | null
          applicable_genders?: string[] | null
          carry_forward_expiry_months?: number | null
          carry_forward_limit?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_encashable?: boolean | null
          is_paid?: boolean | null
          max_consecutive_days?: number | null
          min_days_notice?: number | null
          name?: string
          organization_id?: string
          requires_approval?: boolean | null
          requires_document?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "leave_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_deductions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          loan_id: string
          month: number | null
          payroll_entry_id: string | null
          year: number | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          loan_id: string
          month?: number | null
          payroll_entry_id?: string | null
          year?: number | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          loan_id?: string
          month?: number | null
          payroll_entry_id?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "loan_deductions_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "employee_loans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_deductions_payroll_entry_id_fkey"
            columns: ["payroll_entry_id"]
            isOneToOne: false
            referencedRelation: "payroll_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_administration: {
        Row: {
          actual_time: string | null
          administered_by: string | null
          admission_id: string
          created_at: string | null
          dose_given: string | null
          id: string
          ipd_medication_id: string
          notes: string | null
          reason_not_given: string | null
          route: Database["public"]["Enums"]["medication_route"] | null
          scheduled_time: string
          site: string | null
          status: Database["public"]["Enums"]["medication_admin_status"] | null
          witnessed_by: string | null
        }
        Insert: {
          actual_time?: string | null
          administered_by?: string | null
          admission_id: string
          created_at?: string | null
          dose_given?: string | null
          id?: string
          ipd_medication_id: string
          notes?: string | null
          reason_not_given?: string | null
          route?: Database["public"]["Enums"]["medication_route"] | null
          scheduled_time: string
          site?: string | null
          status?: Database["public"]["Enums"]["medication_admin_status"] | null
          witnessed_by?: string | null
        }
        Update: {
          actual_time?: string | null
          administered_by?: string | null
          admission_id?: string
          created_at?: string | null
          dose_given?: string | null
          id?: string
          ipd_medication_id?: string
          notes?: string | null
          reason_not_given?: string | null
          route?: Database["public"]["Enums"]["medication_route"] | null
          scheduled_time?: string
          site?: string | null
          status?: Database["public"]["Enums"]["medication_admin_status"] | null
          witnessed_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_administration_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administration_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administration_ipd_medication_id_fkey"
            columns: ["ipd_medication_id"]
            isOneToOne: false
            referencedRelation: "ipd_medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_administration_witnessed_by_fkey"
            columns: ["witnessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_inventory: {
        Row: {
          batch_number: string | null
          branch_id: string
          created_at: string
          expiry_date: string | null
          id: string
          medicine_id: string
          quantity: number | null
          reorder_level: number | null
          selling_price: number | null
          supplier_name: string | null
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          medicine_id: string
          quantity?: number | null
          reorder_level?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          created_at?: string
          expiry_date?: string | null
          id?: string
          medicine_id?: string
          quantity?: number | null
          reorder_level?: number | null
          selling_price?: number | null
          supplier_name?: string | null
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_inventory_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
        ]
      }
      medicines: {
        Row: {
          category_id: string | null
          created_at: string
          generic_name: string | null
          id: string
          is_active: boolean | null
          manufacturer: string | null
          name: string
          organization_id: string
          strength: string | null
          unit: Database["public"]["Enums"]["medicine_unit"] | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          name: string
          organization_id: string
          strength?: string | null
          unit?: Database["public"]["Enums"]["medicine_unit"] | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          generic_name?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string | null
          name?: string
          organization_id?: string
          strength?: string | null
          unit?: Database["public"]["Enums"]["medicine_unit"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicines_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "medicine_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          code: string
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          path: string | null
          required_module: string | null
          required_permission: string | null
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          path?: string | null
          required_module?: string | null
          required_permission?: string | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          path?: string | null
          required_module?: string | null
          required_permission?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_logs: {
        Row: {
          channel: string
          created_at: string | null
          error_message: string | null
          id: string
          notification_type: string
          organization_id: string | null
          recipient_email: string | null
          recipient_phone: string | null
          reference_id: string
          sent_at: string | null
          status: string | null
        }
        Insert: {
          channel: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type: string
          organization_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          reference_id: string
          sent_at?: string | null
          status?: string | null
        }
        Update: {
          channel?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          notification_type?: string
          organization_id?: string | null
          recipient_email?: string | null
          recipient_phone?: string | null
          reference_id?: string
          sent_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_templates: {
        Row: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at: string
          event_type: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          subject: string | null
          template: string
          updated_at: string
        }
        Insert: {
          channel: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          subject?: string | null
          template: string
          updated_at?: string
        }
        Update: {
          channel?: Database["public"]["Enums"]["notification_channel"]
          created_at?: string
          event_type?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          subject?: string | null
          template?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nurses: {
        Row: {
          assigned_ward_id: string | null
          branch_id: string | null
          created_at: string | null
          employee_id: string | null
          id: string
          is_available: boolean | null
          is_charge_nurse: boolean | null
          license_expiry: string | null
          license_number: string | null
          organization_id: string
          profile_id: string | null
          qualification: string | null
          specialization: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_ward_id?: string | null
          branch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_available?: boolean | null
          is_charge_nurse?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id: string
          profile_id?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_ward_id?: string | null
          branch_id?: string | null
          created_at?: string | null
          employee_id?: string | null
          id?: string
          is_available?: boolean | null
          is_charge_nurse?: boolean | null
          license_expiry?: string | null
          license_number?: string | null
          organization_id?: string
          profile_id?: string | null
          qualification?: string | null
          specialization?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nurses_assigned_ward_id_fkey"
            columns: ["assigned_ward_id"]
            isOneToOne: false
            referencedRelation: "wards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nurses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nurses_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nurses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_care_plans: {
        Row: {
          admission_id: string
          created_at: string | null
          evaluation: string | null
          goal: string | null
          id: string
          interventions: string | null
          nurse_id: string
          priority: string | null
          problem: string
          start_date: string | null
          status: string | null
          target_date: string | null
          updated_at: string | null
        }
        Insert: {
          admission_id: string
          created_at?: string | null
          evaluation?: string | null
          goal?: string | null
          id?: string
          interventions?: string | null
          nurse_id: string
          priority?: string | null
          problem: string
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_id?: string
          created_at?: string | null
          evaluation?: string | null
          goal?: string | null
          id?: string
          interventions?: string | null
          nurse_id?: string
          priority?: string | null
          problem?: string
          start_date?: string | null
          status?: string | null
          target_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nursing_care_plans_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_care_plans_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nursing_notes: {
        Row: {
          admission_id: string
          assessment: string | null
          created_at: string | null
          evaluation: string | null
          fall_risk_score: number | null
          id: string
          intervention: string | null
          note_date: string
          note_time: string
          note_type: Database["public"]["Enums"]["nursing_note_type"] | null
          notes: string | null
          nurse_id: string
          objective: string | null
          pain_score: number | null
          plan: string | null
          pressure_ulcer_risk: number | null
          subjective: string | null
          vitals: Json | null
        }
        Insert: {
          admission_id: string
          assessment?: string | null
          created_at?: string | null
          evaluation?: string | null
          fall_risk_score?: number | null
          id?: string
          intervention?: string | null
          note_date?: string
          note_time?: string
          note_type?: Database["public"]["Enums"]["nursing_note_type"] | null
          notes?: string | null
          nurse_id: string
          objective?: string | null
          pain_score?: number | null
          plan?: string | null
          pressure_ulcer_risk?: number | null
          subjective?: string | null
          vitals?: Json | null
        }
        Update: {
          admission_id?: string
          assessment?: string | null
          created_at?: string | null
          evaluation?: string | null
          fall_risk_score?: number | null
          id?: string
          intervention?: string | null
          note_date?: string
          note_time?: string
          note_type?: Database["public"]["Enums"]["nursing_note_type"] | null
          notes?: string | null
          nurse_id?: string
          objective?: string | null
          pain_score?: number | null
          plan?: string | null
          pressure_ulcer_risk?: number | null
          subjective?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "nursing_notes_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nursing_notes_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_modules: {
        Row: {
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean | null
          module_code: string
          organization_id: string
        }
        Insert: {
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          module_code: string
          organization_id: string
        }
        Update: {
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          module_code?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_modules_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          created_at: string
          id: string
          organization_id: string
          setting_key: string
          setting_type: Database["public"]["Enums"]["setting_type"] | null
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          organization_id: string
          setting_key: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          organization_id?: string
          setting_key?: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: string | null
          city: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          slug: string
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tax_number: string | null
          trial_ends_at: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          slug: string
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tax_number?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          slug?: string
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          tax_number?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      patient_attendants: {
        Row: {
          address: string | null
          admission_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          name: string
          national_id: string | null
          pass_issued_at: string | null
          pass_number: string | null
          pass_valid_until: string | null
          phone: string | null
          relationship: string | null
        }
        Insert: {
          address?: string | null
          admission_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name: string
          national_id?: string | null
          pass_issued_at?: string | null
          pass_number?: string | null
          pass_valid_until?: string | null
          phone?: string | null
          relationship?: string | null
        }
        Update: {
          address?: string | null
          admission_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          name?: string
          national_id?: string | null
          pass_issued_at?: string | null
          pass_number?: string | null
          pass_valid_until?: string | null
          phone?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_attendants_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_medical_history: {
        Row: {
          condition_type: Database["public"]["Enums"]["medical_history_type"]
          created_at: string
          created_by: string | null
          description: string
          diagnosed_date: string | null
          id: string
          notes: string | null
          patient_id: string
        }
        Insert: {
          condition_type: Database["public"]["Enums"]["medical_history_type"]
          created_at?: string
          created_by?: string | null
          description: string
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          patient_id: string
        }
        Update: {
          condition_type?: Database["public"]["Enums"]["medical_history_type"]
          created_at?: string
          created_by?: string | null
          description?: string
          diagnosed_date?: string | null
          id?: string
          notes?: string | null
          patient_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_medical_history_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_medical_history_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          address: string | null
          blood_group: string | null
          branch_id: string | null
          city: string | null
          created_at: string
          created_by: string | null
          date_of_birth: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relation: string | null
          father_husband_name: string | null
          first_name: string
          gender: Database["public"]["Enums"]["gender"] | null
          id: string
          insurance_id: string | null
          insurance_provider: string | null
          is_active: boolean | null
          last_name: string | null
          marital_status: Database["public"]["Enums"]["marital_status"] | null
          national_id: string | null
          nationality: string | null
          notes: string | null
          number_of_children: number | null
          occupation: string | null
          organization_id: string
          passport_number: string | null
          patient_number: string
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          profile_photo_url: string | null
          qr_code: string | null
          referral_details: string | null
          referred_by: string | null
          religion: string | null
          secondary_phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          blood_group?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          father_husband_name?: string | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          number_of_children?: number | null
          occupation?: string | null
          organization_id: string
          passport_number?: string | null
          patient_number: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          profile_photo_url?: string | null
          qr_code?: string | null
          referral_details?: string | null
          referred_by?: string | null
          religion?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          blood_group?: string | null
          branch_id?: string | null
          city?: string | null
          created_at?: string
          created_by?: string | null
          date_of_birth?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relation?: string | null
          father_husband_name?: string | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender"] | null
          id?: string
          insurance_id?: string | null
          insurance_provider?: string | null
          is_active?: boolean | null
          last_name?: string | null
          marital_status?: Database["public"]["Enums"]["marital_status"] | null
          national_id?: string | null
          nationality?: string | null
          notes?: string | null
          number_of_children?: number | null
          occupation?: string | null
          organization_id?: string
          passport_number?: string | null
          patient_number?: string
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          profile_photo_url?: string | null
          qr_code?: string | null
          referral_details?: string | null
          referred_by?: string | null
          religion?: string | null
          secondary_phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          config: Json | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          requires_reference: boolean | null
          sort_order: number | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          requires_reference?: boolean | null
          sort_order?: number | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          requires_reference?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          invoice_id: string
          notes: string | null
          payment_date: string | null
          payment_method_id: string | null
          received_by: string | null
          reference_number: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          invoice_id: string
          notes?: string | null
          payment_date?: string | null
          payment_method_id?: string | null
          received_by?: string | null
          reference_number?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          invoice_id?: string
          notes?: string | null
          payment_date?: string | null
          payment_method_id?: string | null
          received_by?: string | null
          reference_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_entries: {
        Row: {
          absent_days: number | null
          account_number: string | null
          advance_deduction: number | null
          bank_name: string | null
          basic_salary: number | null
          created_at: string | null
          deductions: Json | null
          earnings: Json | null
          employee_id: string
          gross_salary: number | null
          half_days: number | null
          id: string
          is_paid: boolean | null
          late_days: number | null
          leave_days: number | null
          loan_deduction: number | null
          net_salary: number | null
          overtime_hours: number | null
          payment_date: string | null
          payment_reference: string | null
          payroll_run_id: string
          present_days: number | null
          tax_amount: number | null
          total_deductions: number | null
          total_working_days: number | null
        }
        Insert: {
          absent_days?: number | null
          account_number?: string | null
          advance_deduction?: number | null
          bank_name?: string | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: Json | null
          earnings?: Json | null
          employee_id: string
          gross_salary?: number | null
          half_days?: number | null
          id?: string
          is_paid?: boolean | null
          late_days?: number | null
          leave_days?: number | null
          loan_deduction?: number | null
          net_salary?: number | null
          overtime_hours?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payroll_run_id: string
          present_days?: number | null
          tax_amount?: number | null
          total_deductions?: number | null
          total_working_days?: number | null
        }
        Update: {
          absent_days?: number | null
          account_number?: string | null
          advance_deduction?: number | null
          bank_name?: string | null
          basic_salary?: number | null
          created_at?: string | null
          deductions?: Json | null
          earnings?: Json | null
          employee_id?: string
          gross_salary?: number | null
          half_days?: number | null
          id?: string
          is_paid?: boolean | null
          late_days?: number | null
          leave_days?: number | null
          loan_deduction?: number | null
          net_salary?: number | null
          overtime_hours?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          payroll_run_id?: string
          present_days?: number | null
          tax_amount?: number | null
          total_deductions?: number | null
          total_working_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payroll_entries_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_entries_payroll_run_id_fkey"
            columns: ["payroll_run_id"]
            isOneToOne: false
            referencedRelation: "payroll_runs"
            referencedColumns: ["id"]
          },
        ]
      }
      payroll_runs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          created_at: string | null
          id: string
          month: number
          notes: string | null
          organization_id: string
          pay_date: string | null
          processed_by: string | null
          run_date: string
          status: Database["public"]["Enums"]["payroll_run_status"] | null
          total_deductions: number | null
          total_employees: number | null
          total_gross: number | null
          total_net: number | null
          year: number
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          month: number
          notes?: string | null
          organization_id: string
          pay_date?: string | null
          processed_by?: string | null
          run_date: string
          status?: Database["public"]["Enums"]["payroll_run_status"] | null
          total_deductions?: number | null
          total_employees?: number | null
          total_gross?: number | null
          total_net?: number | null
          year: number
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          month?: number
          notes?: string | null
          organization_id?: string
          pay_date?: string | null
          processed_by?: string | null
          run_date?: string
          status?: Database["public"]["Enums"]["payroll_run_status"] | null
          total_deductions?: number | null
          total_employees?: number | null
          total_gross?: number | null
          total_net?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "payroll_runs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payroll_runs_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      permissions: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          module: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          module: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          module?: string
          name?: string
        }
        Relationships: []
      }
      prescription_items: {
        Row: {
          created_at: string
          dosage: string | null
          duration: string | null
          frequency: string | null
          id: string
          instructions: string | null
          is_dispensed: boolean | null
          medicine_id: string | null
          medicine_name: string
          prescription_id: string
          quantity: number | null
        }
        Insert: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medicine_id?: string | null
          medicine_name: string
          prescription_id: string
          quantity?: number | null
        }
        Update: {
          created_at?: string
          dosage?: string | null
          duration?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          is_dispensed?: boolean | null
          medicine_id?: string | null
          medicine_name?: string
          prescription_id?: string
          quantity?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "prescription_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescription_items_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          branch_id: string
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          notes: string | null
          patient_id: string
          prescription_number: string
          status: Database["public"]["Enums"]["prescription_status"] | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          consultation_id: string
          created_at?: string
          doctor_id: string
          id?: string
          notes?: string | null
          patient_id: string
          prescription_number: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          notes?: string | null
          patient_id?: string
          prescription_number?: string
          status?: Database["public"]["Enums"]["prescription_status"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          branch_id: string | null
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean | null
          organization_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          full_name: string
          id: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          branch_id?: string | null
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          is_granted: boolean | null
          organization_id: string | null
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          is_granted?: boolean | null
          organization_id?: string | null
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          is_granted?: boolean | null
          organization_id?: string | null
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_components: {
        Row: {
          affects_overtime: boolean | null
          calculation_type: string | null
          code: string
          component_type: Database["public"]["Enums"]["salary_component_type"]
          created_at: string | null
          id: string
          is_active: boolean | null
          is_statutory: boolean | null
          is_taxable: boolean | null
          name: string
          organization_id: string
          percentage_of: string | null
          percentage_value: number | null
          sort_order: number | null
        }
        Insert: {
          affects_overtime?: boolean | null
          calculation_type?: string | null
          code: string
          component_type: Database["public"]["Enums"]["salary_component_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_statutory?: boolean | null
          is_taxable?: boolean | null
          name: string
          organization_id: string
          percentage_of?: string | null
          percentage_value?: number | null
          sort_order?: number | null
        }
        Update: {
          affects_overtime?: boolean | null
          calculation_type?: string | null
          code?: string
          component_type?: Database["public"]["Enums"]["salary_component_type"]
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_statutory?: boolean | null
          is_taxable?: boolean | null
          name?: string
          organization_id?: string
          percentage_of?: string | null
          percentage_value?: number | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "salary_components_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      salary_structures: {
        Row: {
          base_salary_max: number | null
          base_salary_min: number | null
          components: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          base_salary_max?: number | null
          base_salary_min?: number | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          base_salary_max?: number | null
          base_salary_min?: number | null
          components?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "salary_structures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          created_at: string
          default_price: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string
          default_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          created_at?: string
          default_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_assignments: {
        Row: {
          created_at: string | null
          effective_from: string
          effective_to: string | null
          employee_id: string
          id: string
          is_current: boolean | null
          shift_id: string
        }
        Insert: {
          created_at?: string | null
          effective_from: string
          effective_to?: string | null
          employee_id: string
          id?: string
          is_current?: boolean | null
          shift_id: string
        }
        Update: {
          created_at?: string | null
          effective_from?: string
          effective_to?: string | null
          employee_id?: string
          id?: string
          is_current?: boolean | null
          shift_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_assignments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_assignments_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          break_duration_minutes: number | null
          code: string
          created_at: string | null
          end_time: string
          grace_period_minutes: number | null
          half_day_hours: number | null
          id: string
          is_active: boolean | null
          is_night_shift: boolean | null
          name: string
          organization_id: string
          shift_type: Database["public"]["Enums"]["shift_type"] | null
          start_time: string
        }
        Insert: {
          break_duration_minutes?: number | null
          code: string
          created_at?: string | null
          end_time: string
          grace_period_minutes?: number | null
          half_day_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_night_shift?: boolean | null
          name: string
          organization_id: string
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          start_time: string
        }
        Update: {
          break_duration_minutes?: number | null
          code?: string
          created_at?: string | null
          end_time?: string
          grace_period_minutes?: number | null
          half_day_hours?: number | null
          id?: string
          is_active?: boolean | null
          is_night_shift?: boolean | null
          name?: string
          organization_id?: string
          shift_type?: Database["public"]["Enums"]["shift_type"] | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_editable: boolean | null
          setting_key: string
          setting_type: Database["public"]["Enums"]["setting_type"] | null
          setting_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_editable?: boolean | null
          setting_key: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_editable?: boolean | null
          setting_key?: string
          setting_type?: Database["public"]["Enums"]["setting_type"] | null
          setting_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tax_slabs: {
        Row: {
          created_at: string | null
          fiscal_year: string
          fixed_tax: number | null
          id: string
          is_active: boolean | null
          max_income: number | null
          min_income: number
          organization_id: string | null
          tax_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          fiscal_year: string
          fixed_tax?: number | null
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          min_income: number
          organization_id?: string | null
          tax_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          fiscal_year?: string
          fixed_tax?: number | null
          id?: string
          is_active?: boolean | null
          max_income?: number | null
          min_income?: number
          organization_id?: string | null
          tax_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_slabs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      trauma_assessments: {
        Row: {
          assessed_by: string | null
          assessment_time: string
          created_at: string
          er_id: string
          gcs_eye: number | null
          gcs_motor: number | null
          gcs_total: number | null
          gcs_verbal: number | null
          id: string
          injuries: Json | null
          iss_score: number | null
          mechanism: string | null
          notes: string | null
          rts_score: number | null
        }
        Insert: {
          assessed_by?: string | null
          assessment_time?: string
          created_at?: string
          er_id: string
          gcs_eye?: number | null
          gcs_motor?: number | null
          gcs_total?: number | null
          gcs_verbal?: number | null
          id?: string
          injuries?: Json | null
          iss_score?: number | null
          mechanism?: string | null
          notes?: string | null
          rts_score?: number | null
        }
        Update: {
          assessed_by?: string | null
          assessment_time?: string
          created_at?: string
          er_id?: string
          gcs_eye?: number | null
          gcs_motor?: number | null
          gcs_total?: number | null
          gcs_verbal?: number | null
          id?: string
          injuries?: Json | null
          iss_score?: number | null
          mechanism?: string | null
          notes?: string | null
          rts_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trauma_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trauma_assessments_er_id_fkey"
            columns: ["er_id"]
            isOneToOne: false
            referencedRelation: "emergency_registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wards: {
        Row: {
          branch_id: string
          building: string | null
          charge_per_day: number | null
          code: string
          contact_extension: string | null
          created_at: string | null
          department_id: string | null
          facilities: Json | null
          floor: string | null
          id: string
          is_active: boolean | null
          name: string
          nurse_in_charge_id: string | null
          organization_id: string
          total_beds: number | null
          updated_at: string | null
          ward_type: Database["public"]["Enums"]["ward_type"] | null
        }
        Insert: {
          branch_id: string
          building?: string | null
          charge_per_day?: number | null
          code: string
          contact_extension?: string | null
          created_at?: string | null
          department_id?: string | null
          facilities?: Json | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          nurse_in_charge_id?: string | null
          organization_id: string
          total_beds?: number | null
          updated_at?: string | null
          ward_type?: Database["public"]["Enums"]["ward_type"] | null
        }
        Update: {
          branch_id?: string
          building?: string | null
          charge_per_day?: number | null
          code?: string
          contact_extension?: string | null
          created_at?: string | null
          department_id?: string | null
          facilities?: Json | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          nurse_in_charge_id?: string | null
          organization_id?: string
          total_beds?: number | null
          updated_at?: string | null
          ward_type?: Database["public"]["Enums"]["ward_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "wards_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_nurse_in_charge_id_fkey"
            columns: ["nurse_in_charge_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_offs: {
        Row: {
          created_at: string | null
          day_of_week: number
          effective_from: string
          employee_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          effective_from: string
          employee_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          effective_from?: string
          employee_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_offs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_branch_id: { Args: never; Returns: string }
      get_user_organization_id: { Args: never; Returns: string }
      has_permission: { Args: { _permission_code: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      admission_status:
        | "admitted"
        | "discharged"
        | "transferred"
        | "expired"
        | "lama"
        | "absconded"
      admission_type:
        | "emergency"
        | "elective"
        | "transfer"
        | "referral"
        | "direct"
      ambulance_status: "incoming" | "arrived" | "cancelled"
      app_role:
        | "super_admin"
        | "org_admin"
        | "branch_admin"
        | "doctor"
        | "nurse"
        | "receptionist"
        | "pharmacist"
        | "lab_technician"
        | "accountant"
        | "hr_manager"
        | "hr_officer"
        | "store_manager"
        | "finance_manager"
      appointment_status:
        | "scheduled"
        | "checked_in"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "no_show"
      appointment_type: "walk_in" | "scheduled" | "follow_up" | "emergency"
      arrival_mode:
        | "walk_in"
        | "ambulance"
        | "police"
        | "brought_by_family"
        | "referred"
      attendance_status:
        | "present"
        | "absent"
        | "half_day"
        | "late"
        | "on_leave"
        | "holiday"
        | "weekend"
        | "work_from_home"
      bed_status:
        | "available"
        | "occupied"
        | "reserved"
        | "maintenance"
        | "blocked"
        | "housekeeping"
      diet_type:
        | "normal"
        | "soft"
        | "liquid"
        | "clear_liquid"
        | "npo"
        | "diabetic"
        | "low_salt"
        | "low_fat"
        | "high_protein"
        | "renal"
        | "cardiac"
        | "tube_feeding"
        | "parenteral"
      discharge_type:
        | "normal"
        | "against_advice"
        | "transfer"
        | "expired"
        | "absconded"
        | "referred"
      document_category:
        | "identity"
        | "education"
        | "employment"
        | "medical"
        | "legal"
        | "other"
      employee_type:
        | "permanent"
        | "contractual"
        | "part_time"
        | "intern"
        | "consultant"
      employment_status:
        | "active"
        | "resigned"
        | "terminated"
        | "retired"
        | "on_leave"
        | "absconding"
      er_status:
        | "waiting"
        | "in_triage"
        | "in_treatment"
        | "admitted"
        | "discharged"
        | "transferred"
        | "expired"
        | "absconded"
        | "lama"
      er_treatment_type:
        | "medication"
        | "procedure"
        | "investigation"
        | "intervention"
        | "note"
      field_type:
        | "text"
        | "number"
        | "date"
        | "select"
        | "checkbox"
        | "textarea"
        | "email"
        | "phone"
      gender: "male" | "female" | "other"
      invoice_status:
        | "draft"
        | "pending"
        | "partially_paid"
        | "paid"
        | "cancelled"
        | "refunded"
      lab_item_status: "pending" | "collected" | "processing" | "completed"
      lab_order_priority: "routine" | "urgent" | "stat"
      lab_order_status:
        | "ordered"
        | "collected"
        | "processing"
        | "completed"
        | "cancelled"
      leave_request_status: "pending" | "approved" | "rejected" | "cancelled"
      loan_status: "active" | "completed" | "cancelled" | "defaulted"
      marital_status: "single" | "married" | "divorced" | "widowed" | "other"
      medical_history_type:
        | "allergy"
        | "chronic_disease"
        | "surgery"
        | "medication"
        | "family_history"
      medication_admin_status:
        | "pending"
        | "given"
        | "missed"
        | "refused"
        | "held"
        | "discontinued"
      medication_route:
        | "oral"
        | "iv"
        | "im"
        | "sc"
        | "topical"
        | "inhalation"
        | "sublingual"
        | "rectal"
        | "transdermal"
        | "ophthalmic"
        | "otic"
        | "nasal"
      medicine_unit:
        | "tablet"
        | "capsule"
        | "syrup"
        | "injection"
        | "cream"
        | "drops"
        | "inhaler"
        | "powder"
        | "gel"
        | "ointment"
      notification_channel: "sms" | "email" | "whatsapp"
      nursing_note_type:
        | "admission"
        | "assessment"
        | "progress"
        | "intervention"
        | "handover"
        | "discharge"
        | "incident"
        | "procedure"
      payroll_run_status: "draft" | "processing" | "completed" | "cancelled"
      prescription_status:
        | "created"
        | "dispensed"
        | "partially_dispensed"
        | "cancelled"
      salary_component_type: "earning" | "deduction"
      service_category:
        | "consultation"
        | "procedure"
        | "lab"
        | "pharmacy"
        | "room"
        | "other"
      setting_type: "string" | "number" | "boolean" | "json"
      shift_type:
        | "morning"
        | "evening"
        | "night"
        | "rotational"
        | "flexible"
        | "general"
      subscription_plan: "basic" | "professional" | "enterprise"
      subscription_status: "trial" | "active" | "suspended" | "cancelled"
      triage_level: "1" | "2" | "3" | "4" | "5"
      ward_type:
        | "general"
        | "semi_private"
        | "private"
        | "deluxe"
        | "vip"
        | "icu"
        | "nicu"
        | "picu"
        | "ccu"
        | "isolation"
        | "emergency"
        | "maternity"
        | "pediatric"
        | "surgical"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admission_status: [
        "admitted",
        "discharged",
        "transferred",
        "expired",
        "lama",
        "absconded",
      ],
      admission_type: [
        "emergency",
        "elective",
        "transfer",
        "referral",
        "direct",
      ],
      ambulance_status: ["incoming", "arrived", "cancelled"],
      app_role: [
        "super_admin",
        "org_admin",
        "branch_admin",
        "doctor",
        "nurse",
        "receptionist",
        "pharmacist",
        "lab_technician",
        "accountant",
        "hr_manager",
        "hr_officer",
        "store_manager",
        "finance_manager",
      ],
      appointment_status: [
        "scheduled",
        "checked_in",
        "in_progress",
        "completed",
        "cancelled",
        "no_show",
      ],
      appointment_type: ["walk_in", "scheduled", "follow_up", "emergency"],
      arrival_mode: [
        "walk_in",
        "ambulance",
        "police",
        "brought_by_family",
        "referred",
      ],
      attendance_status: [
        "present",
        "absent",
        "half_day",
        "late",
        "on_leave",
        "holiday",
        "weekend",
        "work_from_home",
      ],
      bed_status: [
        "available",
        "occupied",
        "reserved",
        "maintenance",
        "blocked",
        "housekeeping",
      ],
      diet_type: [
        "normal",
        "soft",
        "liquid",
        "clear_liquid",
        "npo",
        "diabetic",
        "low_salt",
        "low_fat",
        "high_protein",
        "renal",
        "cardiac",
        "tube_feeding",
        "parenteral",
      ],
      discharge_type: [
        "normal",
        "against_advice",
        "transfer",
        "expired",
        "absconded",
        "referred",
      ],
      document_category: [
        "identity",
        "education",
        "employment",
        "medical",
        "legal",
        "other",
      ],
      employee_type: [
        "permanent",
        "contractual",
        "part_time",
        "intern",
        "consultant",
      ],
      employment_status: [
        "active",
        "resigned",
        "terminated",
        "retired",
        "on_leave",
        "absconding",
      ],
      er_status: [
        "waiting",
        "in_triage",
        "in_treatment",
        "admitted",
        "discharged",
        "transferred",
        "expired",
        "absconded",
        "lama",
      ],
      er_treatment_type: [
        "medication",
        "procedure",
        "investigation",
        "intervention",
        "note",
      ],
      field_type: [
        "text",
        "number",
        "date",
        "select",
        "checkbox",
        "textarea",
        "email",
        "phone",
      ],
      gender: ["male", "female", "other"],
      invoice_status: [
        "draft",
        "pending",
        "partially_paid",
        "paid",
        "cancelled",
        "refunded",
      ],
      lab_item_status: ["pending", "collected", "processing", "completed"],
      lab_order_priority: ["routine", "urgent", "stat"],
      lab_order_status: [
        "ordered",
        "collected",
        "processing",
        "completed",
        "cancelled",
      ],
      leave_request_status: ["pending", "approved", "rejected", "cancelled"],
      loan_status: ["active", "completed", "cancelled", "defaulted"],
      marital_status: ["single", "married", "divorced", "widowed", "other"],
      medical_history_type: [
        "allergy",
        "chronic_disease",
        "surgery",
        "medication",
        "family_history",
      ],
      medication_admin_status: [
        "pending",
        "given",
        "missed",
        "refused",
        "held",
        "discontinued",
      ],
      medication_route: [
        "oral",
        "iv",
        "im",
        "sc",
        "topical",
        "inhalation",
        "sublingual",
        "rectal",
        "transdermal",
        "ophthalmic",
        "otic",
        "nasal",
      ],
      medicine_unit: [
        "tablet",
        "capsule",
        "syrup",
        "injection",
        "cream",
        "drops",
        "inhaler",
        "powder",
        "gel",
        "ointment",
      ],
      notification_channel: ["sms", "email", "whatsapp"],
      nursing_note_type: [
        "admission",
        "assessment",
        "progress",
        "intervention",
        "handover",
        "discharge",
        "incident",
        "procedure",
      ],
      payroll_run_status: ["draft", "processing", "completed", "cancelled"],
      prescription_status: [
        "created",
        "dispensed",
        "partially_dispensed",
        "cancelled",
      ],
      salary_component_type: ["earning", "deduction"],
      service_category: [
        "consultation",
        "procedure",
        "lab",
        "pharmacy",
        "room",
        "other",
      ],
      setting_type: ["string", "number", "boolean", "json"],
      shift_type: [
        "morning",
        "evening",
        "night",
        "rotational",
        "flexible",
        "general",
      ],
      subscription_plan: ["basic", "professional", "enterprise"],
      subscription_status: ["trial", "active", "suspended", "cancelled"],
      triage_level: ["1", "2", "3", "4", "5"],
      ward_type: [
        "general",
        "semi_private",
        "private",
        "deluxe",
        "vip",
        "icu",
        "nicu",
        "picu",
        "ccu",
        "isolation",
        "emergency",
        "maternity",
        "pediatric",
        "surgical",
      ],
    },
  },
} as const
