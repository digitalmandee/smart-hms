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
      account_types: {
        Row: {
          category: string
          code: string
          created_at: string
          id: string
          is_debit_normal: boolean
          is_system: boolean
          name: string
          organization_id: string
          parent_type_id: string | null
          sort_order: number
        }
        Insert: {
          category: string
          code: string
          created_at?: string
          id?: string
          is_debit_normal?: boolean
          is_system?: boolean
          name: string
          organization_id: string
          parent_type_id?: string | null
          sort_order?: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string
          id?: string
          is_debit_normal?: boolean
          is_system?: boolean
          name?: string
          organization_id?: string
          parent_type_id?: string | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "account_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "account_types_parent_type_id_fkey"
            columns: ["parent_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
        ]
      }
      accounts: {
        Row: {
          account_level: number
          account_number: string
          account_type_id: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          current_balance: number
          description: string | null
          id: string
          is_active: boolean
          is_header: boolean
          is_system: boolean
          name: string
          opening_balance: number
          opening_balance_date: string | null
          organization_id: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_level?: number
          account_number: string
          account_type_id: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_header?: boolean
          is_system?: boolean
          name: string
          opening_balance?: number
          opening_balance_date?: string | null
          organization_id: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_level?: number
          account_number?: string
          account_type_id?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_header?: boolean
          is_system?: boolean
          name?: string
          opening_balance?: number
          opening_balance_date?: string | null
          organization_id?: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_account_type_id_fkey"
            columns: ["account_type_id"]
            isOneToOne: false
            referencedRelation: "account_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_parent_account_id_fkey"
            columns: ["parent_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      admissions: {
        Row: {
          actual_discharge_date: string | null
          admission_date: string
          admission_invoice_id: string | null
          admission_number: string
          admission_time: string
          admission_type: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id: string | null
          attending_doctor_id: string | null
          authorization_number: string | null
          bed_charges_start_at: string | null
          bed_id: string | null
          branch_id: string
          chief_complaint: string | null
          clinical_notes: string | null
          condition_at_discharge: string | null
          confirmed_at: string | null
          confirmed_by: string | null
          consultation_id: string | null
          corporate_id: string | null
          created_at: string | null
          created_by: string | null
          credit_limit: number | null
          deposit_amount: number | null
          diagnosis_on_admission: string | null
          discharge_diagnosis: string | null
          discharge_instructions: string | null
          discharge_invoice_id: string | null
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
          insurance_policy_number: string | null
          insurance_provider_id: string | null
          organization_id: string
          patient_id: string
          payment_mode: string | null
          payment_status: string | null
          referring_doctor_id: string | null
          status: Database["public"]["Enums"]["admission_status"] | null
          updated_at: string | null
          ward_id: string | null
        }
        Insert: {
          actual_discharge_date?: string | null
          admission_date: string
          admission_invoice_id?: string | null
          admission_number: string
          admission_time: string
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          authorization_number?: string | null
          bed_charges_start_at?: string | null
          bed_id?: string | null
          branch_id: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          condition_at_discharge?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          consultation_id?: string | null
          corporate_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          deposit_amount?: number | null
          diagnosis_on_admission?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_invoice_id?: string | null
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
          insurance_policy_number?: string | null
          insurance_provider_id?: string | null
          organization_id: string
          patient_id: string
          payment_mode?: string | null
          payment_status?: string | null
          referring_doctor_id?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Update: {
          actual_discharge_date?: string | null
          admission_date?: string
          admission_invoice_id?: string | null
          admission_number?: string
          admission_time?: string
          admission_type?: Database["public"]["Enums"]["admission_type"] | null
          admitting_doctor_id?: string | null
          attending_doctor_id?: string | null
          authorization_number?: string | null
          bed_charges_start_at?: string | null
          bed_id?: string | null
          branch_id?: string
          chief_complaint?: string | null
          clinical_notes?: string | null
          condition_at_discharge?: string | null
          confirmed_at?: string | null
          confirmed_by?: string | null
          consultation_id?: string | null
          corporate_id?: string | null
          created_at?: string | null
          created_by?: string | null
          credit_limit?: number | null
          deposit_amount?: number | null
          diagnosis_on_admission?: string | null
          discharge_diagnosis?: string | null
          discharge_instructions?: string | null
          discharge_invoice_id?: string | null
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
          insurance_policy_number?: string | null
          insurance_provider_id?: string | null
          organization_id?: string
          patient_id?: string
          payment_mode?: string | null
          payment_status?: string | null
          referring_doctor_id?: string | null
          status?: Database["public"]["Enums"]["admission_status"] | null
          updated_at?: string | null
          ward_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admissions_admission_invoice_id_fkey"
            columns: ["admission_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "admissions_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
            foreignKeyName: "admissions_discharge_invoice_id_fkey"
            columns: ["discharge_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
      ai_conversations: {
        Row: {
          context_type: Database["public"]["Enums"]["ai_context_type"]
          created_at: string
          id: string
          language: string
          messages: Json
          metadata: Json | null
          organization_id: string | null
          patient_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          context_type?: Database["public"]["Enums"]["ai_context_type"]
          created_at?: string
          id?: string
          language?: string
          messages?: Json
          metadata?: Json | null
          organization_id?: string | null
          patient_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          context_type?: Database["public"]["Enums"]["ai_context_type"]
          created_at?: string
          id?: string
          language?: string
          messages?: Json
          metadata?: Json | null
          organization_id?: string | null
          patient_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_conversations_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions_log: {
        Row: {
          accepted: boolean | null
          accepted_by: string | null
          conversation_id: string
          created_at: string
          id: string
          suggestion_data: Json
          suggestion_type: Database["public"]["Enums"]["ai_suggestion_type"]
        }
        Insert: {
          accepted?: boolean | null
          accepted_by?: string | null
          conversation_id: string
          created_at?: string
          id?: string
          suggestion_data?: Json
          suggestion_type: Database["public"]["Enums"]["ai_suggestion_type"]
        }
        Update: {
          accepted?: boolean | null
          accepted_by?: string | null
          conversation_id?: string
          created_at?: string
          id?: string
          suggestion_data?: Json
          suggestion_type?: Database["public"]["Enums"]["ai_suggestion_type"]
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_log_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
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
      anc_records: {
        Row: {
          abortion: number | null
          advice: string | null
          attended_by: string | null
          birth_plan_discussed: boolean | null
          blood_group: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          blood_sugar_fasting: number | null
          blood_sugar_random: number | null
          branch_id: string | null
          calcium_given: boolean | null
          created_at: string | null
          created_by: string | null
          danger_signs_explained: boolean | null
          edd_date: string | null
          edema: string | null
          edema_location: string | null
          engagement: string | null
          fetal_heart_rate: number | null
          fetal_movements: string | null
          fundal_height_cm: number | null
          gestational_age_days: number | null
          gestational_age_weeks: number | null
          gravida: number | null
          hbsag_status: string | null
          hemoglobin: number | null
          hiv_status: string | null
          id: string
          iron_folic_given: boolean | null
          lie: string | null
          living: number | null
          lmp_date: string | null
          next_visit_date: string | null
          notes: string | null
          organization_id: string
          para: number | null
          patient_id: string
          pregnancy_id: string | null
          presentation: string | null
          referral_reason: string | null
          referred_to: string | null
          rh_factor: string | null
          risk_category: string | null
          risk_factors: Json | null
          tt1_date: string | null
          tt1_given: boolean | null
          tt2_date: string | null
          tt2_given: boolean | null
          ultrasound_done: boolean | null
          ultrasound_edd: string | null
          ultrasound_findings: string | null
          updated_at: string | null
          urine_albumin: string | null
          urine_protein: string | null
          urine_sugar: string | null
          vdrl_status: string | null
          visit_date: string
          visit_number: number | null
          visit_type: string | null
          weight_kg: number | null
        }
        Insert: {
          abortion?: number | null
          advice?: string | null
          attended_by?: string | null
          birth_plan_discussed?: boolean | null
          blood_group?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar_fasting?: number | null
          blood_sugar_random?: number | null
          branch_id?: string | null
          calcium_given?: boolean | null
          created_at?: string | null
          created_by?: string | null
          danger_signs_explained?: boolean | null
          edd_date?: string | null
          edema?: string | null
          edema_location?: string | null
          engagement?: string | null
          fetal_heart_rate?: number | null
          fetal_movements?: string | null
          fundal_height_cm?: number | null
          gestational_age_days?: number | null
          gestational_age_weeks?: number | null
          gravida?: number | null
          hbsag_status?: string | null
          hemoglobin?: number | null
          hiv_status?: string | null
          id?: string
          iron_folic_given?: boolean | null
          lie?: string | null
          living?: number | null
          lmp_date?: string | null
          next_visit_date?: string | null
          notes?: string | null
          organization_id: string
          para?: number | null
          patient_id: string
          pregnancy_id?: string | null
          presentation?: string | null
          referral_reason?: string | null
          referred_to?: string | null
          rh_factor?: string | null
          risk_category?: string | null
          risk_factors?: Json | null
          tt1_date?: string | null
          tt1_given?: boolean | null
          tt2_date?: string | null
          tt2_given?: boolean | null
          ultrasound_done?: boolean | null
          ultrasound_edd?: string | null
          ultrasound_findings?: string | null
          updated_at?: string | null
          urine_albumin?: string | null
          urine_protein?: string | null
          urine_sugar?: string | null
          vdrl_status?: string | null
          visit_date: string
          visit_number?: number | null
          visit_type?: string | null
          weight_kg?: number | null
        }
        Update: {
          abortion?: number | null
          advice?: string | null
          attended_by?: string | null
          birth_plan_discussed?: boolean | null
          blood_group?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          blood_sugar_fasting?: number | null
          blood_sugar_random?: number | null
          branch_id?: string | null
          calcium_given?: boolean | null
          created_at?: string | null
          created_by?: string | null
          danger_signs_explained?: boolean | null
          edd_date?: string | null
          edema?: string | null
          edema_location?: string | null
          engagement?: string | null
          fetal_heart_rate?: number | null
          fetal_movements?: string | null
          fundal_height_cm?: number | null
          gestational_age_days?: number | null
          gestational_age_weeks?: number | null
          gravida?: number | null
          hbsag_status?: string | null
          hemoglobin?: number | null
          hiv_status?: string | null
          id?: string
          iron_folic_given?: boolean | null
          lie?: string | null
          living?: number | null
          lmp_date?: string | null
          next_visit_date?: string | null
          notes?: string | null
          organization_id?: string
          para?: number | null
          patient_id?: string
          pregnancy_id?: string | null
          presentation?: string | null
          referral_reason?: string | null
          referred_to?: string | null
          rh_factor?: string | null
          risk_category?: string | null
          risk_factors?: Json | null
          tt1_date?: string | null
          tt1_given?: boolean | null
          tt2_date?: string | null
          tt2_given?: boolean | null
          ultrasound_done?: boolean | null
          ultrasound_edd?: string | null
          ultrasound_findings?: string | null
          updated_at?: string | null
          urine_albumin?: string | null
          urine_protein?: string | null
          urine_sugar?: string | null
          vdrl_status?: string | null
          visit_date?: string
          visit_number?: number | null
          visit_type?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "anc_records_attended_by_fkey"
            columns: ["attended_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anc_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anc_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anc_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anc_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      anesthesia_records: {
        Row: {
          airway_complications: string | null
          airway_device: string | null
          airway_size: string | null
          analgesics: Json | null
          anesthesia_end_time: string | null
          anesthesia_plan: string | null
          anesthesia_start_time: string | null
          anesthesia_type: Database["public"]["Enums"]["anesthesia_type"]
          anesthetist_id: string
          arterial_line: Json | null
          blood_loss_ml: number | null
          blood_products: Json | null
          central_line: Json | null
          complications: string | null
          created_at: string | null
          extubation_time: string | null
          fluid_input: Json | null
          handover_notes: string | null
          id: string
          induction_agents: Json | null
          induction_time: string | null
          intra_op_events: Json | null
          intubation_attempts: number | null
          intubation_grade: string | null
          intubation_time: string | null
          iv_access: Json | null
          maintenance_agents: Json | null
          muscle_relaxants: Json | null
          other_access: Json | null
          other_medications: Json | null
          pre_anesthesia_assessment: Json | null
          recovery_score: number | null
          reversal_agents: Json | null
          surgery_id: string
          total_input_ml: number | null
          updated_at: string | null
          urine_output_ml: number | null
          vitals_log: Json | null
        }
        Insert: {
          airway_complications?: string | null
          airway_device?: string | null
          airway_size?: string | null
          analgesics?: Json | null
          anesthesia_end_time?: string | null
          anesthesia_plan?: string | null
          anesthesia_start_time?: string | null
          anesthesia_type: Database["public"]["Enums"]["anesthesia_type"]
          anesthetist_id: string
          arterial_line?: Json | null
          blood_loss_ml?: number | null
          blood_products?: Json | null
          central_line?: Json | null
          complications?: string | null
          created_at?: string | null
          extubation_time?: string | null
          fluid_input?: Json | null
          handover_notes?: string | null
          id?: string
          induction_agents?: Json | null
          induction_time?: string | null
          intra_op_events?: Json | null
          intubation_attempts?: number | null
          intubation_grade?: string | null
          intubation_time?: string | null
          iv_access?: Json | null
          maintenance_agents?: Json | null
          muscle_relaxants?: Json | null
          other_access?: Json | null
          other_medications?: Json | null
          pre_anesthesia_assessment?: Json | null
          recovery_score?: number | null
          reversal_agents?: Json | null
          surgery_id: string
          total_input_ml?: number | null
          updated_at?: string | null
          urine_output_ml?: number | null
          vitals_log?: Json | null
        }
        Update: {
          airway_complications?: string | null
          airway_device?: string | null
          airway_size?: string | null
          analgesics?: Json | null
          anesthesia_end_time?: string | null
          anesthesia_plan?: string | null
          anesthesia_start_time?: string | null
          anesthesia_type?: Database["public"]["Enums"]["anesthesia_type"]
          anesthetist_id?: string
          arterial_line?: Json | null
          blood_loss_ml?: number | null
          blood_products?: Json | null
          central_line?: Json | null
          complications?: string | null
          created_at?: string | null
          extubation_time?: string | null
          fluid_input?: Json | null
          handover_notes?: string | null
          id?: string
          induction_agents?: Json | null
          induction_time?: string | null
          intra_op_events?: Json | null
          intubation_attempts?: number | null
          intubation_grade?: string | null
          intubation_time?: string | null
          iv_access?: Json | null
          maintenance_agents?: Json | null
          muscle_relaxants?: Json | null
          other_access?: Json | null
          other_medications?: Json | null
          pre_anesthesia_assessment?: Json | null
          recovery_score?: number | null
          reversal_agents?: Json | null
          surgery_id?: string
          total_input_ml?: number | null
          updated_at?: string | null
          urine_output_ml?: number | null
          vitals_log?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "anesthesia_records_anesthetist_id_fkey"
            columns: ["anesthetist_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "anesthesia_records_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
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
          invoice_id: string | null
          kiosk_id: string | null
          notes: string | null
          opd_department_id: string | null
          organization_id: string
          patient_id: string
          payment_status: string | null
          priority: number | null
          status: Database["public"]["Enums"]["appointment_status"] | null
          token_number: number | null
          updated_at: string
          waived_at: string | null
          waived_by: string | null
          waiver_reason: string | null
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
          invoice_id?: string | null
          kiosk_id?: string | null
          notes?: string | null
          opd_department_id?: string | null
          organization_id: string
          patient_id: string
          payment_status?: string | null
          priority?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: number | null
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
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
          invoice_id?: string | null
          kiosk_id?: string | null
          notes?: string | null
          opd_department_id?: string | null
          organization_id?: string
          patient_id?: string
          payment_status?: string | null
          priority?: number | null
          status?: Database["public"]["Enums"]["appointment_status"] | null
          token_number?: number | null
          updated_at?: string
          waived_at?: string | null
          waived_by?: string | null
          waiver_reason?: string | null
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
            foreignKeyName: "appointments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_opd_department_id_fkey"
            columns: ["opd_department_id"]
            isOneToOne: false
            referencedRelation: "opd_departments"
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
          {
            foreignKeyName: "appointments_waived_by_fkey"
            columns: ["waived_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assets: {
        Row: {
          category: string | null
          created_at: string
          department: string | null
          id: string
          location: string | null
          name: string
          notes: string | null
          organization_id: string
          purchase_cost: number | null
          purchase_date: string | null
          serial_number: string | null
          status: string
          updated_at: string
          vendor_id: string | null
          warranty_expiry: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          department?: string | null
          id?: string
          location?: string | null
          name: string
          notes?: string | null
          organization_id: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
          warranty_expiry?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          department?: string | null
          id?: string
          location?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          purchase_cost?: number | null
          purchase_date?: string | null
          serial_number?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string | null
          warranty_expiry?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assets_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      available_modules: {
        Row: {
          category: string | null
          code: string
          description: string | null
          icon: string | null
          id: string
          is_core: boolean | null
          is_hospital_only: boolean | null
          name: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          code: string
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          is_hospital_only?: boolean | null
          name: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          code?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_core?: boolean | null
          is_hospital_only?: boolean | null
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_holder_name: string | null
          account_id: string | null
          account_number: string
          account_type: string
          bank_name: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          current_balance: number
          id: string
          ifsc_code: string | null
          is_active: boolean
          is_default: boolean
          opening_balance: number
          organization_id: string
          swift_code: string | null
          updated_at: string
        }
        Insert: {
          account_holder_name?: string | null
          account_id?: string | null
          account_number: string
          account_type: string
          bank_name: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          id?: string
          ifsc_code?: string | null
          is_active?: boolean
          is_default?: boolean
          opening_balance?: number
          organization_id: string
          swift_code?: string | null
          updated_at?: string
        }
        Update: {
          account_holder_name?: string | null
          account_id?: string | null
          account_number?: string
          account_type?: string
          bank_name?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          id?: string
          ifsc_code?: string | null
          is_active?: boolean
          is_default?: boolean
          opening_balance?: number
          organization_id?: string
          swift_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_accounts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_transactions: {
        Row: {
          bank_account_id: string
          created_at: string
          created_by: string | null
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          is_reconciled: boolean
          journal_entry_id: string | null
          reconciled_at: string | null
          reconciled_by: string | null
          reference_number: string | null
          running_balance: number | null
          statement_date: string | null
          transaction_date: string
          transaction_type: string | null
          value_date: string | null
        }
        Insert: {
          bank_account_id: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          is_reconciled?: boolean
          journal_entry_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance?: number | null
          statement_date?: string | null
          transaction_date: string
          transaction_type?: string | null
          value_date?: string | null
        }
        Update: {
          bank_account_id?: string
          created_at?: string
          created_by?: string | null
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          is_reconciled?: boolean
          journal_entry_id?: string | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reference_number?: string | null
          running_balance?: number | null
          statement_date?: string | null
          transaction_date?: string
          transaction_type?: string | null
          value_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bank_transactions_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bed_issue_logs: {
        Row: {
          bed_id: string
          created_at: string | null
          description: string | null
          id: string
          issue_type: string
          organization_id: string
          reported_at: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          updated_at: string | null
        }
        Insert: {
          bed_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type: string
          organization_id: string
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Update: {
          bed_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          issue_type?: string
          organization_id?: string
          reported_at?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bed_issue_logs_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_issue_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_issue_logs_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bed_issue_logs_resolved_by_fkey"
            columns: ["resolved_by"]
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
      billing_sessions: {
        Row: {
          actual_cash: number | null
          branch_id: string
          card_total: number | null
          cash_denominations: Json | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          counter_type: string
          created_at: string
          discrepancy_approved_at: string | null
          discrepancy_approved_by: string | null
          discrepancy_reason: string | null
          expected_cash: number | null
          id: string
          notes: string | null
          opd_department_id: string | null
          opened_at: string
          opened_by: string
          opening_cash: number
          organization_id: string
          other_total: number | null
          reconciled_at: string | null
          reconciled_by: string | null
          session_number: string
          shift: string | null
          status: string
          total_collections: number | null
          transaction_count: number | null
          updated_at: string
          upi_total: number | null
        }
        Insert: {
          actual_cash?: number | null
          branch_id: string
          card_total?: number | null
          cash_denominations?: Json | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          counter_type: string
          created_at?: string
          discrepancy_approved_at?: string | null
          discrepancy_approved_by?: string | null
          discrepancy_reason?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opd_department_id?: string | null
          opened_at?: string
          opened_by: string
          opening_cash?: number
          organization_id: string
          other_total?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          session_number: string
          shift?: string | null
          status?: string
          total_collections?: number | null
          transaction_count?: number | null
          updated_at?: string
          upi_total?: number | null
        }
        Update: {
          actual_cash?: number | null
          branch_id?: string
          card_total?: number | null
          cash_denominations?: Json | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          counter_type?: string
          created_at?: string
          discrepancy_approved_at?: string | null
          discrepancy_approved_by?: string | null
          discrepancy_reason?: string | null
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opd_department_id?: string | null
          opened_at?: string
          opened_by?: string
          opening_cash?: number
          organization_id?: string
          other_total?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          session_number?: string
          shift?: string | null
          status?: string
          total_collections?: number | null
          transaction_count?: number | null
          updated_at?: string
          upi_total?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_discrepancy_approved_by_fkey"
            columns: ["discrepancy_approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_opd_department_id_fkey"
            columns: ["opd_department_id"]
            isOneToOne: false
            referencedRelation: "opd_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_sessions_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      biometric_sync_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          device_id: string | null
          error_message: string | null
          id: string
          organization_id: string
          records_failed: number | null
          records_synced: number | null
          started_at: string | null
          status: string | null
          sync_type: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          device_id?: string | null
          error_message?: string | null
          id?: string
          organization_id: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          device_id?: string | null
          error_message?: string | null
          id?: string
          organization_id?: string
          records_failed?: number | null
          records_synced?: number | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "biometric_sync_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "biometric_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "biometric_sync_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      birth_records: {
        Row: {
          admission_id: string | null
          apgar_10min: number | null
          apgar_1min: number | null
          apgar_5min: number | null
          attended_by: Json | null
          baby_patient_id: string | null
          bcg_given: boolean | null
          birth_date: string
          birth_length_cm: number | null
          birth_time: string
          birth_weight_grams: number | null
          branch_id: string | null
          certificate_issued_at: string | null
          certificate_issued_by: string | null
          certificate_number: string | null
          chest_circumference_cm: number | null
          complications: Json | null
          condition_at_birth: string | null
          created_at: string | null
          created_by: string | null
          delivered_by: string | null
          delivery_type: string | null
          father_address: string | null
          father_cnic: string | null
          father_name: string | null
          father_occupation: string | null
          gender: string | null
          head_circumference_cm: number | null
          hep_b_given: boolean | null
          id: string
          mother_patient_id: string
          nicu_admission: boolean | null
          notes: string | null
          opv0_given: boolean | null
          organization_id: string
          place_of_birth: string | null
          resuscitation_required: boolean | null
          updated_at: string | null
          vitamin_k_given: boolean | null
        }
        Insert: {
          admission_id?: string | null
          apgar_10min?: number | null
          apgar_1min?: number | null
          apgar_5min?: number | null
          attended_by?: Json | null
          baby_patient_id?: string | null
          bcg_given?: boolean | null
          birth_date: string
          birth_length_cm?: number | null
          birth_time: string
          birth_weight_grams?: number | null
          branch_id?: string | null
          certificate_issued_at?: string | null
          certificate_issued_by?: string | null
          certificate_number?: string | null
          chest_circumference_cm?: number | null
          complications?: Json | null
          condition_at_birth?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_by?: string | null
          delivery_type?: string | null
          father_address?: string | null
          father_cnic?: string | null
          father_name?: string | null
          father_occupation?: string | null
          gender?: string | null
          head_circumference_cm?: number | null
          hep_b_given?: boolean | null
          id?: string
          mother_patient_id: string
          nicu_admission?: boolean | null
          notes?: string | null
          opv0_given?: boolean | null
          organization_id: string
          place_of_birth?: string | null
          resuscitation_required?: boolean | null
          updated_at?: string | null
          vitamin_k_given?: boolean | null
        }
        Update: {
          admission_id?: string | null
          apgar_10min?: number | null
          apgar_1min?: number | null
          apgar_5min?: number | null
          attended_by?: Json | null
          baby_patient_id?: string | null
          bcg_given?: boolean | null
          birth_date?: string
          birth_length_cm?: number | null
          birth_time?: string
          birth_weight_grams?: number | null
          branch_id?: string | null
          certificate_issued_at?: string | null
          certificate_issued_by?: string | null
          certificate_number?: string | null
          chest_circumference_cm?: number | null
          complications?: Json | null
          condition_at_birth?: string | null
          created_at?: string | null
          created_by?: string | null
          delivered_by?: string | null
          delivery_type?: string | null
          father_address?: string | null
          father_cnic?: string | null
          father_name?: string | null
          father_occupation?: string | null
          gender?: string | null
          head_circumference_cm?: number | null
          hep_b_given?: boolean | null
          id?: string
          mother_patient_id?: string
          nicu_admission?: boolean | null
          notes?: string | null
          opv0_given?: boolean | null
          organization_id?: string
          place_of_birth?: string | null
          resuscitation_required?: boolean | null
          updated_at?: string | null
          vitamin_k_given?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "birth_records_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_baby_patient_id_fkey"
            columns: ["baby_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_certificate_issued_by_fkey"
            columns: ["certificate_issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_delivered_by_fkey"
            columns: ["delivered_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_mother_patient_id_fkey"
            columns: ["mother_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "birth_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donations: {
        Row: {
          bag_number: string | null
          blood_pressure: string | null
          branch_id: string
          collected_by: string | null
          created_at: string | null
          donation_date: string
          donation_number: string
          donation_time: string
          donation_type: string | null
          donor_id: string
          hemoglobin_level: number | null
          id: string
          notes: string | null
          organization_id: string
          processed_at: string | null
          processed_by: string | null
          pulse_rate: number | null
          rejection_reason: string | null
          screening_notes: string | null
          screening_passed: boolean | null
          status: Database["public"]["Enums"]["donation_status"]
          temperature: number | null
          updated_at: string | null
          volume_ml: number | null
        }
        Insert: {
          bag_number?: string | null
          blood_pressure?: string | null
          branch_id: string
          collected_by?: string | null
          created_at?: string | null
          donation_date?: string
          donation_number: string
          donation_time: string
          donation_type?: string | null
          donor_id: string
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          processed_at?: string | null
          processed_by?: string | null
          pulse_rate?: number | null
          rejection_reason?: string | null
          screening_notes?: string | null
          screening_passed?: boolean | null
          status?: Database["public"]["Enums"]["donation_status"]
          temperature?: number | null
          updated_at?: string | null
          volume_ml?: number | null
        }
        Update: {
          bag_number?: string | null
          blood_pressure?: string | null
          branch_id?: string
          collected_by?: string | null
          created_at?: string | null
          donation_date?: string
          donation_number?: string
          donation_time?: string
          donation_type?: string | null
          donor_id?: string
          hemoglobin_level?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          processed_at?: string | null
          processed_by?: string | null
          pulse_rate?: number | null
          rejection_reason?: string | null
          screening_notes?: string | null
          screening_passed?: boolean | null
          status?: Database["public"]["Enums"]["donation_status"]
          temperature?: number | null
          updated_at?: string | null
          volume_ml?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_donations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_collected_by_fkey"
            columns: ["collected_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "blood_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donations_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_donors: {
        Row: {
          address: string | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          blood_pressure: string | null
          branch_id: string
          city: string | null
          created_at: string | null
          created_by: string | null
          date_of_birth: string
          deferral_reason: string | null
          deferral_until: string | null
          donor_number: string
          email: string | null
          first_name: string
          gender: string
          hemoglobin_level: number | null
          id: string
          last_donation_date: string | null
          last_name: string
          notes: string | null
          organization_id: string
          patient_id: string | null
          phone: string
          pulse_rate: number | null
          status: Database["public"]["Enums"]["donor_status"]
          total_donations: number | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          address?: string | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          blood_pressure?: string | null
          branch_id: string
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth: string
          deferral_reason?: string | null
          deferral_until?: string | null
          donor_number: string
          email?: string | null
          first_name: string
          gender: string
          hemoglobin_level?: number | null
          id?: string
          last_donation_date?: string | null
          last_name: string
          notes?: string | null
          organization_id: string
          patient_id?: string | null
          phone: string
          pulse_rate?: number | null
          status?: Database["public"]["Enums"]["donor_status"]
          total_donations?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          address?: string | null
          blood_group?: Database["public"]["Enums"]["blood_group_type"]
          blood_pressure?: string | null
          branch_id?: string
          city?: string | null
          created_at?: string | null
          created_by?: string | null
          date_of_birth?: string
          deferral_reason?: string | null
          deferral_until?: string | null
          donor_number?: string
          email?: string | null
          first_name?: string
          gender?: string
          hemoglobin_level?: number | null
          id?: string
          last_donation_date?: string | null
          last_name?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string | null
          phone?: string
          pulse_rate?: number | null
          status?: Database["public"]["Enums"]["donor_status"]
          total_donations?: number | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_donors_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donors_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_donors_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_inventory: {
        Row: {
          all_tests_negative: boolean | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          branch_id: string
          collection_date: string
          component_type: Database["public"]["Enums"]["blood_component_type"]
          created_at: string | null
          donation_id: string | null
          expiry_date: string
          hbsag_tested: boolean | null
          hcv_tested: boolean | null
          hiv_tested: boolean | null
          id: string
          malaria_tested: boolean | null
          notes: string | null
          organization_id: string
          reserved_for_request_id: string | null
          status: Database["public"]["Enums"]["blood_unit_status"]
          storage_location: string | null
          tested_at: string | null
          tested_by: string | null
          unit_number: string
          updated_at: string | null
          vdrl_tested: boolean | null
          volume_ml: number
        }
        Insert: {
          all_tests_negative?: boolean | null
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          branch_id: string
          collection_date: string
          component_type?: Database["public"]["Enums"]["blood_component_type"]
          created_at?: string | null
          donation_id?: string | null
          expiry_date: string
          hbsag_tested?: boolean | null
          hcv_tested?: boolean | null
          hiv_tested?: boolean | null
          id?: string
          malaria_tested?: boolean | null
          notes?: string | null
          organization_id: string
          reserved_for_request_id?: string | null
          status?: Database["public"]["Enums"]["blood_unit_status"]
          storage_location?: string | null
          tested_at?: string | null
          tested_by?: string | null
          unit_number: string
          updated_at?: string | null
          vdrl_tested?: boolean | null
          volume_ml: number
        }
        Update: {
          all_tests_negative?: boolean | null
          blood_group?: Database["public"]["Enums"]["blood_group_type"]
          branch_id?: string
          collection_date?: string
          component_type?: Database["public"]["Enums"]["blood_component_type"]
          created_at?: string | null
          donation_id?: string | null
          expiry_date?: string
          hbsag_tested?: boolean | null
          hcv_tested?: boolean | null
          hiv_tested?: boolean | null
          id?: string
          malaria_tested?: boolean | null
          notes?: string | null
          organization_id?: string
          reserved_for_request_id?: string | null
          status?: Database["public"]["Enums"]["blood_unit_status"]
          storage_location?: string | null
          tested_at?: string | null
          tested_by?: string | null
          unit_number?: string
          updated_at?: string | null
          vdrl_tested?: boolean | null
          volume_ml?: number
        }
        Relationships: [
          {
            foreignKeyName: "blood_inventory_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_inventory_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "blood_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_inventory_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_requests: {
        Row: {
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          branch_id: string
          clinical_indication: string | null
          component_type: Database["public"]["Enums"]["blood_component_type"]
          created_at: string | null
          diagnosis: string | null
          hemoglobin_level: number | null
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          organization_id: string
          patient_id: string
          priority: Database["public"]["Enums"]["blood_request_priority"]
          processed_at: string | null
          processed_by: string | null
          request_number: string
          requested_by: string
          requesting_department: string | null
          required_by: string | null
          status: Database["public"]["Enums"]["blood_request_status"]
          units_issued: number | null
          units_requested: number
          updated_at: string | null
        }
        Insert: {
          blood_group: Database["public"]["Enums"]["blood_group_type"]
          branch_id: string
          clinical_indication?: string | null
          component_type?: Database["public"]["Enums"]["blood_component_type"]
          created_at?: string | null
          diagnosis?: string | null
          hemoglobin_level?: number | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id: string
          patient_id: string
          priority?: Database["public"]["Enums"]["blood_request_priority"]
          processed_at?: string | null
          processed_by?: string | null
          request_number: string
          requested_by: string
          requesting_department?: string | null
          required_by?: string | null
          status?: Database["public"]["Enums"]["blood_request_status"]
          units_issued?: number | null
          units_requested?: number
          updated_at?: string | null
        }
        Update: {
          blood_group?: Database["public"]["Enums"]["blood_group_type"]
          branch_id?: string
          clinical_indication?: string | null
          component_type?: Database["public"]["Enums"]["blood_component_type"]
          created_at?: string | null
          diagnosis?: string | null
          hemoglobin_level?: number | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id?: string
          patient_id?: string
          priority?: Database["public"]["Enums"]["blood_request_priority"]
          processed_at?: string | null
          processed_by?: string | null
          request_number?: string
          requested_by?: string
          requesting_department?: string | null
          required_by?: string | null
          status?: Database["public"]["Enums"]["blood_request_status"]
          units_issued?: number | null
          units_requested?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blood_transfusions: {
        Row: {
          administered_by: string | null
          branch_id: string
          completed_at: string | null
          created_at: string | null
          cross_match_id: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          post_bp: string | null
          post_pulse: number | null
          post_resp_rate: number | null
          post_temp: number | null
          pre_bp: string | null
          pre_pulse: number | null
          pre_resp_rate: number | null
          pre_temp: number | null
          request_id: string
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["transfusion_status"]
          stop_reason: string | null
          stopped_at: string | null
          transfusion_number: string
          unit_id: string
          updated_at: string | null
          verified_by: string | null
        }
        Insert: {
          administered_by?: string | null
          branch_id: string
          completed_at?: string | null
          created_at?: string | null
          cross_match_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          post_bp?: string | null
          post_pulse?: number | null
          post_resp_rate?: number | null
          post_temp?: number | null
          pre_bp?: string | null
          pre_pulse?: number | null
          pre_resp_rate?: number | null
          pre_temp?: number | null
          request_id: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["transfusion_status"]
          stop_reason?: string | null
          stopped_at?: string | null
          transfusion_number: string
          unit_id: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Update: {
          administered_by?: string | null
          branch_id?: string
          completed_at?: string | null
          created_at?: string | null
          cross_match_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          post_bp?: string | null
          post_pulse?: number | null
          post_resp_rate?: number | null
          post_temp?: number | null
          pre_bp?: string | null
          pre_pulse?: number | null
          pre_resp_rate?: number | null
          pre_temp?: number | null
          request_id?: string
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["transfusion_status"]
          stop_reason?: string | null
          stopped_at?: string | null
          transfusion_number?: string
          unit_id?: string
          updated_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blood_transfusions_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_cross_match_id_fkey"
            columns: ["cross_match_id"]
            isOneToOne: false
            referencedRelation: "cross_match_tests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "blood_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blood_transfusions_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      branch_modules: {
        Row: {
          branch_id: string
          created_at: string | null
          enabled_at: string | null
          enabled_by: string | null
          id: string
          is_enabled: boolean | null
          module_code: string
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          module_code: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          enabled_at?: string | null
          enabled_by?: string | null
          id?: string
          is_enabled?: boolean | null
          module_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_modules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_modules_enabled_by_fkey"
            columns: ["enabled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_modules_module_code_fkey"
            columns: ["module_code"]
            isOneToOne: false
            referencedRelation: "available_modules"
            referencedColumns: ["code"]
          },
        ]
      }
      branch_role_restrictions: {
        Row: {
          branch_id: string
          created_at: string | null
          id: string
          is_allowed: boolean | null
          restricted_by: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          restricted_by?: string | null
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          id?: string
          is_allowed?: boolean | null
          restricted_by?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "branch_role_restrictions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "branch_role_restrictions_restricted_by_fkey"
            columns: ["restricted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          brand_color: string | null
          city: string | null
          code: string
          created_at: string
          custom_styles: Json | null
          email: string | null
          id: string
          is_active: boolean | null
          is_main_branch: boolean | null
          logo_url: string | null
          name: string
          organization_id: string
          phone: string | null
          receipt_footer: string | null
          receipt_header: string | null
          tax_rate: number | null
          timezone: string | null
          updated_at: string
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          address?: string | null
          brand_color?: string | null
          city?: string | null
          code: string
          created_at?: string
          custom_styles?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_branch?: boolean | null
          logo_url?: string | null
          name: string
          organization_id: string
          phone?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          address?: string | null
          brand_color?: string | null
          city?: string | null
          code?: string
          created_at?: string
          custom_styles?: Json | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          is_main_branch?: boolean | null
          logo_url?: string | null
          name?: string
          organization_id?: string
          phone?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
          tax_rate?: number | null
          timezone?: string | null
          updated_at?: string
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
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
      budget_allocations: {
        Row: {
          account_id: string
          allocated_amount: number
          branch_id: string | null
          budget_period_id: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          updated_at: string
        }
        Insert: {
          account_id: string
          allocated_amount?: number
          branch_id?: string | null
          budget_period_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Update: {
          account_id?: string
          allocated_amount?: number
          branch_id?: string | null
          budget_period_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_allocations_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_budget_period_id_fkey"
            columns: ["budget_period_id"]
            isOneToOne: false
            referencedRelation: "budget_periods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_allocations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_periods: {
        Row: {
          created_at: string
          end_date: string
          fiscal_year_id: string
          id: string
          is_closed: boolean
          name: string
          organization_id: string
          start_date: string
        }
        Insert: {
          created_at?: string
          end_date: string
          fiscal_year_id: string
          id?: string
          is_closed?: boolean
          name: string
          organization_id: string
          start_date: string
        }
        Update: {
          created_at?: string
          end_date?: string
          fiscal_year_id?: string
          id?: string
          is_closed?: boolean
          name?: string
          organization_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_periods_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_periods_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_attachments: {
        Row: {
          attachment_type: string
          claim_id: string
          created_at: string
          file_name: string
          file_type: string
          file_url: string
          id: string
        }
        Insert: {
          attachment_type?: string
          claim_id: string
          created_at?: string
          file_name: string
          file_type: string
          file_url: string
          id?: string
        }
        Update: {
          attachment_type?: string
          claim_id?: string
          created_at?: string
          file_name?: string
          file_type?: string
          file_url?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "claim_attachments_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
        ]
      }
      claim_items: {
        Row: {
          approved_amount: number | null
          claim_id: string
          created_at: string | null
          id: string
          invoice_item_id: string | null
          notes: string | null
          quantity: number | null
          rejection_reason: string | null
          service_code: string | null
          service_date: string | null
          service_name: string
          status: string | null
          total_amount: number
          unit_price: number
        }
        Insert: {
          approved_amount?: number | null
          claim_id: string
          created_at?: string | null
          id?: string
          invoice_item_id?: string | null
          notes?: string | null
          quantity?: number | null
          rejection_reason?: string | null
          service_code?: string | null
          service_date?: string | null
          service_name: string
          status?: string | null
          total_amount: number
          unit_price: number
        }
        Update: {
          approved_amount?: number | null
          claim_id?: string
          created_at?: string | null
          id?: string
          invoice_item_id?: string | null
          notes?: string | null
          quantity?: number | null
          rejection_reason?: string | null
          service_code?: string | null
          service_date?: string | null
          service_name?: string
          status?: string | null
          total_amount?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "claim_items_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "claim_items_invoice_item_id_fkey"
            columns: ["invoice_item_id"]
            isOneToOne: false
            referencedRelation: "invoice_items"
            referencedColumns: ["id"]
          },
        ]
      }
      clearance_template_items: {
        Row: {
          department: string
          id: string
          is_mandatory: boolean | null
          item_description: string
          sort_order: number | null
          template_id: string
        }
        Insert: {
          department: string
          id?: string
          is_mandatory?: boolean | null
          item_description: string
          sort_order?: number | null
          template_id: string
        }
        Update: {
          department?: string
          id?: string
          is_mandatory?: boolean | null
          item_description?: string
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clearance_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "clearance_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      clearance_templates: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "clearance_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compensatory_offs: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          earned_date: string
          employee_id: string
          expires_on: string | null
          hours_earned: number | null
          id: string
          notes: string | null
          organization_id: string
          reason: string
          reference_id: string | null
          status: string | null
          used_date: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          earned_date: string
          employee_id: string
          expires_on?: string | null
          hours_earned?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          reason: string
          reference_id?: string | null
          status?: string | null
          used_date?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          earned_date?: string
          employee_id?: string
          expires_on?: string | null
          hours_earned?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          reason?: string
          reference_id?: string | null
          status?: string | null
          used_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compensatory_offs_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensatory_offs_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compensatory_offs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_admission_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_admission_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_airway_devices: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_invasive: boolean | null
          name: string
          organization_id: string
          sizes_available: Json | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_invasive?: boolean | null
          name: string
          organization_id: string
          sizes_available?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_invasive?: boolean | null
          name?: string
          organization_id?: string
          sizes_available?: Json | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_airway_devices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_anesthesia_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          monitoring_level: string | null
          name: string
          organization_id: string
          requires_intubation: boolean | null
          sort_order: number | null
          typical_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monitoring_level?: string | null
          name: string
          organization_id: string
          requires_intubation?: boolean | null
          sort_order?: number | null
          typical_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          monitoring_level?: string | null
          name?: string
          organization_id?: string
          requires_intubation?: boolean | null
          sort_order?: number | null
          typical_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_anesthesia_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_appointment_types: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_fee_applicable: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_fee_applicable?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_fee_applicable?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_appointment_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_arrival_modes: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_arrival_modes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_asa_classes: {
        Row: {
          class_level: string
          created_at: string | null
          description: string
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          risk_level: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          class_level: string
          created_at?: string | null
          description: string
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          risk_level?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          class_level?: string
          created_at?: string | null
          description?: string
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          risk_level?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_asa_classes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_cities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          province: string | null
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          province?: string | null
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          province?: string | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_cities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_condition_statuses: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          severity_level: number | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          severity_level?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          severity_level?: number | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_condition_statuses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_diet_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_diet_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_discharge_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          requires_reason: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          requires_reason?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          requires_reason?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_discharge_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_document_categories: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_document_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_document_types: {
        Row: {
          category_id: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          requires_expiry: boolean | null
          sort_order: number | null
        }
        Insert: {
          category_id?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          requires_expiry?: boolean | null
          sort_order?: number | null
        }
        Update: {
          category_id?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          requires_expiry?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_document_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "config_document_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_document_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_dosage_frequencies: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          label: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          label?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_dosage_frequencies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_duration_options: {
        Row: {
          created_at: string | null
          days_equivalent: number | null
          id: string
          is_active: boolean | null
          label: string
          organization_id: string
          sort_order: number | null
          value: string
        }
        Insert: {
          created_at?: string | null
          days_equivalent?: number | null
          id?: string
          is_active?: boolean | null
          label: string
          organization_id: string
          sort_order?: number | null
          value: string
        }
        Update: {
          created_at?: string | null
          days_equivalent?: number | null
          id?: string
          is_active?: boolean | null
          label?: string
          organization_id?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_duration_options_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_er_zones: {
        Row: {
          capacity: number | null
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          capacity?: number | null
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          capacity?: number | null
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_er_zones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_imaging_modalities: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_imaging_modalities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_imaging_priorities: {
        Row: {
          code: string
          color: string
          created_at: string | null
          id: string
          is_active: boolean | null
          max_wait_hours: number | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_wait_hours?: number | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          max_wait_hours?: number | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_imaging_priorities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_instructions: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string
          sort_order: number | null
          text: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          sort_order?: number | null
          text: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          sort_order?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "config_instructions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_insurance_providers: {
        Row: {
          code: string | null
          contact_number: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code?: string | null
          contact_number?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string | null
          contact_number?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_insurance_providers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_lab_panels: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          tests: Json | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          tests?: Json | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          tests?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "config_lab_panels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_languages: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_languages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_nurse_specializations: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_nurse_specializations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_occupations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_occupations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_ot_team_roles: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_ot_team_roles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_referral_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_referral_sources_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_relations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_relations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_surgery_priorities: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          max_wait_hours: number | null
          name: string
          organization_id: string
          requires_immediate_attention: boolean | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_wait_hours?: number | null
          name: string
          organization_id: string
          requires_immediate_attention?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          max_wait_hours?: number | null
          name?: string
          organization_id?: string
          requires_immediate_attention?: boolean | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_surgery_priorities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_surgical_positions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          precautions: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          precautions?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          precautions?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_surgical_positions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_surgical_procedures: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          equipment_checklist: Json | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          requires_general_anesthesia: boolean | null
          specialization_id: string | null
          typical_blood_requirement: string | null
          typical_duration_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          equipment_checklist?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          requires_general_anesthesia?: boolean | null
          specialization_id?: string | null
          typical_blood_requirement?: string | null
          typical_duration_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          equipment_checklist?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          requires_general_anesthesia?: boolean | null
          specialization_id?: string | null
          typical_blood_requirement?: string | null
          typical_duration_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_surgical_procedures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "config_surgical_procedures_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_symptoms: {
        Row: {
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "config_symptoms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_transfer_reasons: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_transfer_reasons_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_triage_levels: {
        Row: {
          color: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          level: number
          max_wait_minutes: number | null
          name: string
          organization_id: string | null
          sort_order: number | null
          updated_at: string | null
          zone: string | null
        }
        Insert: {
          color: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level: number
          max_wait_minutes?: number | null
          name: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          zone?: string | null
        }
        Update: {
          color?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: number
          max_wait_minutes?: number | null
          name?: string
          organization_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          zone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_triage_levels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      config_who_checklist_items: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          item_key: string
          item_label: string
          organization_id: string
          phase: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          item_key: string
          item_label: string
          organization_id: string
          phase: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          item_key?: string
          item_label?: string
          organization_id?: string
          phase?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "config_who_checklist_items_organization_id_fkey"
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
      cross_match_tests: {
        Row: {
          antibody_screen:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          created_at: string | null
          id: string
          is_valid: boolean | null
          major_cross_match: Database["public"]["Enums"]["cross_match_result"]
          minor_cross_match:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          notes: string | null
          organization_id: string
          overall_result: Database["public"]["Enums"]["cross_match_result"]
          request_id: string
          test_date: string
          tested_by: string
          unit_id: string
          valid_until: string | null
        }
        Insert: {
          antibody_screen?:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          major_cross_match?: Database["public"]["Enums"]["cross_match_result"]
          minor_cross_match?:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          notes?: string | null
          organization_id: string
          overall_result?: Database["public"]["Enums"]["cross_match_result"]
          request_id: string
          test_date?: string
          tested_by: string
          unit_id: string
          valid_until?: string | null
        }
        Update: {
          antibody_screen?:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          created_at?: string | null
          id?: string
          is_valid?: boolean | null
          major_cross_match?: Database["public"]["Enums"]["cross_match_result"]
          minor_cross_match?:
            | Database["public"]["Enums"]["cross_match_result"]
            | null
          notes?: string | null
          organization_id?: string
          overall_result?: Database["public"]["Enums"]["cross_match_result"]
          request_id?: string
          test_date?: string
          tested_by?: string
          unit_id?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cross_match_tests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_match_tests_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "blood_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_match_tests_tested_by_fkey"
            columns: ["tested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cross_match_tests_unit_id_fkey"
            columns: ["unit_id"]
            isOneToOne: false
            referencedRelation: "blood_inventory"
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
      cycle_count_items: {
        Row: {
          batch_number: string | null
          bin_id: string | null
          counted_at: string | null
          counted_quantity: number | null
          created_at: string
          cycle_count_id: string
          expected_quantity: number
          id: string
          item_id: string
          notes: string | null
          variance: number | null
        }
        Insert: {
          batch_number?: string | null
          bin_id?: string | null
          counted_at?: string | null
          counted_quantity?: number | null
          created_at?: string
          cycle_count_id: string
          expected_quantity?: number
          id?: string
          item_id: string
          notes?: string | null
          variance?: number | null
        }
        Update: {
          batch_number?: string | null
          bin_id?: string | null
          counted_at?: string | null
          counted_quantity?: number | null
          created_at?: string
          cycle_count_id?: string
          expected_quantity?: number
          id?: string
          item_id?: string
          notes?: string | null
          variance?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_count_items_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_count_items_cycle_count_id_fkey"
            columns: ["cycle_count_id"]
            isOneToOne: false
            referencedRelation: "cycle_counts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_count_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      cycle_counts: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          count_number: string
          count_type: string
          created_at: string
          created_by: string | null
          id: string
          notes: string | null
          organization_id: string
          started_at: string | null
          status: string
          store_id: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          count_number: string
          count_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          started_at?: string | null
          status?: string
          store_id: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          count_number?: string
          count_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          started_at?: string | null
          status?: string
          store_id?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cycle_counts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_counts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_counts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_counts_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cycle_counts_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "warehouse_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_closings: {
        Row: {
          actual_cash: number | null
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          cash_denominations: Json | null
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closing_date: string
          closing_number: string
          created_at: string
          credit_recovered: number | null
          er_collections: number | null
          expected_cash: number | null
          grand_total: number | null
          id: string
          ipd_collections: number | null
          lab_collections: number | null
          new_credit_given: number | null
          notes: string | null
          opd_collections: number | null
          organization_id: string
          other_collections: number | null
          outstanding_receivables: number | null
          pharmacy_sales: number | null
          radiology_collections: number | null
          rejection_reason: string | null
          status: string | null
          total_card_collected: number | null
          total_cash_collected: number | null
          total_invoices: number | null
          total_other_collected: number | null
          total_payments: number | null
          total_sessions: number | null
          total_upi_collected: number | null
          updated_at: string
        }
        Insert: {
          actual_cash?: number | null
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          cash_denominations?: Json | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_date: string
          closing_number: string
          created_at?: string
          credit_recovered?: number | null
          er_collections?: number | null
          expected_cash?: number | null
          grand_total?: number | null
          id?: string
          ipd_collections?: number | null
          lab_collections?: number | null
          new_credit_given?: number | null
          notes?: string | null
          opd_collections?: number | null
          organization_id: string
          other_collections?: number | null
          outstanding_receivables?: number | null
          pharmacy_sales?: number | null
          radiology_collections?: number | null
          rejection_reason?: string | null
          status?: string | null
          total_card_collected?: number | null
          total_cash_collected?: number | null
          total_invoices?: number | null
          total_other_collected?: number | null
          total_payments?: number | null
          total_sessions?: number | null
          total_upi_collected?: number | null
          updated_at?: string
        }
        Update: {
          actual_cash?: number | null
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          cash_denominations?: Json | null
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_date?: string
          closing_number?: string
          created_at?: string
          credit_recovered?: number | null
          er_collections?: number | null
          expected_cash?: number | null
          grand_total?: number | null
          id?: string
          ipd_collections?: number | null
          lab_collections?: number | null
          new_credit_given?: number | null
          notes?: string | null
          opd_collections?: number | null
          organization_id?: string
          other_collections?: number | null
          outstanding_receivables?: number | null
          pharmacy_sales?: number | null
          radiology_collections?: number | null
          rejection_reason?: string | null
          status?: string | null
          total_card_collected?: number | null
          total_cash_collected?: number | null
          total_invoices?: number | null
          total_other_collected?: number | null
          total_payments?: number | null
          total_sessions?: number | null
          total_upi_collected?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_closings_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closings_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_closings_organization_id_fkey"
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
      death_records: {
        Row: {
          admission_id: string | null
          antecedent_cause: string | null
          antecedent_cause_interval: string | null
          autopsy_findings: string | null
          autopsy_performed: boolean | null
          body_condition: string | null
          body_released_at: string | null
          body_released_by: string | null
          body_released_cnic: string | null
          body_released_relation: string | null
          body_released_to: string | null
          branch_id: string | null
          certificate_issued_at: string | null
          certificate_number: string | null
          certifying_physician_id: string | null
          contributing_conditions: string | null
          created_at: string | null
          created_by: string | null
          death_date: string
          death_time: string
          id: string
          immediate_cause: string | null
          immediate_cause_interval: string | null
          is_mlc: boolean | null
          manner_of_death: string | null
          mlc_number: string | null
          notes: string | null
          organization_id: string
          patient_id: string
          place_of_death: string | null
          underlying_cause: string | null
          underlying_cause_interval: string | null
          updated_at: string | null
        }
        Insert: {
          admission_id?: string | null
          antecedent_cause?: string | null
          antecedent_cause_interval?: string | null
          autopsy_findings?: string | null
          autopsy_performed?: boolean | null
          body_condition?: string | null
          body_released_at?: string | null
          body_released_by?: string | null
          body_released_cnic?: string | null
          body_released_relation?: string | null
          body_released_to?: string | null
          branch_id?: string | null
          certificate_issued_at?: string | null
          certificate_number?: string | null
          certifying_physician_id?: string | null
          contributing_conditions?: string | null
          created_at?: string | null
          created_by?: string | null
          death_date: string
          death_time: string
          id?: string
          immediate_cause?: string | null
          immediate_cause_interval?: string | null
          is_mlc?: boolean | null
          manner_of_death?: string | null
          mlc_number?: string | null
          notes?: string | null
          organization_id: string
          patient_id: string
          place_of_death?: string | null
          underlying_cause?: string | null
          underlying_cause_interval?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_id?: string | null
          antecedent_cause?: string | null
          antecedent_cause_interval?: string | null
          autopsy_findings?: string | null
          autopsy_performed?: boolean | null
          body_condition?: string | null
          body_released_at?: string | null
          body_released_by?: string | null
          body_released_cnic?: string | null
          body_released_relation?: string | null
          body_released_to?: string | null
          branch_id?: string | null
          certificate_issued_at?: string | null
          certificate_number?: string | null
          certifying_physician_id?: string | null
          contributing_conditions?: string | null
          created_at?: string | null
          created_by?: string | null
          death_date?: string
          death_time?: string
          id?: string
          immediate_cause?: string | null
          immediate_cause_interval?: string | null
          is_mlc?: boolean | null
          manner_of_death?: string | null
          mlc_number?: string | null
          notes?: string | null
          organization_id?: string
          patient_id?: string
          place_of_death?: string | null
          underlying_cause?: string | null
          underlying_cause_interval?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "death_records_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_body_released_by_fkey"
            columns: ["body_released_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_certifying_physician_id_fkey"
            columns: ["certifying_physician_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "death_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_charts: {
        Row: {
          condition: string | null
          created_at: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string
          surfaces: string | null
          tooth_number: number
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          condition?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id: string
          surfaces?: string | null
          tooth_number: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          condition?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string
          surfaces?: string | null
          tooth_number?: number
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dental_charts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_charts_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_charts_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_images: {
        Row: {
          created_at: string | null
          findings: string | null
          id: string
          image_type: string | null
          image_url: string | null
          organization_id: string
          patient_id: string
          taken_at: string | null
          taken_by: string | null
          tooth_number: number | null
        }
        Insert: {
          created_at?: string | null
          findings?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          organization_id: string
          patient_id: string
          taken_at?: string | null
          taken_by?: string | null
          tooth_number?: number | null
        }
        Update: {
          created_at?: string | null
          findings?: string | null
          id?: string
          image_type?: string | null
          image_url?: string | null
          organization_id?: string
          patient_id?: string
          taken_at?: string | null
          taken_by?: string | null
          tooth_number?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dental_images_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_images_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_images_taken_by_fkey"
            columns: ["taken_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_procedures: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          default_cost: number | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          default_cost?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          default_cost?: number | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dental_procedures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dental_treatments: {
        Row: {
          appointment_id: string | null
          branch_id: string | null
          completed_date: string | null
          cost: number | null
          created_at: string | null
          diagnosis: string | null
          doctor_id: string | null
          id: string
          invoice_id: string | null
          organization_id: string
          patient_id: string
          planned_date: string | null
          procedure_id: string | null
          procedure_name: string | null
          status: string | null
          surface: string | null
          tooth_number: number | null
          treatment_notes: string | null
          updated_at: string | null
        }
        Insert: {
          appointment_id?: string | null
          branch_id?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          organization_id: string
          patient_id: string
          planned_date?: string | null
          procedure_id?: string | null
          procedure_name?: string | null
          status?: string | null
          surface?: string | null
          tooth_number?: number | null
          treatment_notes?: string | null
          updated_at?: string | null
        }
        Update: {
          appointment_id?: string | null
          branch_id?: string | null
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          diagnosis?: string | null
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          organization_id?: string
          patient_id?: string
          planned_date?: string | null
          procedure_id?: string | null
          procedure_name?: string | null
          status?: string | null
          surface?: string | null
          tooth_number?: number | null
          treatment_notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dental_treatments_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dental_treatments_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "dental_procedures"
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
      dialysis_machines: {
        Row: {
          branch_id: string | null
          chair_number: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_disinfection_at: string | null
          machine_number: string
          manufacturer: string | null
          model: string | null
          next_maintenance_date: string | null
          notes: string | null
          organization_id: string
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          chair_number?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_disinfection_at?: string | null
          machine_number: string
          manufacturer?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          chair_number?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_disinfection_at?: string | null
          machine_number?: string
          manufacturer?: string | null
          model?: string | null
          next_maintenance_date?: string | null
          notes?: string | null
          organization_id?: string
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialysis_machines_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_machines_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dialysis_patients: {
        Row: {
          access_date: string | null
          access_location: string | null
          created_at: string | null
          dialysis_frequency: string | null
          dry_weight_kg: number | null
          epo_protocol: Json | null
          hepatitis_b_status: string | null
          hepatitis_c_status: string | null
          hiv_status: string | null
          id: string
          iron_protocol: Json | null
          is_active: boolean | null
          notes: string | null
          organization_id: string
          patient_id: string
          primary_nephrologist_id: string | null
          schedule_pattern: string | null
          shift_preference: string | null
          updated_at: string | null
          vascular_access_type: string | null
        }
        Insert: {
          access_date?: string | null
          access_location?: string | null
          created_at?: string | null
          dialysis_frequency?: string | null
          dry_weight_kg?: number | null
          epo_protocol?: Json | null
          hepatitis_b_status?: string | null
          hepatitis_c_status?: string | null
          hiv_status?: string | null
          id?: string
          iron_protocol?: Json | null
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          patient_id: string
          primary_nephrologist_id?: string | null
          schedule_pattern?: string | null
          shift_preference?: string | null
          updated_at?: string | null
          vascular_access_type?: string | null
        }
        Update: {
          access_date?: string | null
          access_location?: string | null
          created_at?: string | null
          dialysis_frequency?: string | null
          dry_weight_kg?: number | null
          epo_protocol?: Json | null
          hepatitis_b_status?: string | null
          hepatitis_c_status?: string | null
          hiv_status?: string | null
          id?: string
          iron_protocol?: Json | null
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          patient_id?: string
          primary_nephrologist_id?: string | null
          schedule_pattern?: string | null
          shift_preference?: string | null
          updated_at?: string | null
          vascular_access_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialysis_patients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_patients_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_patients_primary_nephrologist_id_fkey"
            columns: ["primary_nephrologist_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      dialysis_schedules: {
        Row: {
          branch_id: string | null
          chair_number: string | null
          created_at: string | null
          dialysis_patient_id: string
          end_date: string | null
          id: string
          is_active: boolean | null
          machine_id: string | null
          notes: string | null
          organization_id: string
          pattern: string
          shift: string
          start_date: string
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          chair_number?: string | null
          created_at?: string | null
          dialysis_patient_id: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          machine_id?: string | null
          notes?: string | null
          organization_id: string
          pattern: string
          shift: string
          start_date: string
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          chair_number?: string | null
          created_at?: string | null
          dialysis_patient_id?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          machine_id?: string | null
          notes?: string | null
          organization_id?: string
          pattern?: string
          shift?: string
          start_date?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialysis_schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_schedules_dialysis_patient_id_fkey"
            columns: ["dialysis_patient_id"]
            isOneToOne: false
            referencedRelation: "dialysis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_schedules_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "dialysis_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dialysis_sessions: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          actual_uf_ml: number | null
          admission_id: string | null
          appointment_id: string | null
          attended_by: string | null
          blood_flow_ml_min: number | null
          blood_loss_ml: number | null
          branch_id: string | null
          chair_number: string | null
          complications: string | null
          created_at: string | null
          dialysate_flow_ml_min: number | null
          dialysis_patient_id: string
          dialyzer_type: string | null
          doctor_notes: string | null
          duration_minutes: number | null
          heparin_dose: string | null
          id: string
          invoice_id: string | null
          machine_id: string | null
          nurse_id: string | null
          nursing_notes: string | null
          organization_id: string
          post_bp_diastolic: number | null
          post_bp_systolic: number | null
          post_pulse: number | null
          post_weight_kg: number | null
          pre_bp_diastolic: number | null
          pre_bp_systolic: number | null
          pre_pulse: number | null
          pre_temperature: number | null
          pre_weight_kg: number | null
          session_date: string
          session_number: string | null
          shift: string | null
          status: string | null
          target_uf_ml: number | null
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          actual_uf_ml?: number | null
          admission_id?: string | null
          appointment_id?: string | null
          attended_by?: string | null
          blood_flow_ml_min?: number | null
          blood_loss_ml?: number | null
          branch_id?: string | null
          chair_number?: string | null
          complications?: string | null
          created_at?: string | null
          dialysate_flow_ml_min?: number | null
          dialysis_patient_id: string
          dialyzer_type?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          heparin_dose?: string | null
          id?: string
          invoice_id?: string | null
          machine_id?: string | null
          nurse_id?: string | null
          nursing_notes?: string | null
          organization_id: string
          post_bp_diastolic?: number | null
          post_bp_systolic?: number | null
          post_pulse?: number | null
          post_weight_kg?: number | null
          pre_bp_diastolic?: number | null
          pre_bp_systolic?: number | null
          pre_pulse?: number | null
          pre_temperature?: number | null
          pre_weight_kg?: number | null
          session_date?: string
          session_number?: string | null
          shift?: string | null
          status?: string | null
          target_uf_ml?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          actual_uf_ml?: number | null
          admission_id?: string | null
          appointment_id?: string | null
          attended_by?: string | null
          blood_flow_ml_min?: number | null
          blood_loss_ml?: number | null
          branch_id?: string | null
          chair_number?: string | null
          complications?: string | null
          created_at?: string | null
          dialysate_flow_ml_min?: number | null
          dialysis_patient_id?: string
          dialyzer_type?: string | null
          doctor_notes?: string | null
          duration_minutes?: number | null
          heparin_dose?: string | null
          id?: string
          invoice_id?: string | null
          machine_id?: string | null
          nurse_id?: string | null
          nursing_notes?: string | null
          organization_id?: string
          post_bp_diastolic?: number | null
          post_bp_systolic?: number | null
          post_pulse?: number | null
          post_weight_kg?: number | null
          pre_bp_diastolic?: number | null
          pre_bp_systolic?: number | null
          pre_pulse?: number | null
          pre_temperature?: number | null
          pre_weight_kg?: number | null
          session_date?: string
          session_number?: string | null
          shift?: string | null
          status?: string | null
          target_uf_ml?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dialysis_sessions_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_attended_by_fkey"
            columns: ["attended_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_dialysis_patient_id_fkey"
            columns: ["dialysis_patient_id"]
            isOneToOne: false
            referencedRelation: "dialysis_patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "dialysis_machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dialysis_vitals: {
        Row: {
          arterial_pressure: number | null
          blood_flow_rate: number | null
          bp_diastolic: number | null
          bp_systolic: number | null
          conductivity: number | null
          created_at: string | null
          id: string
          minute_mark: number | null
          notes: string | null
          pulse: number | null
          recorded_at: string
          recorded_by: string | null
          session_id: string
          temperature: number | null
          tmp: number | null
          uf_rate: number | null
          venous_pressure: number | null
        }
        Insert: {
          arterial_pressure?: number | null
          blood_flow_rate?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          conductivity?: number | null
          created_at?: string | null
          id?: string
          minute_mark?: number | null
          notes?: string | null
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          session_id: string
          temperature?: number | null
          tmp?: number | null
          uf_rate?: number | null
          venous_pressure?: number | null
        }
        Update: {
          arterial_pressure?: number | null
          blood_flow_rate?: number | null
          bp_diastolic?: number | null
          bp_systolic?: number | null
          conductivity?: number | null
          created_at?: string | null
          id?: string
          minute_mark?: number | null
          notes?: string | null
          pulse?: number | null
          recorded_at?: string
          recorded_by?: string | null
          session_id?: string
          temperature?: number | null
          tmp?: number | null
          uf_rate?: number | null
          venous_pressure?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dialysis_vitals_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dialysis_vitals_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "dialysis_sessions"
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
      discharge_checklist_items: {
        Row: {
          admission_id: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          id: string
          item_id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          admission_id: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          item_id: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_id?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          id?: string
          item_id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discharge_checklist_items_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
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
      disciplinary_actions: {
        Row: {
          acknowledged_at: string | null
          action_taken: string
          action_type: string
          appeal_details: string | null
          appeal_outcome: string | null
          appeal_submitted: boolean | null
          created_at: string | null
          document_url: string | null
          employee_acknowledged: boolean | null
          employee_id: string
          employee_response: string | null
          id: string
          incident_date: string
          incident_description: string
          investigation_details: string | null
          issued_by: string
          issued_date: string | null
          organization_id: string
          policy_violated: string | null
          suspension_days: number | null
          witness_ids: string[] | null
        }
        Insert: {
          acknowledged_at?: string | null
          action_taken: string
          action_type: string
          appeal_details?: string | null
          appeal_outcome?: string | null
          appeal_submitted?: boolean | null
          created_at?: string | null
          document_url?: string | null
          employee_acknowledged?: boolean | null
          employee_id: string
          employee_response?: string | null
          id?: string
          incident_date: string
          incident_description: string
          investigation_details?: string | null
          issued_by: string
          issued_date?: string | null
          organization_id: string
          policy_violated?: string | null
          suspension_days?: number | null
          witness_ids?: string[] | null
        }
        Update: {
          acknowledged_at?: string | null
          action_taken?: string
          action_type?: string
          appeal_details?: string | null
          appeal_outcome?: string | null
          appeal_submitted?: boolean | null
          created_at?: string | null
          document_url?: string | null
          employee_acknowledged?: boolean | null
          employee_id?: string
          employee_response?: string | null
          id?: string
          incident_date?: string
          incident_description?: string
          investigation_details?: string | null
          issued_by?: string
          issued_date?: string | null
          organization_id?: string
          policy_violated?: string | null
          suspension_days?: number | null
          witness_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "disciplinary_actions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disciplinary_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dock_appointments: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          appointment_type: string
          created_at: string
          created_by: string | null
          dock_number: string | null
          driver_name: string | null
          driver_phone: string | null
          id: string
          notes: string | null
          organization_id: string
          po_id: string | null
          scheduled_time: string | null
          shipment_id: string | null
          status: string
          store_id: string | null
          updated_at: string
          vehicle_number: string | null
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          appointment_type?: string
          created_at?: string
          created_by?: string | null
          dock_number?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          po_id?: string | null
          scheduled_time?: string | null
          shipment_id?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
          vehicle_number?: string | null
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          appointment_type?: string
          created_at?: string
          created_by?: string | null
          dock_number?: string | null
          driver_name?: string | null
          driver_phone?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          po_id?: string | null
          scheduled_time?: string | null
          shipment_id?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dock_appointments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dock_appointments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dock_appointments_po_id_fkey"
            columns: ["po_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dock_appointments_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dock_appointments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_compensation_plans: {
        Row: {
          base_salary: number | null
          consultation_share_percent: number | null
          created_at: string | null
          created_by: string | null
          doctor_id: string
          effective_from: string
          effective_to: string | null
          id: string
          ipd_visit_share_percent: number | null
          is_active: boolean | null
          lab_referral_percent: number | null
          minimum_guarantee: number | null
          notes: string | null
          organization_id: string
          plan_type: string
          procedure_share_percent: number | null
          surgery_share_percent: number | null
          updated_at: string | null
        }
        Insert: {
          base_salary?: number | null
          consultation_share_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          doctor_id: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          ipd_visit_share_percent?: number | null
          is_active?: boolean | null
          lab_referral_percent?: number | null
          minimum_guarantee?: number | null
          notes?: string | null
          organization_id: string
          plan_type: string
          procedure_share_percent?: number | null
          surgery_share_percent?: number | null
          updated_at?: string | null
        }
        Update: {
          base_salary?: number | null
          consultation_share_percent?: number | null
          created_at?: string | null
          created_by?: string | null
          doctor_id?: string
          effective_from?: string
          effective_to?: string | null
          id?: string
          ipd_visit_share_percent?: number | null
          is_active?: boolean | null
          lab_referral_percent?: number | null
          minimum_guarantee?: number | null
          notes?: string | null
          organization_id?: string
          plan_type?: string
          procedure_share_percent?: number | null
          surgery_share_percent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_compensation_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_compensation_plans_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_compensation_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_earnings: {
        Row: {
          compensation_plan_id: string | null
          created_at: string | null
          doctor_id: string
          doctor_share_amount: number
          doctor_share_percent: number
          earning_date: string
          gross_amount: number
          hospital_share_amount: number
          id: string
          is_paid: boolean | null
          notes: string | null
          organization_id: string
          paid_at: string | null
          paid_in_payroll_id: string | null
          patient_id: string | null
          source_id: string | null
          source_reference: string | null
          source_type: string
        }
        Insert: {
          compensation_plan_id?: string | null
          created_at?: string | null
          doctor_id: string
          doctor_share_amount?: number
          doctor_share_percent?: number
          earning_date?: string
          gross_amount?: number
          hospital_share_amount?: number
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          organization_id: string
          paid_at?: string | null
          paid_in_payroll_id?: string | null
          patient_id?: string | null
          source_id?: string | null
          source_reference?: string | null
          source_type: string
        }
        Update: {
          compensation_plan_id?: string | null
          created_at?: string | null
          doctor_id?: string
          doctor_share_amount?: number
          doctor_share_percent?: number
          earning_date?: string
          gross_amount?: number
          hospital_share_amount?: number
          id?: string
          is_paid?: boolean | null
          notes?: string | null
          organization_id?: string
          paid_at?: string | null
          paid_in_payroll_id?: string | null
          patient_id?: string | null
          source_id?: string | null
          source_reference?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "doctor_earnings_compensation_plan_id_fkey"
            columns: ["compensation_plan_id"]
            isOneToOne: false
            referencedRelation: "doctor_compensation_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_earnings_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_earnings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_earnings_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      doctor_fee_schedule: {
        Row: {
          appointment_type: string
          created_at: string | null
          doctor_id: string
          fee: number
          id: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_type: string
          created_at?: string | null
          doctor_id: string
          fee?: number
          id?: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_type?: string
          created_at?: string | null
          doctor_id?: string
          fee?: number
          id?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "doctor_fee_schedule_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_fee_schedule_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      doctor_settlements: {
        Row: {
          created_at: string | null
          doctor_id: string
          earning_ids: string[]
          id: string
          notes: string | null
          organization_id: string
          payment_method: string | null
          reference_number: string | null
          settled_by: string | null
          settlement_date: string
          settlement_number: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string | null
          doctor_id: string
          earning_ids?: string[]
          id?: string
          notes?: string | null
          organization_id: string
          payment_method?: string | null
          reference_number?: string | null
          settled_by?: string | null
          settlement_date?: string
          settlement_number?: string | null
          total_amount?: number
        }
        Update: {
          created_at?: string | null
          doctor_id?: string
          earning_ids?: string[]
          id?: string
          notes?: string | null
          organization_id?: string
          payment_method?: string | null
          reference_number?: string | null
          settled_by?: string | null
          settlement_date?: string
          settlement_number?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctor_settlements_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_settlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "doctor_settlements_settled_by_fkey"
            columns: ["settled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          branch_id: string | null
          consultation_fee: number | null
          created_at: string
          default_surgery_fee: number | null
          emergency_fee: number | null
          employee_id: string | null
          followup_fee: number | null
          id: string
          ipd_visit_fee: number | null
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
          default_surgery_fee?: number | null
          emergency_fee?: number | null
          employee_id?: string | null
          followup_fee?: number | null
          id?: string
          ipd_visit_fee?: number | null
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
          default_surgery_fee?: number | null
          emergency_fee?: number | null
          employee_id?: string | null
          followup_fee?: number | null
          id?: string
          ipd_visit_fee?: number | null
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
      donation_campaigns: {
        Row: {
          branch_id: string | null
          campaign_number: string
          category: string
          collected_amount: number
          cover_image_url: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          donor_count: number
          end_date: string | null
          goal_amount: number
          id: string
          organization_id: string
          share_token: string | null
          start_date: string
          status: string
          title: string
          title_ar: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          campaign_number: string
          category?: string
          collected_amount?: number
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number
          end_date?: string | null
          goal_amount?: number
          id?: string
          organization_id: string
          share_token?: string | null
          start_date: string
          status?: string
          title: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          campaign_number?: string
          category?: string
          collected_amount?: number
          cover_image_url?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          donor_count?: number
          end_date?: string | null
          goal_amount?: number
          id?: string
          organization_id?: string
          share_token?: string | null
          start_date?: string
          status?: string
          title?: string
          title_ar?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_campaigns_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_recurring_schedules: {
        Row: {
          amount: number
          created_at: string
          donor_id: string
          end_date: string | null
          frequency: string
          id: string
          installments_paid: number
          is_active: boolean
          last_donation_id: string | null
          next_due_date: string
          notes: string | null
          organization_id: string
          purpose: string | null
          reminder_days_before: number
          start_date: string
          total_collected: number
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          donor_id: string
          end_date?: string | null
          frequency?: string
          id?: string
          installments_paid?: number
          is_active?: boolean
          last_donation_id?: string | null
          next_due_date?: string
          notes?: string | null
          organization_id: string
          purpose?: string | null
          reminder_days_before?: number
          start_date?: string
          total_collected?: number
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          donor_id?: string
          end_date?: string | null
          frequency?: string
          id?: string
          installments_paid?: number
          is_active?: boolean
          last_donation_id?: string | null
          next_due_date?: string
          notes?: string | null
          organization_id?: string
          purpose?: string | null
          reminder_days_before?: number
          start_date?: string
          total_collected?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_recurring_schedules_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "financial_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_recurring_schedules_last_donation_id_fkey"
            columns: ["last_donation_id"]
            isOneToOne: false
            referencedRelation: "financial_donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_recurring_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_reminders: {
        Row: {
          created_at: string
          donor_id: string
          id: string
          notes: string | null
          organization_id: string
          reminder_date: string
          reminder_type: string
          schedule_id: string
          sent_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          id?: string
          notes?: string | null
          organization_id: string
          reminder_date: string
          reminder_type?: string
          schedule_id: string
          sent_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          reminder_date?: string
          reminder_type?: string
          schedule_id?: string
          sent_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donation_reminders_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "financial_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_reminders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_reminders_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "donation_recurring_schedules"
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
      employee_clearance: {
        Row: {
          cleared_at: string | null
          cleared_by: string | null
          department: string
          id: string
          is_cleared: boolean | null
          item_description: string
          organization_id: string
          pending_items: string | null
          recovery_amount: number | null
          remarks: string | null
          resignation_id: string
        }
        Insert: {
          cleared_at?: string | null
          cleared_by?: string | null
          department: string
          id?: string
          is_cleared?: boolean | null
          item_description: string
          organization_id: string
          pending_items?: string | null
          recovery_amount?: number | null
          remarks?: string | null
          resignation_id: string
        }
        Update: {
          cleared_at?: string | null
          cleared_by?: string | null
          department?: string
          id?: string
          is_cleared?: boolean | null
          item_description?: string
          organization_id?: string
          pending_items?: string | null
          recovery_amount?: number | null
          remarks?: string | null
          resignation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_clearance_cleared_by_fkey"
            columns: ["cleared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_clearance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_clearance_resignation_id_fkey"
            columns: ["resignation_id"]
            isOneToOne: false
            referencedRelation: "resignations"
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
      employee_onboarding: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          employee_id: string
          id: string
          is_completed: boolean | null
          item_name: string
          notes: string | null
          organization_id: string
          template_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          employee_id: string
          id?: string
          is_completed?: boolean | null
          item_name: string
          notes?: string | null
          organization_id: string
          template_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          employee_id?: string
          id?: string
          is_completed?: boolean | null
          item_name?: string
          notes?: string | null
          organization_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_onboarding_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_onboarding_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
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
      exit_interviews: {
        Row: {
          additional_comments: string | null
          created_at: string | null
          id: string
          interview_date: string | null
          interviewer_id: string | null
          organization_id: string
          primary_reason_leaving: string | null
          rating_compensation: number | null
          rating_growth_opportunities: number | null
          rating_management: number | null
          rating_work_environment: number | null
          rating_work_life_balance: number | null
          resignation_id: string
          status: string | null
          suggestions: string | null
          what_could_improve: string | null
          what_liked_most: string | null
          would_recommend: boolean | null
          would_rejoin: boolean | null
        }
        Insert: {
          additional_comments?: string | null
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interviewer_id?: string | null
          organization_id: string
          primary_reason_leaving?: string | null
          rating_compensation?: number | null
          rating_growth_opportunities?: number | null
          rating_management?: number | null
          rating_work_environment?: number | null
          rating_work_life_balance?: number | null
          resignation_id: string
          status?: string | null
          suggestions?: string | null
          what_could_improve?: string | null
          what_liked_most?: string | null
          would_recommend?: boolean | null
          would_rejoin?: boolean | null
        }
        Update: {
          additional_comments?: string | null
          created_at?: string | null
          id?: string
          interview_date?: string | null
          interviewer_id?: string | null
          organization_id?: string
          primary_reason_leaving?: string | null
          rating_compensation?: number | null
          rating_growth_opportunities?: number | null
          rating_management?: number | null
          rating_work_environment?: number | null
          rating_work_life_balance?: number | null
          resignation_id?: string
          status?: string | null
          suggestions?: string | null
          what_could_improve?: string | null
          what_liked_most?: string | null
          would_recommend?: boolean | null
          would_rejoin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "exit_interviews_interviewer_id_fkey"
            columns: ["interviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exit_interviews_resignation_id_fkey"
            columns: ["resignation_id"]
            isOneToOne: false
            referencedRelation: "resignations"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          billing_session_id: string | null
          branch_id: string
          category: string | null
          created_at: string | null
          created_by: string
          description: string
          expense_number: string
          id: string
          notes: string | null
          organization_id: string
          paid_to: string | null
          payment_method_id: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          billing_session_id?: string | null
          branch_id: string
          category?: string | null
          created_at?: string | null
          created_by: string
          description: string
          expense_number: string
          id?: string
          notes?: string | null
          organization_id: string
          paid_to?: string | null
          payment_method_id?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          billing_session_id?: string | null
          branch_id?: string
          category?: string | null
          created_at?: string | null
          created_by?: string
          description?: string
          expense_number?: string
          id?: string
          notes?: string | null
          organization_id?: string
          paid_to?: string | null
          payment_method_id?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_billing_session_id_fkey"
            columns: ["billing_session_id"]
            isOneToOne: false
            referencedRelation: "billing_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      final_settlements: {
        Row: {
          advance_recovery: number | null
          approved_at: string | null
          approved_by: string | null
          basic_salary_amount: number | null
          basic_salary_days: number | null
          bonus_amount: number | null
          created_at: string | null
          created_by: string | null
          employee_id: string
          gratuity_amount: number | null
          id: string
          leave_encashment_amount: number | null
          leave_encashment_days: number | null
          loan_recovery: number | null
          net_payable: number | null
          notes: string | null
          notice_period_shortage_amount: number | null
          organization_id: string
          other_deductions: number | null
          other_deductions_details: string | null
          other_earnings: number | null
          other_earnings_details: string | null
          payment_date: string | null
          payment_mode: string | null
          payment_reference: string | null
          resignation_id: string
          status: string | null
          tax_deduction: number | null
          total_deductions: number | null
          total_earnings: number | null
          updated_at: string | null
        }
        Insert: {
          advance_recovery?: number | null
          approved_at?: string | null
          approved_by?: string | null
          basic_salary_amount?: number | null
          basic_salary_days?: number | null
          bonus_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          gratuity_amount?: number | null
          id?: string
          leave_encashment_amount?: number | null
          leave_encashment_days?: number | null
          loan_recovery?: number | null
          net_payable?: number | null
          notes?: string | null
          notice_period_shortage_amount?: number | null
          organization_id: string
          other_deductions?: number | null
          other_deductions_details?: string | null
          other_earnings?: number | null
          other_earnings_details?: string | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_reference?: string | null
          resignation_id: string
          status?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Update: {
          advance_recovery?: number | null
          approved_at?: string | null
          approved_by?: string | null
          basic_salary_amount?: number | null
          basic_salary_days?: number | null
          bonus_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          gratuity_amount?: number | null
          id?: string
          leave_encashment_amount?: number | null
          leave_encashment_days?: number | null
          loan_recovery?: number | null
          net_payable?: number | null
          notes?: string | null
          notice_period_shortage_amount?: number | null
          organization_id?: string
          other_deductions?: number | null
          other_deductions_details?: string | null
          other_earnings?: number | null
          other_earnings_details?: string | null
          payment_date?: string | null
          payment_mode?: string | null
          payment_reference?: string | null
          resignation_id?: string
          status?: string | null
          tax_deduction?: number | null
          total_deductions?: number | null
          total_earnings?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "final_settlements_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_settlements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_settlements_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_settlements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "final_settlements_resignation_id_fkey"
            columns: ["resignation_id"]
            isOneToOne: false
            referencedRelation: "resignations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_donations: {
        Row: {
          amount: number
          branch_id: string | null
          campaign_id: string | null
          created_at: string
          created_by: string | null
          currency: string
          donation_date: string
          donation_number: string
          donation_type: string
          donor_id: string
          id: string
          notes: string | null
          organization_id: string
          payment_method: string
          payment_reference: string | null
          purpose: string
          purpose_detail: string | null
          receipt_issued: boolean
          receipt_issued_at: string | null
          receipt_number: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          branch_id?: string | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          donation_date?: string
          donation_number: string
          donation_type?: string
          donor_id: string
          id?: string
          notes?: string | null
          organization_id: string
          payment_method?: string
          payment_reference?: string | null
          purpose?: string
          purpose_detail?: string | null
          receipt_issued?: boolean
          receipt_issued_at?: string | null
          receipt_number?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          branch_id?: string | null
          campaign_id?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string
          donation_date?: string
          donation_number?: string
          donation_type?: string
          donor_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          payment_method?: string
          payment_reference?: string | null
          purpose?: string
          purpose_detail?: string | null
          receipt_issued?: boolean
          receipt_issued_at?: string | null
          receipt_number?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_donations_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_donations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "financial_donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_donors: {
        Row: {
          address: string | null
          branch_id: string | null
          city: string | null
          cnic_passport: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          donor_number: string
          donor_photo_url: string | null
          donor_type: string
          email: string | null
          id: string
          is_active: boolean
          name: string
          name_ar: string | null
          notes: string | null
          organization_id: string
          phone: string | null
          total_donated: number
          total_donations_count: number
          updated_at: string
        }
        Insert: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          cnic_passport?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          donor_number: string
          donor_photo_url?: string | null
          donor_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_ar?: string | null
          notes?: string | null
          organization_id: string
          phone?: string | null
          total_donated?: number
          total_donations_count?: number
          updated_at?: string
        }
        Update: {
          address?: string | null
          branch_id?: string | null
          city?: string | null
          cnic_passport?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          donor_number?: string
          donor_photo_url?: string | null
          donor_type?: string
          email?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string | null
          notes?: string | null
          organization_id?: string
          phone?: string | null
          total_donated?: number
          total_donations_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_donors_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financial_donors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fiscal_years: {
        Row: {
          closed_at: string | null
          closed_by: string | null
          created_at: string
          end_date: string
          id: string
          is_closed: boolean
          is_current: boolean
          name: string
          organization_id: string
          start_date: string
        }
        Insert: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          end_date: string
          id?: string
          is_closed?: boolean
          is_current?: boolean
          name: string
          organization_id: string
          start_date: string
        }
        Update: {
          closed_at?: string | null
          closed_by?: string | null
          created_at?: string
          end_date?: string
          id?: string
          is_closed?: boolean
          is_current?: boolean
          name?: string
          organization_id?: string
          start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "fiscal_years_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fiscal_years_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      gate_logs: {
        Row: {
          created_at: string
          dock_appointment_id: string | null
          driver_name: string | null
          entry_time: string
          exit_time: string | null
          id: string
          logged_by: string | null
          organization_id: string
          purpose: string
          store_id: string | null
          vehicle_number: string
        }
        Insert: {
          created_at?: string
          dock_appointment_id?: string | null
          driver_name?: string | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          logged_by?: string | null
          organization_id: string
          purpose?: string
          store_id?: string | null
          vehicle_number: string
        }
        Update: {
          created_at?: string
          dock_appointment_id?: string | null
          driver_name?: string | null
          entry_time?: string
          exit_time?: string | null
          id?: string
          logged_by?: string | null
          organization_id?: string
          purpose?: string
          store_id?: string | null
          vehicle_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "gate_logs_dock_appointment_id_fkey"
            columns: ["dock_appointment_id"]
            isOneToOne: false
            referencedRelation: "dock_appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_logs_logged_by_fkey"
            columns: ["logged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gate_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      goods_received_notes: {
        Row: {
          branch_id: string
          created_at: string
          grn_number: string
          id: string
          invoice_amount: number | null
          invoice_date: string | null
          invoice_number: string | null
          notes: string | null
          organization_id: string
          purchase_order_id: string | null
          qc_checked_at: string | null
          qc_checked_by: string | null
          qc_notes: string | null
          qc_status: string | null
          received_by: string | null
          received_date: string
          status: Database["public"]["Enums"]["grn_status"]
          store_id: string | null
          updated_at: string
          vendor_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string
          grn_number: string
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          organization_id: string
          purchase_order_id?: string | null
          qc_checked_at?: string | null
          qc_checked_by?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
          store_id?: string | null
          updated_at?: string
          vendor_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string
          grn_number?: string
          id?: string
          invoice_amount?: number | null
          invoice_date?: string | null
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string
          purchase_order_id?: string | null
          qc_checked_at?: string | null
          qc_checked_by?: string | null
          qc_notes?: string | null
          qc_status?: string | null
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
          store_id?: string | null
          updated_at?: string
          vendor_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "goods_received_notes_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goods_received_notes_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      grn_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          grn_id: string
          id: string
          item_id: string | null
          item_type: string | null
          medicine_id: string | null
          po_item_id: string | null
          qc_status: string | null
          quantity_accepted: number
          quantity_received: number
          quantity_rejected: number
          rejection_reason: string | null
          selling_price: number | null
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          medicine_id?: string | null
          po_item_id?: string | null
          qc_status?: string | null
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
          selling_price?: number | null
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id?: string
          id?: string
          item_id?: string | null
          item_type?: string | null
          medicine_id?: string | null
          po_item_id?: string | null
          qc_status?: string | null
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
          selling_price?: number | null
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "grn_items_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      hesn_reports: {
        Row: {
          branch_id: string | null
          created_at: string
          created_by: string | null
          diagnosis_date: string
          disease_code: string | null
          disease_name: string
          hesn_reference_id: string | null
          id: string
          lab_confirmed: boolean | null
          notes: string | null
          organization_id: string
          outcome: string | null
          patient_id: string
          report_date: string
          report_type: string
          severity: string | null
          specimen_date: string | null
          specimen_type: string | null
          submission_response: Json | null
          submission_status: string
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string
          vaccination_date: string | null
          vaccination_dose_number: number | null
          vaccination_type: string | null
        }
        Insert: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis_date: string
          disease_code?: string | null
          disease_name: string
          hesn_reference_id?: string | null
          id?: string
          lab_confirmed?: boolean | null
          notes?: string | null
          organization_id: string
          outcome?: string | null
          patient_id: string
          report_date?: string
          report_type: string
          severity?: string | null
          specimen_date?: string | null
          specimen_type?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          vaccination_date?: string | null
          vaccination_dose_number?: number | null
          vaccination_type?: string | null
        }
        Update: {
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          diagnosis_date?: string
          disease_code?: string | null
          disease_name?: string
          hesn_reference_id?: string | null
          id?: string
          lab_confirmed?: boolean | null
          notes?: string | null
          organization_id?: string
          outcome?: string | null
          patient_id?: string
          report_date?: string
          report_type?: string
          severity?: string | null
          specimen_date?: string | null
          specimen_type?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string
          vaccination_date?: string | null
          vaccination_dose_number?: number | null
          vaccination_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hesn_reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hesn_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hesn_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hesn_reports_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hesn_reports_submitted_by_fkey"
            columns: ["submitted_by"]
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
      housekeeping_inspections: {
        Row: {
          area: string
          checklist: Json | null
          created_at: string
          id: string
          inspected_at: string
          inspector_id: string | null
          notes: string | null
          organization_id: string
          passed: boolean | null
          photo_urls: string[] | null
          score: number | null
          task_id: string | null
        }
        Insert: {
          area: string
          checklist?: Json | null
          created_at?: string
          id?: string
          inspected_at?: string
          inspector_id?: string | null
          notes?: string | null
          organization_id: string
          passed?: boolean | null
          photo_urls?: string[] | null
          score?: number | null
          task_id?: string | null
        }
        Update: {
          area?: string
          checklist?: Json | null
          created_at?: string
          id?: string
          inspected_at?: string
          inspector_id?: string | null
          notes?: string | null
          organization_id?: string
          passed?: boolean | null
          photo_urls?: string[] | null
          score?: number | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_inspections_inspector_id_fkey"
            columns: ["inspector_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_inspections_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "housekeeping_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      housekeeping_tasks: {
        Row: {
          area: string
          assigned_to: string | null
          branch_id: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          due_at: string | null
          id: string
          notes: string | null
          organization_id: string
          priority: string
          room_id: string | null
          status: string
          task_type: string
          updated_at: string
        }
        Insert: {
          area: string
          assigned_to?: string | null
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          priority?: string
          room_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Update: {
          area?: string
          assigned_to?: string | null
          branch_id?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          due_at?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          priority?: string
          room_id?: string | null
          status?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "housekeeping_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "housekeeping_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_modalities: {
        Row: {
          branch_id: string
          code: string
          created_at: string | null
          default_duration_minutes: number | null
          department: string | null
          id: string
          is_active: boolean | null
          modality_type: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          preparation_instructions: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          code: string
          created_at?: string | null
          default_duration_minutes?: number | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          modality_type?: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          preparation_instructions?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          code?: string
          created_at?: string | null
          default_duration_minutes?: number | null
          department?: string | null
          id?: string
          is_active?: boolean | null
          modality_type?: Database["public"]["Enums"]["imaging_modality"]
          name?: string
          organization_id?: string
          preparation_instructions?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_modalities_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_modalities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_modality_pacs_mappings: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          modality_id: string
          pacs_server_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          modality_id: string
          pacs_server_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          modality_id?: string
          pacs_server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imaging_modality_pacs_mappings_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "imaging_modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_modality_pacs_mappings_pacs_server_id_fkey"
            columns: ["pacs_server_id"]
            isOneToOne: false
            referencedRelation: "pacs_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_orders: {
        Row: {
          admission_id: string | null
          branch_id: string
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          clinical_history: string | null
          clinical_indication: string | null
          consultation_id: string | null
          created_at: string | null
          er_registration_id: string | null
          id: string
          invoice_id: string | null
          modality: Database["public"]["Enums"]["imaging_modality"]
          notes: string | null
          order_number: string
          ordered_at: string | null
          ordered_by: string
          organization_id: string
          patient_id: string
          payment_status: string | null
          performed_at: string | null
          priority: Database["public"]["Enums"]["imaging_priority"]
          procedure_id: string | null
          procedure_name: string
          radiologist_id: string | null
          reported_at: string | null
          scheduled_date: string | null
          scheduled_time: string | null
          status: Database["public"]["Enums"]["imaging_order_status"]
          technician_id: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admission_id?: string | null
          branch_id: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinical_history?: string | null
          clinical_indication?: string | null
          consultation_id?: string | null
          created_at?: string | null
          er_registration_id?: string | null
          id?: string
          invoice_id?: string | null
          modality: Database["public"]["Enums"]["imaging_modality"]
          notes?: string | null
          order_number: string
          ordered_at?: string | null
          ordered_by: string
          organization_id: string
          patient_id: string
          payment_status?: string | null
          performed_at?: string | null
          priority?: Database["public"]["Enums"]["imaging_priority"]
          procedure_id?: string | null
          procedure_name: string
          radiologist_id?: string | null
          reported_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["imaging_order_status"]
          technician_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admission_id?: string | null
          branch_id?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinical_history?: string | null
          clinical_indication?: string | null
          consultation_id?: string | null
          created_at?: string | null
          er_registration_id?: string | null
          id?: string
          invoice_id?: string | null
          modality?: Database["public"]["Enums"]["imaging_modality"]
          notes?: string | null
          order_number?: string
          ordered_at?: string | null
          ordered_by?: string
          organization_id?: string
          patient_id?: string
          payment_status?: string | null
          performed_at?: string | null
          priority?: Database["public"]["Enums"]["imaging_priority"]
          procedure_id?: string | null
          procedure_name?: string
          radiologist_id?: string | null
          reported_at?: string | null
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: Database["public"]["Enums"]["imaging_order_status"]
          technician_id?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_orders_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_er_registration_id_fkey"
            columns: ["er_registration_id"]
            isOneToOne: false
            referencedRelation: "emergency_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "imaging_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_radiologist_id_fkey"
            columns: ["radiologist_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_orders_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_procedures: {
        Row: {
          base_price: number | null
          body_part: string | null
          code: string
          created_at: string | null
          default_views: string | null
          estimated_duration_minutes: number | null
          id: string
          is_active: boolean | null
          modality_id: string | null
          modality_type: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          preparation: string | null
          service_type_id: string | null
          updated_at: string | null
        }
        Insert: {
          base_price?: number | null
          body_part?: string | null
          code: string
          created_at?: string | null
          default_views?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          modality_id?: string | null
          modality_type: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          preparation?: string | null
          service_type_id?: string | null
          updated_at?: string | null
        }
        Update: {
          base_price?: number | null
          body_part?: string | null
          code?: string
          created_at?: string | null
          default_views?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          modality_id?: string | null
          modality_type?: Database["public"]["Enums"]["imaging_modality"]
          name?: string
          organization_id?: string
          preparation?: string | null
          service_type_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_procedures_modality_id_fkey"
            columns: ["modality_id"]
            isOneToOne: false
            referencedRelation: "imaging_modalities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_procedures_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_procedures_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_report_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          modality: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          procedure_id: string | null
          template_structure: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          modality: Database["public"]["Enums"]["imaging_modality"]
          name: string
          organization_id: string
          procedure_id?: string | null
          template_structure: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          modality?: Database["public"]["Enums"]["imaging_modality"]
          name?: string
          organization_id?: string
          procedure_id?: string | null
          template_structure?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_report_templates_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "imaging_procedures"
            referencedColumns: ["id"]
          },
        ]
      }
      imaging_results: {
        Row: {
          comparison: string | null
          created_at: string | null
          created_by: string | null
          finding_status:
            | Database["public"]["Enums"]["imaging_finding_status"]
            | null
          findings: string | null
          id: string
          images: Json | null
          impression: string | null
          order_id: string
          recommendations: string | null
          report_template_id: string | null
          structured_findings: Json | null
          technique: string | null
          updated_at: string | null
        }
        Insert: {
          comparison?: string | null
          created_at?: string | null
          created_by?: string | null
          finding_status?:
            | Database["public"]["Enums"]["imaging_finding_status"]
            | null
          findings?: string | null
          id?: string
          images?: Json | null
          impression?: string | null
          order_id: string
          recommendations?: string | null
          report_template_id?: string | null
          structured_findings?: Json | null
          technique?: string | null
          updated_at?: string | null
        }
        Update: {
          comparison?: string | null
          created_at?: string | null
          created_by?: string | null
          finding_status?:
            | Database["public"]["Enums"]["imaging_finding_status"]
            | null
          findings?: string | null
          id?: string
          images?: Json | null
          impression?: string | null
          order_id?: string
          recommendations?: string | null
          report_template_id?: string | null
          structured_findings?: Json | null
          technique?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imaging_results_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imaging_results_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "imaging_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_reports: {
        Row: {
          branch_id: string | null
          closed_at: string | null
          closed_by: string | null
          corrective_actions: string | null
          created_at: string | null
          description: string
          id: string
          immediate_action_taken: string | null
          incident_date: string
          incident_number: string | null
          incident_time: string | null
          incident_type: string | null
          investigation_findings: string | null
          investigation_status: string | null
          investigator_id: string | null
          involved_employee_ids: string[] | null
          involved_patient_ids: string[] | null
          location: string
          organization_id: string
          preventive_measures: string | null
          reported_by: string
          resolution: string | null
          root_cause: string | null
          severity: string | null
          updated_at: string | null
          witness_ids: string[] | null
        }
        Insert: {
          branch_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          description: string
          id?: string
          immediate_action_taken?: string | null
          incident_date: string
          incident_number?: string | null
          incident_time?: string | null
          incident_type?: string | null
          investigation_findings?: string | null
          investigation_status?: string | null
          investigator_id?: string | null
          involved_employee_ids?: string[] | null
          involved_patient_ids?: string[] | null
          location: string
          organization_id: string
          preventive_measures?: string | null
          reported_by: string
          resolution?: string | null
          root_cause?: string | null
          severity?: string | null
          updated_at?: string | null
          witness_ids?: string[] | null
        }
        Update: {
          branch_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          description?: string
          id?: string
          immediate_action_taken?: string | null
          incident_date?: string
          incident_number?: string | null
          incident_time?: string | null
          incident_type?: string | null
          investigation_findings?: string | null
          investigation_status?: string | null
          investigator_id?: string | null
          involved_employee_ids?: string[] | null
          involved_patient_ids?: string[] | null
          location?: string
          organization_id?: string
          preventive_measures?: string | null
          reported_by?: string
          resolution?: string | null
          root_cause?: string | null
          severity?: string | null
          updated_at?: string | null
          witness_ids?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_reports_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_investigator_id_fkey"
            columns: ["investigator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_reports_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_claims: {
        Row: {
          appeal_notes: string | null
          approval_date: string | null
          approved_amount: number | null
          approved_by: string | null
          attachments: Json | null
          branch_id: string | null
          claim_date: string
          claim_number: string
          copay_amount: number | null
          created_at: string | null
          created_by: string | null
          deductible_amount: number | null
          denial_reasons: Json | null
          drg_code: string | null
          icd_codes: string[] | null
          id: string
          invoice_id: string | null
          notes: string | null
          nphies_claim_id: string | null
          nphies_response: Json | null
          nphies_status: string | null
          organization_id: string
          paid_amount: number | null
          patient_insurance_id: string
          patient_responsibility: number | null
          payment_date: string | null
          payment_reference: string | null
          pre_auth_date: string | null
          pre_auth_number: string | null
          pre_auth_status: string | null
          rejection_reason: string | null
          resubmission_count: number | null
          status: string | null
          submission_date: string | null
          submitted_by: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          appeal_notes?: string | null
          approval_date?: string | null
          approved_amount?: number | null
          approved_by?: string | null
          attachments?: Json | null
          branch_id?: string | null
          claim_date?: string
          claim_number: string
          copay_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          deductible_amount?: number | null
          denial_reasons?: Json | null
          drg_code?: string | null
          icd_codes?: string[] | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          nphies_claim_id?: string | null
          nphies_response?: Json | null
          nphies_status?: string | null
          organization_id: string
          paid_amount?: number | null
          patient_insurance_id: string
          patient_responsibility?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          pre_auth_date?: string | null
          pre_auth_number?: string | null
          pre_auth_status?: string | null
          rejection_reason?: string | null
          resubmission_count?: number | null
          status?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          appeal_notes?: string | null
          approval_date?: string | null
          approved_amount?: number | null
          approved_by?: string | null
          attachments?: Json | null
          branch_id?: string | null
          claim_date?: string
          claim_number?: string
          copay_amount?: number | null
          created_at?: string | null
          created_by?: string | null
          deductible_amount?: number | null
          denial_reasons?: Json | null
          drg_code?: string | null
          icd_codes?: string[] | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          nphies_claim_id?: string | null
          nphies_response?: Json | null
          nphies_status?: string | null
          organization_id?: string
          paid_amount?: number | null
          patient_insurance_id?: string
          patient_responsibility?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          pre_auth_date?: string | null
          pre_auth_number?: string | null
          pre_auth_status?: string | null
          rejection_reason?: string | null
          resubmission_count?: number | null
          status?: string | null
          submission_date?: string | null
          submitted_by?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_patient_insurance_id_fkey"
            columns: ["patient_insurance_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_companies: {
        Row: {
          address: string | null
          cchi_payer_code: string | null
          city: string | null
          code: string | null
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          nphies_payer_id: string | null
          organization_id: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          cchi_payer_code?: string | null
          city?: string | null
          code?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          nphies_payer_id?: string | null
          organization_id: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          cchi_payer_code?: string | null
          city?: string | null
          code?: string | null
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          nphies_payer_id?: string | null
          organization_id?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_companies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_companies_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_plans: {
        Row: {
          annual_limit: number | null
          copay_amount: number | null
          copay_percentage: number | null
          coverage_percentage: number | null
          covered_services: Json | null
          created_at: string | null
          deductible_amount: number | null
          excluded_services: Json | null
          id: string
          insurance_company_id: string
          is_active: boolean | null
          max_coverage_amount: number | null
          name: string
          notes: string | null
          plan_code: string | null
          plan_type: string | null
          pre_auth_required: boolean | null
          updated_at: string | null
          waiting_period_days: number | null
        }
        Insert: {
          annual_limit?: number | null
          copay_amount?: number | null
          copay_percentage?: number | null
          coverage_percentage?: number | null
          covered_services?: Json | null
          created_at?: string | null
          deductible_amount?: number | null
          excluded_services?: Json | null
          id?: string
          insurance_company_id: string
          is_active?: boolean | null
          max_coverage_amount?: number | null
          name: string
          notes?: string | null
          plan_code?: string | null
          plan_type?: string | null
          pre_auth_required?: boolean | null
          updated_at?: string | null
          waiting_period_days?: number | null
        }
        Update: {
          annual_limit?: number | null
          copay_amount?: number | null
          copay_percentage?: number | null
          coverage_percentage?: number | null
          covered_services?: Json | null
          created_at?: string | null
          deductible_amount?: number | null
          excluded_services?: Json | null
          id?: string
          insurance_company_id?: string
          is_active?: boolean | null
          max_coverage_amount?: number | null
          name?: string
          notes?: string | null
          plan_code?: string | null
          plan_type?: string | null
          pre_auth_required?: boolean | null
          updated_at?: string | null
          waiting_period_days?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "insurance_plans_insurance_company_id_fkey"
            columns: ["insurance_company_id"]
            isOneToOne: false
            referencedRelation: "insurance_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      interviews: {
        Row: {
          application_id: string
          created_at: string | null
          duration_minutes: number | null
          feedback: string | null
          id: string
          interview_round: number | null
          interview_type: string | null
          interviewer_ids: string[] | null
          location: string | null
          meeting_link: string | null
          notes: string | null
          organization_id: string
          rating: number | null
          recommendation: string | null
          scheduled_at: string
          status: string | null
          strengths: string | null
          updated_at: string | null
          weaknesses: string | null
        }
        Insert: {
          application_id: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_round?: number | null
          interview_type?: string | null
          interviewer_ids?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id: string
          rating?: number | null
          recommendation?: string | null
          scheduled_at: string
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
          weaknesses?: string | null
        }
        Update: {
          application_id?: string
          created_at?: string | null
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          interview_round?: number | null
          interview_type?: string | null
          interviewer_ids?: string[] | null
          location?: string | null
          meeting_link?: string | null
          notes?: string | null
          organization_id?: string
          rating?: number | null
          recommendation?: string | null
          scheduled_at?: string
          status?: string | null
          strengths?: string | null
          updated_at?: string | null
          weaknesses?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "interviews_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "interviews_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      intra_op_notes: {
        Row: {
          approach: string | null
          blood_loss_ml: number | null
          catheters: Json | null
          closure_details: string | null
          closure_time: string | null
          completion_override_reason: string | null
          complications: string | null
          count_notes: string | null
          created_at: string | null
          documented_by: string
          drains: Json | null
          draping: string | null
          dressing_type: string | null
          id: string
          implants: Json | null
          incision_time: string | null
          incision_type: string | null
          instrument_count_correct: boolean | null
          intra_op_findings: string | null
          needle_count_correct: boolean | null
          op_images: Json | null
          pathology_findings: string | null
          position: string | null
          procedure_performed: string
          procedure_steps: Json | null
          skin_prep: string | null
          specimens: Json | null
          sponge_count_correct: boolean | null
          surgery_id: string
          updated_at: string | null
        }
        Insert: {
          approach?: string | null
          blood_loss_ml?: number | null
          catheters?: Json | null
          closure_details?: string | null
          closure_time?: string | null
          completion_override_reason?: string | null
          complications?: string | null
          count_notes?: string | null
          created_at?: string | null
          documented_by: string
          drains?: Json | null
          draping?: string | null
          dressing_type?: string | null
          id?: string
          implants?: Json | null
          incision_time?: string | null
          incision_type?: string | null
          instrument_count_correct?: boolean | null
          intra_op_findings?: string | null
          needle_count_correct?: boolean | null
          op_images?: Json | null
          pathology_findings?: string | null
          position?: string | null
          procedure_performed: string
          procedure_steps?: Json | null
          skin_prep?: string | null
          specimens?: Json | null
          sponge_count_correct?: boolean | null
          surgery_id: string
          updated_at?: string | null
        }
        Update: {
          approach?: string | null
          blood_loss_ml?: number | null
          catheters?: Json | null
          closure_details?: string | null
          closure_time?: string | null
          completion_override_reason?: string | null
          complications?: string | null
          count_notes?: string | null
          created_at?: string | null
          documented_by?: string
          drains?: Json | null
          draping?: string | null
          dressing_type?: string | null
          id?: string
          implants?: Json | null
          incision_time?: string | null
          incision_type?: string | null
          instrument_count_correct?: boolean | null
          intra_op_findings?: string | null
          needle_count_correct?: boolean | null
          op_images?: Json | null
          pathology_findings?: string | null
          position?: string | null
          procedure_performed?: string
          procedure_steps?: Json | null
          skin_prep?: string | null
          specimens?: Json | null
          sponge_count_correct?: boolean | null
          surgery_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "intra_op_notes_documented_by_fkey"
            columns: ["documented_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "intra_op_notes_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_bin_assignments: {
        Row: {
          assigned_at: string
          assigned_by: string | null
          bin_id: string
          id: string
          item_id: string | null
          medicine_id: string | null
          organization_id: string
          quantity: number
          stock_id: string | null
          store_id: string
        }
        Insert: {
          assigned_at?: string
          assigned_by?: string | null
          bin_id: string
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          organization_id: string
          quantity?: number
          stock_id?: string | null
          store_id: string
        }
        Update: {
          assigned_at?: string
          assigned_by?: string | null
          bin_id?: string
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          organization_id?: string
          quantity?: number
          stock_id?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_bin_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_bin_assignments_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_bin_assignments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_bin_assignments_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_bin_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_bin_assignments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          organization_id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          organization_id: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          organization_id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          barcode: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_consumable: boolean
          item_code: string
          minimum_stock: number
          name: string
          organization_id: string
          reorder_level: number
          sku: string | null
          standard_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_consumable?: boolean
          item_code: string
          minimum_stock?: number
          name: string
          organization_id: string
          reorder_level?: number
          sku?: string | null
          standard_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_consumable?: boolean
          item_code?: string
          minimum_stock?: number
          name?: string
          organization_id?: string
          reorder_level?: number
          sku?: string | null
          standard_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_stock: {
        Row: {
          batch_number: string | null
          branch_id: string
          created_at: string
          expiry_date: string | null
          grn_id: string | null
          id: string
          item_id: string
          location: string | null
          quantity: number
          received_date: string
          store_id: string | null
          unit_cost: number
          updated_at: string
          vendor_id: string | null
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          created_at?: string
          expiry_date?: string | null
          grn_id?: string | null
          id?: string
          item_id: string
          location?: string | null
          quantity?: number
          received_date?: string
          store_id?: string | null
          unit_cost?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          created_at?: string
          expiry_date?: string | null
          grn_id?: string | null
          id?: string
          item_id?: string
          location?: string | null
          quantity?: number
          received_date?: string
          store_id?: string | null
          unit_cost?: number
          updated_at?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_stock_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_stock_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          bed_id: string | null
          booking_end_date: string | null
          booking_start_date: string | null
          created_at: string
          description: string
          discount_percent: number | null
          doctor_id: string | null
          id: string
          invoice_id: string
          lab_order_id: string | null
          medicine_inventory_id: string | null
          quantity: number | null
          service_type_id: string | null
          total_price: number | null
          unit_price: number | null
        }
        Insert: {
          bed_id?: string | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          created_at?: string
          description: string
          discount_percent?: number | null
          doctor_id?: string | null
          id?: string
          invoice_id: string
          lab_order_id?: string | null
          medicine_inventory_id?: string | null
          quantity?: number | null
          service_type_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Update: {
          bed_id?: string | null
          booking_end_date?: string | null
          booking_start_date?: string | null
          created_at?: string
          description?: string
          discount_percent?: number | null
          doctor_id?: string | null
          id?: string
          invoice_id?: string
          lab_order_id?: string | null
          medicine_inventory_id?: string | null
          quantity?: number | null
          service_type_id?: string | null
          total_price?: number | null
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_bed_id_fkey"
            columns: ["bed_id"]
            isOneToOne: false
            referencedRelation: "beds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_lab_order_id_fkey"
            columns: ["lab_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
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
          balance_amount: number | null
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
          zatca_clearance_response: Json | null
          zatca_clearance_status: string | null
          zatca_icv: number | null
          zatca_invoice_hash: string | null
          zatca_invoice_type: string | null
          zatca_pih: string | null
          zatca_qr_code: string | null
          zatca_status: string | null
          zatca_uuid: string | null
          zatca_xml: string | null
        }
        Insert: {
          balance_amount?: number | null
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
          zatca_clearance_response?: Json | null
          zatca_clearance_status?: string | null
          zatca_icv?: number | null
          zatca_invoice_hash?: string | null
          zatca_invoice_type?: string | null
          zatca_pih?: string | null
          zatca_qr_code?: string | null
          zatca_status?: string | null
          zatca_uuid?: string | null
          zatca_xml?: string | null
        }
        Update: {
          balance_amount?: number | null
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
          zatca_clearance_response?: Json | null
          zatca_clearance_status?: string | null
          zatca_icv?: number | null
          zatca_invoice_hash?: string | null
          zatca_invoice_type?: string | null
          zatca_pih?: string | null
          zatca_qr_code?: string | null
          zatca_status?: string | null
          zatca_uuid?: string | null
          zatca_xml?: string | null
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
      ipd_bed_features: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_bed_features_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_bed_types: {
        Row: {
          code: string
          created_at: string | null
          daily_rate: number | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          service_type_id: string | null
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          service_type_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          daily_rate?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          service_type_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_bed_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_bed_types_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
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
          doctor_id: string | null
          id: string
          invoice_id: string | null
          is_billed: boolean | null
          quantity: number | null
          service_type_id: string | null
          surgery_id: string | null
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
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          quantity?: number | null
          service_type_id?: string | null
          surgery_id?: string | null
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
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          is_billed?: boolean | null
          quantity?: number | null
          service_type_id?: string | null
          surgery_id?: string | null
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
            foreignKeyName: "ipd_charges_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
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
          {
            foreignKeyName: "ipd_charges_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_daily_charge_logs: {
        Row: {
          charges_posted: number | null
          created_at: string | null
          error_details: Json | null
          errors: number | null
          id: string
          organization_id: string | null
          run_date: string
          skipped: number | null
          total_admissions: number | null
        }
        Insert: {
          charges_posted?: number | null
          created_at?: string | null
          error_details?: Json | null
          errors?: number | null
          id?: string
          organization_id?: string | null
          run_date: string
          skipped?: number | null
          total_admissions?: number | null
        }
        Update: {
          charges_posted?: number | null
          created_at?: string | null
          error_details?: Json | null
          errors?: number | null
          id?: string
          organization_id?: string | null
          run_date?: string
          skipped?: number | null
          total_admissions?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_daily_charge_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ipd_floors: {
        Row: {
          branch_id: string | null
          building: string
          created_at: string | null
          description: string | null
          floor_name: string
          floor_number: number | null
          id: string
          is_active: boolean | null
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          branch_id?: string | null
          building: string
          created_at?: string | null
          description?: string | null
          floor_name: string
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string | null
          building?: string
          created_at?: string | null
          description?: string | null
          floor_name?: string
          floor_number?: number | null
          id?: string
          is_active?: boolean | null
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_floors_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ipd_floors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      ipd_ward_types: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ipd_ward_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      item_vendor_mapping: {
        Row: {
          created_at: string | null
          id: string
          is_preferred: boolean | null
          item_id: string | null
          last_purchase_date: string | null
          last_purchase_price: number | null
          medicine_id: string | null
          notes: string | null
          organization_id: string
          updated_at: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id?: string | null
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          medicine_id?: string | null
          notes?: string | null
          organization_id: string
          updated_at?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_preferred?: boolean | null
          item_id?: string | null
          last_purchase_date?: string | null
          last_purchase_price?: number | null
          medicine_id?: string | null
          notes?: string | null
          organization_id?: string
          updated_at?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_vendor_mapping_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendor_mapping_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendor_mapping_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_vendor_mapping_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_name: string
          applied_at: string | null
          cnic: string | null
          cover_letter: string | null
          current_designation: string | null
          current_employer: string | null
          email: string
          expected_salary: number | null
          experience_years: number | null
          id: string
          job_opening_id: string
          notes: string | null
          notice_period_days: number | null
          organization_id: string
          phone: string | null
          referred_by: string | null
          rejection_reason: string | null
          resume_url: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          applicant_name: string
          applied_at?: string | null
          cnic?: string | null
          cover_letter?: string | null
          current_designation?: string | null
          current_employer?: string | null
          email: string
          expected_salary?: number | null
          experience_years?: number | null
          id?: string
          job_opening_id: string
          notes?: string | null
          notice_period_days?: number | null
          organization_id: string
          phone?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          applicant_name?: string
          applied_at?: string | null
          cnic?: string | null
          cover_letter?: string | null
          current_designation?: string | null
          current_employer?: string | null
          email?: string
          expected_salary?: number | null
          experience_years?: number | null
          id?: string
          job_opening_id?: string
          notes?: string | null
          notice_period_days?: number | null
          organization_id?: string
          phone?: string | null
          referred_by?: string | null
          rejection_reason?: string | null
          resume_url?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_opening_id_fkey"
            columns: ["job_opening_id"]
            isOneToOne: false
            referencedRelation: "job_openings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      job_openings: {
        Row: {
          benefits: string | null
          branch_id: string | null
          closes_at: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          designation_id: string | null
          employment_type: string | null
          experience_required: string | null
          id: string
          job_description: string | null
          organization_id: string
          positions_available: number | null
          published_at: string | null
          qualification_required: string | null
          requirements: string | null
          salary_range_max: number | null
          salary_range_min: number | null
          skills_required: string[] | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          branch_id?: string | null
          closes_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          designation_id?: string | null
          employment_type?: string | null
          experience_required?: string | null
          id?: string
          job_description?: string | null
          organization_id: string
          positions_available?: number | null
          published_at?: string | null
          qualification_required?: string | null
          requirements?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          skills_required?: string[] | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          branch_id?: string | null
          closes_at?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          designation_id?: string | null
          employment_type?: string | null
          experience_required?: string | null
          id?: string
          job_description?: string | null
          organization_id?: string
          positions_available?: number | null
          published_at?: string | null
          qualification_required?: string | null
          requirements?: string | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          skills_required?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_openings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_openings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_openings_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_openings_designation_id_fkey"
            columns: ["designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_openings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          entry_date: string
          entry_number: string
          fiscal_year_id: string | null
          id: string
          is_posted: boolean
          is_reversed: boolean
          notes: string | null
          organization_id: string
          posted_at: string | null
          posted_by: string | null
          reference_id: string | null
          reference_type: string | null
          reversal_entry_id: string | null
          reversed_at: string | null
          reversed_by: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date: string
          entry_number: string
          fiscal_year_id?: string | null
          id?: string
          is_posted?: boolean
          is_reversed?: boolean
          notes?: string | null
          organization_id: string
          posted_at?: string | null
          posted_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reversal_entry_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          entry_date?: string
          entry_number?: string
          fiscal_year_id?: string | null
          id?: string
          is_posted?: boolean
          is_reversed?: boolean
          notes?: string | null
          organization_id?: string
          posted_at?: string | null
          posted_by?: string | null
          reference_id?: string | null
          reference_type?: string | null
          reversal_entry_id?: string | null
          reversed_at?: string | null
          reversed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_fiscal_year_id_fkey"
            columns: ["fiscal_year_id"]
            isOneToOne: false
            referencedRelation: "fiscal_years"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_posted_by_fkey"
            columns: ["posted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reversal_entry_id_fkey"
            columns: ["reversal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entries_reversed_by_fkey"
            columns: ["reversed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entry_lines: {
        Row: {
          account_id: string
          created_at: string
          credit_amount: number
          debit_amount: number
          description: string | null
          id: string
          journal_entry_id: string
        }
        Insert: {
          account_id: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id: string
        }
        Update: {
          account_id?: string
          created_at?: string
          credit_amount?: number
          debit_amount?: number
          description?: string | null
          id?: string
          journal_entry_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entry_lines_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_entry_lines_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_configs: {
        Row: {
          auto_print: boolean | null
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          departments: Json | null
          display_message: string | null
          id: string
          is_active: boolean | null
          kiosk_password_hash: string | null
          kiosk_type: string
          kiosk_username: string | null
          last_login_at: string | null
          last_login_ip: string | null
          linked_display_id: string | null
          name: string
          organization_id: string
          session_timeout_minutes: number | null
          show_estimated_wait: boolean | null
          updated_at: string | null
        }
        Insert: {
          auto_print?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          departments?: Json | null
          display_message?: string | null
          id?: string
          is_active?: boolean | null
          kiosk_password_hash?: string | null
          kiosk_type?: string
          kiosk_username?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          linked_display_id?: string | null
          name: string
          organization_id: string
          session_timeout_minutes?: number | null
          show_estimated_wait?: boolean | null
          updated_at?: string | null
        }
        Update: {
          auto_print?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          departments?: Json | null
          display_message?: string | null
          id?: string
          is_active?: boolean | null
          kiosk_password_hash?: string | null
          kiosk_type?: string
          kiosk_username?: string | null
          last_login_at?: string | null
          last_login_ip?: string | null
          linked_display_id?: string | null
          name?: string
          organization_id?: string
          session_timeout_minutes?: number | null
          show_estimated_wait?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_configs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_configs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_configs_linked_display_id_fkey"
            columns: ["linked_display_id"]
            isOneToOne: false
            referencedRelation: "queue_display_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_sessions: {
        Row: {
          created_at: string | null
          device_info: Json | null
          ended_at: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          kiosk_id: string
          last_activity_at: string | null
          organization_id: string
          session_token: string
          started_at: string
          tokens_generated: number | null
        }
        Insert: {
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          kiosk_id: string
          last_activity_at?: string | null
          organization_id: string
          session_token: string
          started_at?: string
          tokens_generated?: number | null
        }
        Update: {
          created_at?: string | null
          device_info?: Json | null
          ended_at?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          kiosk_id?: string
          last_activity_at?: string | null
          organization_id?: string
          session_token?: string
          started_at?: string
          tokens_generated?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_sessions_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      kiosk_token_logs: {
        Row: {
          appointment_id: string | null
          department: string | null
          doctor_name: string | null
          generated_at: string
          id: string
          kiosk_id: string
          organization_id: string
          patient_name: string | null
          patient_phone: string | null
          print_count: number | null
          printed: boolean | null
          priority: number | null
          session_id: string | null
          status: string | null
          token_number: number
        }
        Insert: {
          appointment_id?: string | null
          department?: string | null
          doctor_name?: string | null
          generated_at?: string
          id?: string
          kiosk_id: string
          organization_id: string
          patient_name?: string | null
          patient_phone?: string | null
          print_count?: number | null
          printed?: boolean | null
          priority?: number | null
          session_id?: string | null
          status?: string | null
          token_number: number
        }
        Update: {
          appointment_id?: string | null
          department?: string | null
          doctor_name?: string | null
          generated_at?: string
          id?: string
          kiosk_id?: string
          organization_id?: string
          patient_name?: string | null
          patient_phone?: string | null
          print_count?: number | null
          printed?: boolean | null
          priority?: number | null
          session_id?: string | null
          status?: string | null
          token_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "kiosk_token_logs_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_token_logs_kiosk_id_fkey"
            columns: ["kiosk_id"]
            isOneToOne: false
            referencedRelation: "kiosk_configs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_token_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kiosk_token_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "kiosk_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_analyzer_catalog: {
        Row: {
          analyzer_type: string
          connection_protocol: string
          created_at: string | null
          default_port: number | null
          hl7_version: string | null
          id: string
          is_active: boolean | null
          manufacturer: string
          message_format: string | null
          model: string
          notes: string | null
          result_segment: string | null
        }
        Insert: {
          analyzer_type: string
          connection_protocol?: string
          created_at?: string | null
          default_port?: number | null
          hl7_version?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer: string
          message_format?: string | null
          model: string
          notes?: string | null
          result_segment?: string | null
        }
        Update: {
          analyzer_type?: string
          connection_protocol?: string
          created_at?: string | null
          default_port?: number | null
          hl7_version?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string
          message_format?: string | null
          model?: string
          notes?: string | null
          result_segment?: string | null
        }
        Relationships: []
      }
      lab_analyzer_test_mappings: {
        Row: {
          analyzer_id: string
          analyzer_test_code: string
          analyzer_test_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          lab_test_template_id: string
        }
        Insert: {
          analyzer_id: string
          analyzer_test_code: string
          analyzer_test_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lab_test_template_id: string
        }
        Update: {
          analyzer_id?: string
          analyzer_test_code?: string
          analyzer_test_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          lab_test_template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_analyzer_test_mappings_analyzer_id_fkey"
            columns: ["analyzer_id"]
            isOneToOne: false
            referencedRelation: "lab_analyzers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_analyzer_test_mappings_lab_test_template_id_fkey"
            columns: ["lab_test_template_id"]
            isOneToOne: false
            referencedRelation: "lab_test_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_analyzers: {
        Row: {
          analyzer_type: string
          branch_id: string | null
          catalog_id: string | null
          connection_status: string | null
          connection_type: string | null
          created_at: string | null
          hl7_version: string | null
          id: string
          ip_address: string | null
          is_active: boolean | null
          last_sync_at: string | null
          location: string | null
          manufacturer: string | null
          message_format: string | null
          model: string | null
          name: string
          organization_id: string
          port: number | null
          serial_number: string | null
          updated_at: string | null
        }
        Insert: {
          analyzer_type: string
          branch_id?: string | null
          catalog_id?: string | null
          connection_status?: string | null
          connection_type?: string | null
          created_at?: string | null
          hl7_version?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          manufacturer?: string | null
          message_format?: string | null
          model?: string | null
          name: string
          organization_id: string
          port?: number | null
          serial_number?: string | null
          updated_at?: string | null
        }
        Update: {
          analyzer_type?: string
          branch_id?: string | null
          catalog_id?: string | null
          connection_status?: string | null
          connection_type?: string | null
          created_at?: string | null
          hl7_version?: string | null
          id?: string
          ip_address?: string | null
          is_active?: boolean | null
          last_sync_at?: string | null
          location?: string | null
          manufacturer?: string | null
          message_format?: string | null
          model?: string | null
          name?: string
          organization_id?: string
          port?: number | null
          serial_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_analyzers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_analyzers_catalog_id_fkey"
            columns: ["catalog_id"]
            isOneToOne: false
            referencedRelation: "lab_analyzer_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_analyzers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          access_code: string | null
          branch_id: string
          clinical_notes: string | null
          completed_at: string | null
          consultation_id: string | null
          created_at: string
          doctor_id: string | null
          id: string
          invoice_id: string | null
          is_published: boolean | null
          notification_sent_at: string | null
          order_number: string
          ordered_by: string | null
          patient_id: string
          patient_notified: boolean | null
          payment_status: string | null
          priority: Database["public"]["Enums"]["lab_order_priority"]
          published_at: string | null
          result_notes: string | null
          sample_number: string | null
          status: Database["public"]["Enums"]["lab_order_status"]
          surgery_id: string | null
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          branch_id: string
          clinical_notes?: string | null
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          is_published?: boolean | null
          notification_sent_at?: string | null
          order_number: string
          ordered_by?: string | null
          patient_id: string
          patient_notified?: boolean | null
          payment_status?: string | null
          priority?: Database["public"]["Enums"]["lab_order_priority"]
          published_at?: string | null
          result_notes?: string | null
          sample_number?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          surgery_id?: string | null
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          branch_id?: string
          clinical_notes?: string | null
          completed_at?: string | null
          consultation_id?: string | null
          created_at?: string
          doctor_id?: string | null
          id?: string
          invoice_id?: string | null
          is_published?: boolean | null
          notification_sent_at?: string | null
          order_number?: string
          ordered_by?: string | null
          patient_id?: string
          patient_notified?: boolean | null
          payment_status?: string | null
          priority?: Database["public"]["Enums"]["lab_order_priority"]
          published_at?: string | null
          result_notes?: string | null
          sample_number?: string | null
          status?: Database["public"]["Enums"]["lab_order_status"]
          surgery_id?: string | null
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
            foreignKeyName: "lab_orders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_orders_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_result_imports: {
        Row: {
          analyzer_id: string | null
          created_at: string | null
          error_message: string | null
          id: string
          matched_order_id: string | null
          matched_patient_id: string | null
          message_type: string
          organization_id: string
          parsed_data: Json | null
          patient_id_from_message: string | null
          processed_at: string | null
          raw_message: string
          status: string
        }
        Insert: {
          analyzer_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          matched_order_id?: string | null
          matched_patient_id?: string | null
          message_type: string
          organization_id: string
          parsed_data?: Json | null
          patient_id_from_message?: string | null
          processed_at?: string | null
          raw_message: string
          status?: string
        }
        Update: {
          analyzer_id?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          matched_order_id?: string | null
          matched_patient_id?: string | null
          message_type?: string
          organization_id?: string
          parsed_data?: Json | null
          patient_id_from_message?: string | null
          processed_at?: string | null
          raw_message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_result_imports_analyzer_id_fkey"
            columns: ["analyzer_id"]
            isOneToOne: false
            referencedRelation: "lab_analyzers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_result_imports_matched_order_id_fkey"
            columns: ["matched_order_id"]
            isOneToOne: false
            referencedRelation: "lab_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_result_imports_matched_patient_id_fkey"
            columns: ["matched_patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_result_imports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_settings: {
        Row: {
          allow_direct_lab_payment: boolean | null
          allow_unpaid_processing: boolean | null
          auto_generate_invoice: boolean | null
          branch_id: string | null
          created_at: string | null
          id: string
          lab_payment_location: string | null
          organization_id: string
          require_consultation_for_lab: boolean | null
          updated_at: string | null
        }
        Insert: {
          allow_direct_lab_payment?: boolean | null
          allow_unpaid_processing?: boolean | null
          auto_generate_invoice?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          lab_payment_location?: string | null
          organization_id: string
          require_consultation_for_lab?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allow_direct_lab_payment?: boolean | null
          allow_unpaid_processing?: boolean | null
          auto_generate_invoice?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          id?: string
          lab_payment_location?: string | null
          organization_id?: string
          require_consultation_for_lab?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lab_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_test_categories: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_test_panels: {
        Row: {
          code: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          price: number | null
          tests: Json | null
          updated_at: string | null
        }
        Insert: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          price?: number | null
          tests?: Json | null
          updated_at?: string | null
        }
        Update: {
          code?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          price?: number | null
          tests?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lab_test_panels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          price: number | null
          service_type_id: string | null
          test_category: string
          test_name: string
        }
        Insert: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          price?: number | null
          service_type_id?: string | null
          test_category?: string
          test_name: string
        }
        Update: {
          created_at?: string
          fields?: Json
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          price?: number | null
          service_type_id?: string | null
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
          {
            foreignKeyName: "lab_test_templates_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
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
      maintenance_records: {
        Row: {
          asset_id: string
          completed_date: string | null
          cost: number | null
          created_at: string
          description: string | null
          id: string
          maintenance_type: string
          notes: string | null
          organization_id: string
          scheduled_date: string | null
          status: string
          technician_name: string | null
        }
        Insert: {
          asset_id: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          organization_id: string
          scheduled_date?: string | null
          status?: string
          technician_name?: string | null
        }
        Update: {
          asset_id?: string
          completed_date?: string | null
          cost?: number | null
          created_at?: string
          description?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          organization_id?: string
          scheduled_date?: string | null
          status?: string
          technician_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_certificates: {
        Row: {
          branch_id: string | null
          certificate_number: string | null
          certificate_type: string
          created_at: string | null
          diagnosis: string | null
          disability_percentage: number | null
          disability_type: string | null
          employer_name: string | null
          findings: string | null
          fitness_status: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          job_type: string | null
          last_printed_at: string | null
          leave_days: number | null
          leave_from: string | null
          leave_to: string | null
          notes: string | null
          organization_id: string
          patient_id: string
          print_count: number | null
          purpose: string | null
          recommendations: string | null
          restrictions: string | null
          updated_at: string | null
          valid_from: string | null
          valid_to: string | null
        }
        Insert: {
          branch_id?: string | null
          certificate_number?: string | null
          certificate_type: string
          created_at?: string | null
          diagnosis?: string | null
          disability_percentage?: number | null
          disability_type?: string | null
          employer_name?: string | null
          findings?: string | null
          fitness_status?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          job_type?: string | null
          last_printed_at?: string | null
          leave_days?: number | null
          leave_from?: string | null
          leave_to?: string | null
          notes?: string | null
          organization_id: string
          patient_id: string
          print_count?: number | null
          purpose?: string | null
          recommendations?: string | null
          restrictions?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Update: {
          branch_id?: string | null
          certificate_number?: string | null
          certificate_type?: string
          created_at?: string | null
          diagnosis?: string | null
          disability_percentage?: number | null
          disability_type?: string | null
          employer_name?: string | null
          findings?: string | null
          fitness_status?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          job_type?: string | null
          last_printed_at?: string | null
          leave_days?: number | null
          leave_from?: string | null
          leave_to?: string | null
          notes?: string | null
          organization_id?: string
          patient_id?: string
          print_count?: number | null
          purpose?: string | null
          recommendations?: string | null
          restrictions?: string | null
          updated_at?: string | null
          valid_from?: string | null
          valid_to?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_certificates_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_certificates_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_certificates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_certificates_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_codes: {
        Row: {
          category: string | null
          code: string
          code_type: Database["public"]["Enums"]["medical_code_type"]
          created_at: string
          description: string
          description_ar: string | null
          id: string
          is_active: boolean
          organization_id: string | null
        }
        Insert: {
          category?: string | null
          code: string
          code_type: Database["public"]["Enums"]["medical_code_type"]
          created_at?: string
          description: string
          description_ar?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          code_type?: Database["public"]["Enums"]["medical_code_type"]
          created_at?: string
          description?: string
          description_ar?: string | null
          id?: string
          is_active?: boolean
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_codes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_fitness_records: {
        Row: {
          conditions_noted: string | null
          created_at: string | null
          created_by: string | null
          employee_id: string
          examination_date: string
          examination_type: string | null
          examiner_facility: string | null
          examiner_name: string | null
          fitness_status: string
          id: string
          next_examination_date: string | null
          organization_id: string
          recommendations: string | null
          report_url: string | null
          restrictions: string | null
        }
        Insert: {
          conditions_noted?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id: string
          examination_date: string
          examination_type?: string | null
          examiner_facility?: string | null
          examiner_name?: string | null
          fitness_status: string
          id?: string
          next_examination_date?: string | null
          organization_id: string
          recommendations?: string | null
          report_url?: string | null
          restrictions?: string | null
        }
        Update: {
          conditions_noted?: string | null
          created_at?: string | null
          created_by?: string | null
          employee_id?: string
          examination_date?: string
          examination_type?: string | null
          examiner_facility?: string | null
          examiner_name?: string | null
          fitness_status?: string
          id?: string
          next_examination_date?: string | null
          organization_id?: string
          recommendations?: string | null
          report_url?: string | null
          restrictions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_fitness_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_fitness_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_fitness_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_knowledge: {
        Row: {
          category: string
          condition: string
          content: string
          created_at: string
          id: string
          is_active: boolean
          keywords: string[]
          language: string
          organization_id: string | null
          priority: number
          source: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          condition: string
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          language?: string
          organization_id?: string | null
          priority?: number
          source?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          condition?: string
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          keywords?: string[]
          language?: string
          organization_id?: string | null
          priority?: number
          source?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_knowledge_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          store_id: string | null
          supplier_name: string | null
          unit_price: number | null
          updated_at: string
          vendor_id: string | null
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
          store_id?: string | null
          supplier_name?: string | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
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
          store_id?: string | null
          supplier_name?: string | null
          unit_price?: number | null
          updated_at?: string
          vendor_id?: string | null
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
          {
            foreignKeyName: "medicine_inventory_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_inventory_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      medicine_rack_assignments: {
        Row: {
          created_at: string
          id: string
          medicine_id: string
          notes: string | null
          organization_id: string
          position: string | null
          rack_id: string
          shelf_number: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          medicine_id: string
          notes?: string | null
          organization_id: string
          position?: string | null
          rack_id: string
          shelf_number?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          medicine_id?: string
          notes?: string | null
          organization_id?: string
          position?: string | null
          rack_id?: string
          shelf_number?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicine_rack_assignments_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_rack_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_rack_assignments_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "store_racks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medicine_rack_assignments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
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
      mlc_records: {
        Row: {
          age_of_injuries: string | null
          alcohol_intoxication: boolean | null
          arrival_time: string | null
          branch_id: string | null
          brought_by: string | null
          brought_by_cnic: string | null
          brought_by_name: string | null
          brought_by_phone: string | null
          brought_by_relation: string | null
          case_type: string | null
          clothing_description: string | null
          clothing_preserved: boolean | null
          conscious_level: string | null
          created_at: string | null
          created_by: string | null
          dd_number: string | null
          disposition: string | null
          drug_intoxication: boolean | null
          emergency_registration_id: string | null
          evidence_handed_at: string | null
          evidence_handed_to: string | null
          evidence_receipt_number: string | null
          evidence_receiver_designation: string | null
          evidence_receiver_name: string | null
          examined_by: string | null
          fir_date: string | null
          fir_number: string | null
          general_condition: string | null
          id: string
          incident_date: string | null
          incident_description: string | null
          incident_place: string | null
          incident_time: string | null
          injuries_description: string | null
          injury_details: Json | null
          medical_opinion: string | null
          mlc_number: string
          nature_of_injuries: string | null
          notes: string | null
          organization_id: string
          oriented: boolean | null
          patient_id: string
          photograph_count: number | null
          photographs_taken: boolean | null
          police_officer_name: string | null
          police_officer_rank: string | null
          police_station: string | null
          probable_cause: string | null
          probable_weapon: string | null
          referred_to: string | null
          samples_collected: Json | null
          treatment_given: string | null
          updated_at: string | null
        }
        Insert: {
          age_of_injuries?: string | null
          alcohol_intoxication?: boolean | null
          arrival_time?: string | null
          branch_id?: string | null
          brought_by?: string | null
          brought_by_cnic?: string | null
          brought_by_name?: string | null
          brought_by_phone?: string | null
          brought_by_relation?: string | null
          case_type?: string | null
          clothing_description?: string | null
          clothing_preserved?: boolean | null
          conscious_level?: string | null
          created_at?: string | null
          created_by?: string | null
          dd_number?: string | null
          disposition?: string | null
          drug_intoxication?: boolean | null
          emergency_registration_id?: string | null
          evidence_handed_at?: string | null
          evidence_handed_to?: string | null
          evidence_receipt_number?: string | null
          evidence_receiver_designation?: string | null
          evidence_receiver_name?: string | null
          examined_by?: string | null
          fir_date?: string | null
          fir_number?: string | null
          general_condition?: string | null
          id?: string
          incident_date?: string | null
          incident_description?: string | null
          incident_place?: string | null
          incident_time?: string | null
          injuries_description?: string | null
          injury_details?: Json | null
          medical_opinion?: string | null
          mlc_number: string
          nature_of_injuries?: string | null
          notes?: string | null
          organization_id: string
          oriented?: boolean | null
          patient_id: string
          photograph_count?: number | null
          photographs_taken?: boolean | null
          police_officer_name?: string | null
          police_officer_rank?: string | null
          police_station?: string | null
          probable_cause?: string | null
          probable_weapon?: string | null
          referred_to?: string | null
          samples_collected?: Json | null
          treatment_given?: string | null
          updated_at?: string | null
        }
        Update: {
          age_of_injuries?: string | null
          alcohol_intoxication?: boolean | null
          arrival_time?: string | null
          branch_id?: string | null
          brought_by?: string | null
          brought_by_cnic?: string | null
          brought_by_name?: string | null
          brought_by_phone?: string | null
          brought_by_relation?: string | null
          case_type?: string | null
          clothing_description?: string | null
          clothing_preserved?: boolean | null
          conscious_level?: string | null
          created_at?: string | null
          created_by?: string | null
          dd_number?: string | null
          disposition?: string | null
          drug_intoxication?: boolean | null
          emergency_registration_id?: string | null
          evidence_handed_at?: string | null
          evidence_handed_to?: string | null
          evidence_receipt_number?: string | null
          evidence_receiver_designation?: string | null
          evidence_receiver_name?: string | null
          examined_by?: string | null
          fir_date?: string | null
          fir_number?: string | null
          general_condition?: string | null
          id?: string
          incident_date?: string | null
          incident_description?: string | null
          incident_place?: string | null
          incident_time?: string | null
          injuries_description?: string | null
          injury_details?: Json | null
          medical_opinion?: string | null
          mlc_number?: string
          nature_of_injuries?: string | null
          notes?: string | null
          organization_id?: string
          oriented?: boolean | null
          patient_id?: string
          photograph_count?: number | null
          photographs_taken?: boolean | null
          police_officer_name?: string | null
          police_officer_rank?: string | null
          police_station?: string | null
          probable_cause?: string | null
          probable_weapon?: string | null
          referred_to?: string | null
          samples_collected?: Json | null
          treatment_given?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mlc_records_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_records_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_records_emergency_registration_id_fkey"
            columns: ["emergency_registration_id"]
            isOneToOne: false
            referencedRelation: "emergency_registrations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_records_examined_by_fkey"
            columns: ["examined_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
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
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          enabled: boolean | null
          id: string
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
          vibration_enabled: boolean | null
        }
        Insert: {
          category: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          vibration_enabled?: boolean | null
        }
        Update: {
          category?: string
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          vibration_enabled?: boolean | null
        }
        Relationships: []
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
      nphies_eligibility_logs: {
        Row: {
          benefits: Json | null
          checked_at: string | null
          checked_by: string | null
          copay: number | null
          coverage_end: string | null
          coverage_start: string | null
          created_at: string | null
          deductible: number | null
          eligible: boolean | null
          id: string
          organization_id: string | null
          patient_id: string | null
          patient_insurance_id: string | null
          plan_name: string | null
          raw_response: Json | null
          status: string | null
        }
        Insert: {
          benefits?: Json | null
          checked_at?: string | null
          checked_by?: string | null
          copay?: number | null
          coverage_end?: string | null
          coverage_start?: string | null
          created_at?: string | null
          deductible?: number | null
          eligible?: boolean | null
          id?: string
          organization_id?: string | null
          patient_id?: string | null
          patient_insurance_id?: string | null
          plan_name?: string | null
          raw_response?: Json | null
          status?: string | null
        }
        Update: {
          benefits?: Json | null
          checked_at?: string | null
          checked_by?: string | null
          copay?: number | null
          coverage_end?: string | null
          coverage_start?: string | null
          created_at?: string | null
          deductible?: number | null
          eligible?: boolean | null
          id?: string
          organization_id?: string | null
          patient_id?: string | null
          patient_insurance_id?: string | null
          plan_name?: string | null
          raw_response?: Json | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nphies_eligibility_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nphies_eligibility_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nphies_eligibility_logs_patient_insurance_id_fkey"
            columns: ["patient_insurance_id"]
            isOneToOne: false
            referencedRelation: "patient_insurance"
            referencedColumns: ["id"]
          },
        ]
      }
      nphies_transaction_logs: {
        Row: {
          action: string
          claim_id: string | null
          created_at: string
          error_message: string | null
          id: string
          organization_id: string
          patient_id: string | null
          request_payload: Json | null
          response_payload: Json | null
          response_status: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          claim_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id: string
          patient_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          response_status?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          claim_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          organization_id?: string
          patient_id?: string | null
          request_payload?: Json | null
          response_payload?: Json | null
          response_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nphies_transaction_logs_claim_id_fkey"
            columns: ["claim_id"]
            isOneToOne: false
            referencedRelation: "insurance_claims"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nphies_transaction_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nphies_transaction_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nphies_transaction_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      offer_letters: {
        Row: {
          accepted_at: string | null
          application_id: string
          benefits: string | null
          created_at: string | null
          created_by: string | null
          document_url: string | null
          id: string
          joining_date: string | null
          offer_date: string | null
          offered_department_id: string | null
          offered_designation_id: string | null
          offered_salary: number
          organization_id: string
          probation_months: number | null
          rejected_reason: string | null
          status: string | null
          terms_conditions: string | null
          valid_until: string | null
        }
        Insert: {
          accepted_at?: string | null
          application_id: string
          benefits?: string | null
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          joining_date?: string | null
          offer_date?: string | null
          offered_department_id?: string | null
          offered_designation_id?: string | null
          offered_salary: number
          organization_id: string
          probation_months?: number | null
          rejected_reason?: string | null
          status?: string | null
          terms_conditions?: string | null
          valid_until?: string | null
        }
        Update: {
          accepted_at?: string | null
          application_id?: string
          benefits?: string | null
          created_at?: string | null
          created_by?: string | null
          document_url?: string | null
          id?: string
          joining_date?: string | null
          offer_date?: string | null
          offered_department_id?: string | null
          offered_designation_id?: string | null
          offered_salary?: number
          organization_id?: string
          probation_months?: number | null
          rejected_reason?: string | null
          status?: string | null
          terms_conditions?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offer_letters_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_offered_department_id_fkey"
            columns: ["offered_department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_offered_designation_id_fkey"
            columns: ["offered_designation_id"]
            isOneToOne: false
            referencedRelation: "designations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offer_letters_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      on_call_schedules: {
        Row: {
          branch_id: string | null
          created_at: string | null
          created_by: string | null
          department_id: string | null
          employee_id: string
          end_time: string
          id: string
          notes: string | null
          on_call_type: string | null
          organization_id: string
          schedule_date: string
          start_time: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          employee_id: string
          end_time: string
          id?: string
          notes?: string | null
          on_call_type?: string | null
          organization_id: string
          schedule_date: string
          start_time: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          created_by?: string | null
          department_id?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          on_call_type?: string | null
          organization_id?: string
          schedule_date?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "on_call_schedules_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "on_call_schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_template_items: {
        Row: {
          description: string | null
          due_days_from_joining: number | null
          id: string
          is_mandatory: boolean | null
          item_name: string
          responsible_department: string | null
          sort_order: number | null
          template_id: string
        }
        Insert: {
          description?: string | null
          due_days_from_joining?: number | null
          id?: string
          is_mandatory?: boolean | null
          item_name: string
          responsible_department?: string | null
          sort_order?: number | null
          template_id: string
        }
        Update: {
          description?: string | null
          due_days_from_joining?: number | null
          id?: string
          is_mandatory?: boolean | null
          item_name?: string
          responsible_department?: string | null
          sort_order?: number | null
          template_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_template_items_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "onboarding_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_templates: {
        Row: {
          applies_to_categories: string[] | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
        }
        Insert: {
          applies_to_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
        }
        Update: {
          applies_to_categories?: string[] | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      opd_department_specializations: {
        Row: {
          created_at: string | null
          id: string
          opd_department_id: string
          specialization_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          opd_department_id: string
          specialization_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          opd_department_id?: string
          specialization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opd_department_specializations_opd_department_id_fkey"
            columns: ["opd_department_id"]
            isOneToOne: false
            referencedRelation: "opd_departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_department_specializations_specialization_id_fkey"
            columns: ["specialization_id"]
            isOneToOne: false
            referencedRelation: "specializations"
            referencedColumns: ["id"]
          },
        ]
      }
      opd_departments: {
        Row: {
          branch_id: string
          code: string
          color: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          head_doctor_id: string | null
          id: string
          is_active: boolean | null
          location: string | null
          name: string
          organization_id: string
          rooms: string | null
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          code: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          head_doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name: string
          organization_id: string
          rooms?: string | null
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          code?: string
          color?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          head_doctor_id?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          name?: string
          organization_id?: string
          rooms?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opd_departments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_departments_head_doctor_id_fkey"
            columns: ["head_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opd_departments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
          billing_workflow: string | null
          city: string | null
          country: string | null
          country_code: string | null
          created_at: string
          currency_code: string | null
          currency_locale: string | null
          currency_symbol: string | null
          date_format: string | null
          default_language: string | null
          default_tax_rate: number | null
          e_invoicing_enabled: boolean | null
          e_invoicing_provider: string | null
          email: string | null
          facility_type: string | null
          fiscal_year_start: string | null
          id: string
          logo_url: string | null
          name: string
          name_ar: string | null
          national_id_format: string | null
          national_id_label: string | null
          phone: string | null
          phone_country_code: string | null
          receipt_footer: string | null
          receipt_header: string | null
          slug: string
          subscription_plan:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          supported_languages: string[] | null
          tax_label: string | null
          tax_number: string | null
          tax_registration_label: string | null
          trial_ends_at: string | null
          updated_at: string
          wasfaty_api_key_encrypted: string | null
          wasfaty_enabled: boolean | null
          wasfaty_facility_id: string | null
          website: string | null
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          address?: string | null
          billing_workflow?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency_code?: string | null
          currency_locale?: string | null
          currency_symbol?: string | null
          date_format?: string | null
          default_language?: string | null
          default_tax_rate?: number | null
          e_invoicing_enabled?: boolean | null
          e_invoicing_provider?: string | null
          email?: string | null
          facility_type?: string | null
          fiscal_year_start?: string | null
          id?: string
          logo_url?: string | null
          name: string
          name_ar?: string | null
          national_id_format?: string | null
          national_id_label?: string | null
          phone?: string | null
          phone_country_code?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
          slug: string
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          supported_languages?: string[] | null
          tax_label?: string | null
          tax_number?: string | null
          tax_registration_label?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          wasfaty_api_key_encrypted?: string | null
          wasfaty_enabled?: boolean | null
          wasfaty_facility_id?: string | null
          website?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          address?: string | null
          billing_workflow?: string | null
          city?: string | null
          country?: string | null
          country_code?: string | null
          created_at?: string
          currency_code?: string | null
          currency_locale?: string | null
          currency_symbol?: string | null
          date_format?: string | null
          default_language?: string | null
          default_tax_rate?: number | null
          e_invoicing_enabled?: boolean | null
          e_invoicing_provider?: string | null
          email?: string | null
          facility_type?: string | null
          fiscal_year_start?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          name_ar?: string | null
          national_id_format?: string | null
          national_id_label?: string | null
          phone?: string | null
          phone_country_code?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
          slug?: string
          subscription_plan?:
            | Database["public"]["Enums"]["subscription_plan"]
            | null
          subscription_status?:
            | Database["public"]["Enums"]["subscription_status"]
            | null
          supported_languages?: string[] | null
          tax_label?: string | null
          tax_number?: string | null
          tax_registration_label?: string | null
          trial_ends_at?: string | null
          updated_at?: string
          wasfaty_api_key_encrypted?: string | null
          wasfaty_enabled?: boolean | null
          wasfaty_facility_id?: string | null
          website?: string | null
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Relationships: []
      }
      ot_rooms: {
        Row: {
          branch_id: string
          capacity: number | null
          created_at: string | null
          equipment: Json | null
          features: Json | null
          floor: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string
          room_number: string
          room_type: string | null
          status: Database["public"]["Enums"]["ot_room_status"]
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          capacity?: number | null
          created_at?: string | null
          equipment?: Json | null
          features?: Json | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
          room_number: string
          room_type?: string | null
          status?: Database["public"]["Enums"]["ot_room_status"]
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          capacity?: number | null
          created_at?: string | null
          equipment?: Json | null
          features?: Json | null
          floor?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
          room_number?: string
          room_type?: string | null
          status?: Database["public"]["Enums"]["ot_room_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ot_rooms_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ot_rooms_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      overtime_records: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          duty_type: string | null
          employee_id: string
          hourly_rate: number | null
          id: string
          notes: string | null
          organization_id: string
          overtime_hours: number
          regular_hours: number | null
          status: string | null
          total_amount: number | null
          work_date: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          duty_type?: string | null
          employee_id: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          overtime_hours: number
          regular_hours?: number | null
          status?: string | null
          total_amount?: number | null
          work_date: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          duty_type?: string | null
          employee_id?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          overtime_hours?: number
          regular_hours?: number | null
          status?: string | null
          total_amount?: number | null
          work_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "overtime_records_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "overtime_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_slip_items: {
        Row: {
          batch_number: string | null
          box_number: number | null
          id: string
          item_id: string | null
          medicine_id: string | null
          notes: string | null
          packing_slip_id: string
          quantity: number
        }
        Insert: {
          batch_number?: string | null
          box_number?: number | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          packing_slip_id: string
          quantity?: number
        }
        Update: {
          batch_number?: string | null
          box_number?: number | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          packing_slip_id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "packing_slip_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slip_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slip_items_packing_slip_id_fkey"
            columns: ["packing_slip_id"]
            isOneToOne: false
            referencedRelation: "packing_slips"
            referencedColumns: ["id"]
          },
        ]
      }
      packing_slips: {
        Row: {
          box_count: number
          created_at: string
          id: string
          notes: string | null
          organization_id: string
          packed_at: string | null
          packed_by: string | null
          packing_slip_number: string
          pick_list_id: string | null
          source_id: string | null
          source_type: string | null
          status: string
          store_id: string
          total_items: number
          total_weight: number | null
          updated_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          box_count?: number
          created_at?: string
          id?: string
          notes?: string | null
          organization_id: string
          packed_at?: string | null
          packed_by?: string | null
          packing_slip_number?: string
          pick_list_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          store_id: string
          total_items?: number
          total_weight?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          box_count?: number
          created_at?: string
          id?: string
          notes?: string | null
          organization_id?: string
          packed_at?: string | null
          packed_by?: string | null
          packing_slip_number?: string
          pick_list_id?: string | null
          source_id?: string | null
          source_type?: string | null
          status?: string
          store_id?: string
          total_items?: number
          total_weight?: number | null
          updated_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "packing_slips_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slips_packed_by_fkey"
            columns: ["packed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slips_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slips_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "packing_slips_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacs_servers: {
        Row: {
          ae_title: string | null
          branch_id: string | null
          connection_status: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          last_connection_check: string | null
          modality_types: string[] | null
          name: string
          organization_id: string
          password: string | null
          server_url: string
          updated_at: string | null
          username: string | null
        }
        Insert: {
          ae_title?: string | null
          branch_id?: string | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_connection_check?: string | null
          modality_types?: string[] | null
          name: string
          organization_id: string
          password?: string | null
          server_url: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          ae_title?: string | null
          branch_id?: string | null
          connection_status?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          last_connection_check?: string | null
          modality_types?: string[] | null
          name?: string
          organization_id?: string
          password?: string | null
          server_url?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacs_servers_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacs_servers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      patient_consents: {
        Row: {
          consent_text: string | null
          consent_type: string
          created_at: string
          expires_at: string | null
          granted_at: string | null
          id: string
          ip_address: string | null
          organization_id: string
          patient_id: string
          revoked_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          consent_text?: string | null
          consent_type: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id: string
          patient_id: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          consent_text?: string | null
          consent_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string | null
          id?: string
          ip_address?: string | null
          organization_id?: string
          patient_id?: string
          revoked_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patient_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_consents_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patient_insurance: {
        Row: {
          cchi_number: string | null
          created_at: string | null
          end_date: string | null
          group_number: string | null
          id: string
          insurance_plan_id: string
          is_active: boolean | null
          is_primary: boolean | null
          member_id: string | null
          notes: string | null
          nphies_coverage_end: string | null
          nphies_eligible: boolean | null
          nphies_last_checked: string | null
          patient_id: string
          policy_number: string
          start_date: string
          subscriber_name: string | null
          subscriber_relationship: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          cchi_number?: string | null
          created_at?: string | null
          end_date?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id: string
          is_active?: boolean | null
          is_primary?: boolean | null
          member_id?: string | null
          notes?: string | null
          nphies_coverage_end?: string | null
          nphies_eligible?: boolean | null
          nphies_last_checked?: string | null
          patient_id: string
          policy_number: string
          start_date: string
          subscriber_name?: string | null
          subscriber_relationship?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          cchi_number?: string | null
          created_at?: string | null
          end_date?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          member_id?: string | null
          notes?: string | null
          nphies_coverage_end?: string | null
          nphies_eligible?: boolean | null
          nphies_last_checked?: string | null
          patient_id?: string
          policy_number?: string
          start_date?: string
          subscriber_name?: string | null
          subscriber_relationship?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_insurance_insurance_plan_id_fkey"
            columns: ["insurance_plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_insurance_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
          nafath_request_id: string | null
          nafath_verified: boolean | null
          nafath_verified_at: string | null
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
          nafath_request_id?: string | null
          nafath_verified?: boolean | null
          nafath_verified_at?: string | null
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
          nafath_request_id?: string | null
          nafath_verified?: boolean | null
          nafath_verified_at?: string | null
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
          ledger_account_id: string | null
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
          ledger_account_id?: string | null
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
          ledger_account_id?: string | null
          name?: string
          organization_id?: string
          requires_reference?: boolean | null
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_methods_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
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
          billing_session_id: string | null
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
          billing_session_id?: string | null
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
          billing_session_id?: string | null
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
            foreignKeyName: "payments_billing_session_id_fkey"
            columns: ["billing_session_id"]
            isOneToOne: false
            referencedRelation: "billing_sessions"
            referencedColumns: ["id"]
          },
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
      pharmacy_patient_credits: {
        Row: {
          amount: number
          balance: number | null
          branch_id: string
          created_at: string | null
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          paid_amount: number | null
          paid_at: string | null
          paid_by: string | null
          patient_id: string
          status: string | null
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          balance?: number | null
          branch_id: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          paid_amount?: number | null
          paid_at?: string | null
          paid_by?: string | null
          patient_id: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          balance?: number | null
          branch_id?: string
          created_at?: string | null
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          paid_amount?: number | null
          paid_at?: string | null
          paid_by?: string | null
          patient_id?: string
          status?: string | null
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_patient_credits_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_patient_credits_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_patient_credits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_patient_credits_paid_by_fkey"
            columns: ["paid_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_patient_credits_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_patient_credits_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_pos_held_transactions: {
        Row: {
          branch_id: string
          cart_items: Json
          created_at: string
          customer_name: string | null
          customer_phone: string | null
          discount_percent: number | null
          held_at: string
          held_by: string | null
          id: string
          is_active: boolean | null
          notes: string | null
          organization_id: string
          patient_id: string | null
          prescription_id: string | null
          recalled_at: string | null
          recalled_by: string | null
        }
        Insert: {
          branch_id: string
          cart_items?: Json
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_percent?: number | null
          held_at?: string
          held_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id: string
          patient_id?: string | null
          prescription_id?: string | null
          recalled_at?: string | null
          recalled_by?: string | null
        }
        Update: {
          branch_id?: string
          cart_items?: Json
          created_at?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_percent?: number | null
          held_at?: string
          held_by?: string | null
          id?: string
          is_active?: boolean | null
          notes?: string | null
          organization_id?: string
          patient_id?: string | null
          prescription_id?: string | null
          recalled_at?: string | null
          recalled_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pos_held_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_held_transactions_held_by_fkey"
            columns: ["held_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_held_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_held_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_held_transactions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_held_transactions_recalled_by_fkey"
            columns: ["recalled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_pos_items: {
        Row: {
          batch_number: string | null
          created_at: string
          discount_amount: number | null
          discount_percent: number | null
          id: string
          inventory_id: string | null
          line_total: number | null
          medicine_id: string
          medicine_name: string | null
          quantity: number
          tax_amount: number | null
          tax_percent: number | null
          total_price: number
          transaction_id: string
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          inventory_id?: string | null
          line_total?: number | null
          medicine_id: string
          medicine_name?: string | null
          quantity: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_price: number
          transaction_id: string
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          discount_amount?: number | null
          discount_percent?: number | null
          id?: string
          inventory_id?: string | null
          line_total?: number | null
          medicine_id?: string
          medicine_name?: string | null
          quantity?: number
          tax_amount?: number | null
          tax_percent?: number | null
          total_price?: number
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pos_items_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "medicine_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_pos_payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string
          reference_number: string | null
          transaction_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method: string
          reference_number?: string | null
          transaction_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string
          reference_number?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pos_payments_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_pos_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_pos_sessions: {
        Row: {
          branch_id: string
          cash_difference: number | null
          closed_at: string | null
          closed_by: string | null
          closing_balance: number | null
          created_at: string
          expected_cash: number | null
          id: string
          notes: string | null
          opened_at: string
          opened_by: string
          opening_balance: number
          organization_id: string
          session_number: string
          status: string
          total_sales: number | null
          total_transactions: number | null
          updated_at: string
        }
        Insert: {
          branch_id: string
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by: string
          opening_balance?: number
          organization_id: string
          session_number: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Update: {
          branch_id?: string
          cash_difference?: number | null
          closed_at?: string | null
          closed_by?: string | null
          closing_balance?: number | null
          created_at?: string
          expected_cash?: number | null
          id?: string
          notes?: string | null
          opened_at?: string
          opened_by?: string
          opening_balance?: number
          organization_id?: string
          session_number?: string
          status?: string
          total_sales?: number | null
          total_transactions?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pos_sessions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_sessions_closed_by_fkey"
            columns: ["closed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_sessions_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_pos_transactions: {
        Row: {
          amount_paid: number
          branch_id: string
          change_amount: number
          created_at: string
          created_by: string
          customer_name: string | null
          customer_phone: string | null
          discount_amount: number
          discount_percent: number | null
          due_date: string | null
          id: string
          notes: string | null
          organization_id: string
          patient_id: string | null
          prescription_id: string | null
          session_id: string | null
          status: string
          store_id: string | null
          subtotal: number
          tax_amount: number
          total_amount: number
          transaction_number: string
          updated_at: string
          void_reason: string | null
          voided_at: string | null
          voided_by: string | null
        }
        Insert: {
          amount_paid?: number
          branch_id: string
          change_amount?: number
          created_at?: string
          created_by: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          discount_percent?: number | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          patient_id?: string | null
          prescription_id?: string | null
          session_id?: string | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_number: string
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Update: {
          amount_paid?: number
          branch_id?: string
          change_amount?: number
          created_at?: string
          created_by?: string
          customer_name?: string | null
          customer_phone?: string | null
          discount_amount?: number
          discount_percent?: number | null
          due_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          patient_id?: string | null
          prescription_id?: string | null
          session_id?: string | null
          status?: string
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          total_amount?: number
          transaction_number?: string
          updated_at?: string
          void_reason?: string | null
          voided_at?: string | null
          voided_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_pos_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_pos_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_pos_transactions_voided_by_fkey"
            columns: ["voided_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_return_items: {
        Row: {
          batch_number: string | null
          created_at: string | null
          id: string
          line_total: number
          medicine_id: string | null
          medicine_name: string
          original_item_id: string | null
          quantity_returned: number
          restocked: boolean | null
          return_id: string
          unit_price: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string | null
          id?: string
          line_total: number
          medicine_id?: string | null
          medicine_name: string
          original_item_id?: string | null
          quantity_returned: number
          restocked?: boolean | null
          return_id: string
          unit_price: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string | null
          id?: string
          line_total?: number
          medicine_id?: string | null
          medicine_name?: string
          original_item_id?: string | null
          quantity_returned?: number
          restocked?: boolean | null
          return_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_return_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_return_items_return_id_fkey"
            columns: ["return_id"]
            isOneToOne: false
            referencedRelation: "pharmacy_returns"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_returns: {
        Row: {
          branch_id: string
          created_at: string | null
          credit_adjustment: number | null
          credit_id: string | null
          id: string
          notes: string | null
          organization_id: string
          original_invoice_id: string | null
          original_transaction_id: string | null
          patient_id: string | null
          processed_by: string | null
          reason: string | null
          return_number: string
          return_type: string
          status: string
          total_refund_amount: number
          updated_at: string | null
        }
        Insert: {
          branch_id: string
          created_at?: string | null
          credit_adjustment?: number | null
          credit_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          original_invoice_id?: string | null
          original_transaction_id?: string | null
          patient_id?: string | null
          processed_by?: string | null
          reason?: string | null
          return_number: string
          return_type: string
          status?: string
          total_refund_amount?: number
          updated_at?: string | null
        }
        Update: {
          branch_id?: string
          created_at?: string | null
          credit_adjustment?: number | null
          credit_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          original_invoice_id?: string | null
          original_transaction_id?: string | null
          patient_id?: string | null
          processed_by?: string | null
          reason?: string | null
          return_number?: string
          return_type?: string
          status?: string
          total_refund_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_returns_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_returns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_returns_original_invoice_id_fkey"
            columns: ["original_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_returns_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_returns_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_settings: {
        Row: {
          allow_held_transactions: boolean | null
          auto_print_receipt: boolean | null
          branch_id: string | null
          cogs_account_id: string | null
          created_at: string | null
          default_tax_rate: number | null
          expiry_alert_days: number | null
          id: string
          inventory_account_id: string | null
          low_stock_threshold: number | null
          organization_id: string
          receipt_footer: string | null
          receipt_header: string | null
          require_customer_name: boolean | null
          require_prescription_for_controlled: boolean | null
          sales_revenue_account_id: string | null
          updated_at: string | null
        }
        Insert: {
          allow_held_transactions?: boolean | null
          auto_print_receipt?: boolean | null
          branch_id?: string | null
          cogs_account_id?: string | null
          created_at?: string | null
          default_tax_rate?: number | null
          expiry_alert_days?: number | null
          id?: string
          inventory_account_id?: string | null
          low_stock_threshold?: number | null
          organization_id: string
          receipt_footer?: string | null
          receipt_header?: string | null
          require_customer_name?: boolean | null
          require_prescription_for_controlled?: boolean | null
          sales_revenue_account_id?: string | null
          updated_at?: string | null
        }
        Update: {
          allow_held_transactions?: boolean | null
          auto_print_receipt?: boolean | null
          branch_id?: string | null
          cogs_account_id?: string | null
          created_at?: string | null
          default_tax_rate?: number | null
          expiry_alert_days?: number | null
          id?: string
          inventory_account_id?: string | null
          low_stock_threshold?: number | null
          organization_id?: string
          receipt_footer?: string | null
          receipt_header?: string | null
          require_customer_name?: boolean | null
          require_prescription_for_controlled?: boolean | null
          sales_revenue_account_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_settings_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_settings_cogs_account_id_fkey"
            columns: ["cogs_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_settings_inventory_account_id_fkey"
            columns: ["inventory_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_settings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_settings_sales_revenue_account_id_fkey"
            columns: ["sales_revenue_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacy_stock_movements: {
        Row: {
          batch_number: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          id: string
          inventory_id: string | null
          medicine_id: string | null
          movement_type: string
          new_stock: number | null
          notes: string | null
          organization_id: string
          previous_stock: number | null
          quantity: number
          reference_id: string | null
          reference_number: string | null
          reference_type: string | null
          store_id: string | null
          total_value: number | null
          unit_cost: number | null
        }
        Insert: {
          batch_number?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id?: string | null
          medicine_id?: string | null
          movement_type: string
          new_stock?: number | null
          notes?: string | null
          organization_id: string
          previous_stock?: number | null
          quantity: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          store_id?: string | null
          total_value?: number | null
          unit_cost?: number | null
        }
        Update: {
          batch_number?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          inventory_id?: string | null
          medicine_id?: string | null
          movement_type?: string
          new_stock?: number | null
          notes?: string | null
          organization_id?: string
          previous_stock?: number | null
          quantity?: number
          reference_id?: string | null
          reference_number?: string | null
          reference_type?: string | null
          store_id?: string | null
          total_value?: number | null
          unit_cost?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pharmacy_stock_movements_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_movements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_movements_inventory_id_fkey"
            columns: ["inventory_id"]
            isOneToOne: false
            referencedRelation: "medicine_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_movements_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_movements_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pharmacy_stock_movements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_list_items: {
        Row: {
          batch_number: string | null
          bin_id: string | null
          expiry_date: string | null
          id: string
          item_id: string | null
          medicine_id: string | null
          notes: string | null
          pick_list_id: string
          pick_sequence: number
          picked_at: string | null
          quantity_picked: number
          quantity_required: number
          status: string
        }
        Insert: {
          batch_number?: string | null
          bin_id?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          pick_list_id: string
          pick_sequence?: number
          picked_at?: string | null
          quantity_picked?: number
          quantity_required?: number
          status?: string
        }
        Update: {
          batch_number?: string | null
          bin_id?: string | null
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          pick_list_id?: string
          pick_sequence?: number
          picked_at?: string | null
          quantity_picked?: number
          quantity_required?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_list_items_bin_id_fkey"
            columns: ["bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_list_items_pick_list_id_fkey"
            columns: ["pick_list_id"]
            isOneToOne: false
            referencedRelation: "pick_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      pick_lists: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          id: string
          notes: string | null
          order_id: string | null
          organization_id: string
          pick_list_number: string
          pick_strategy: string
          priority: number
          source_id: string | null
          source_type: string
          started_at: string | null
          status: string
          store_id: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          organization_id: string
          pick_list_number?: string
          pick_strategy?: string
          priority?: number
          source_id?: string | null
          source_type?: string
          started_at?: string | null
          status?: string
          store_id: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string | null
          organization_id?: string
          pick_list_number?: string
          pick_strategy?: string
          priority?: number
          source_id?: string | null
          source_type?: string
          started_at?: string | null
          status?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_lists_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "warehouse_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pick_lists_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      post_op_orders: {
        Row: {
          activity_level: string | null
          activity_restrictions: string | null
          bleeding_precautions: boolean | null
          code_status: string | null
          consults: string[] | null
          continue_home_meds: boolean | null
          created_at: string | null
          diet_notes: string | null
          diet_order: string | null
          diet_start_time: string | null
          discharge_criteria: string | null
          disposition: string
          drains: Json | null
          dressing_change_frequency: string | null
          fall_precautions: boolean | null
          foley_catheter: boolean | null
          foley_removal_date: string | null
          follow_up_appointment: string | null
          follow_up_instructions: string | null
          held_medications: string | null
          id: string
          imaging_orders: string | null
          incentive_spirometry: boolean | null
          intake_output: boolean | null
          is_active: boolean | null
          iv_fluids: Json | null
          medications: Json | null
          morning_labs: string[] | null
          neuro_checks: boolean | null
          neuro_frequency: string | null
          ng_tube: boolean | null
          ng_tube_orders: string | null
          ordered_at: string | null
          ordered_by: string
          organization_id: string
          oxygen_therapy: string | null
          pain_goal: number | null
          pain_management: Json | null
          pca_ordered: boolean | null
          pca_settings: Json | null
          respiratory_treatments: string | null
          special_instructions: string | null
          stat_labs: string[] | null
          surgery_id: string
          updated_at: string | null
          vital_signs_frequency: string | null
          vte_medication_details: string | null
          vte_prophylaxis: string | null
          weight_bearing: string | null
          wound_care_instructions: string | null
        }
        Insert: {
          activity_level?: string | null
          activity_restrictions?: string | null
          bleeding_precautions?: boolean | null
          code_status?: string | null
          consults?: string[] | null
          continue_home_meds?: boolean | null
          created_at?: string | null
          diet_notes?: string | null
          diet_order?: string | null
          diet_start_time?: string | null
          discharge_criteria?: string | null
          disposition?: string
          drains?: Json | null
          dressing_change_frequency?: string | null
          fall_precautions?: boolean | null
          foley_catheter?: boolean | null
          foley_removal_date?: string | null
          follow_up_appointment?: string | null
          follow_up_instructions?: string | null
          held_medications?: string | null
          id?: string
          imaging_orders?: string | null
          incentive_spirometry?: boolean | null
          intake_output?: boolean | null
          is_active?: boolean | null
          iv_fluids?: Json | null
          medications?: Json | null
          morning_labs?: string[] | null
          neuro_checks?: boolean | null
          neuro_frequency?: string | null
          ng_tube?: boolean | null
          ng_tube_orders?: string | null
          ordered_at?: string | null
          ordered_by: string
          organization_id: string
          oxygen_therapy?: string | null
          pain_goal?: number | null
          pain_management?: Json | null
          pca_ordered?: boolean | null
          pca_settings?: Json | null
          respiratory_treatments?: string | null
          special_instructions?: string | null
          stat_labs?: string[] | null
          surgery_id: string
          updated_at?: string | null
          vital_signs_frequency?: string | null
          vte_medication_details?: string | null
          vte_prophylaxis?: string | null
          weight_bearing?: string | null
          wound_care_instructions?: string | null
        }
        Update: {
          activity_level?: string | null
          activity_restrictions?: string | null
          bleeding_precautions?: boolean | null
          code_status?: string | null
          consults?: string[] | null
          continue_home_meds?: boolean | null
          created_at?: string | null
          diet_notes?: string | null
          diet_order?: string | null
          diet_start_time?: string | null
          discharge_criteria?: string | null
          disposition?: string
          drains?: Json | null
          dressing_change_frequency?: string | null
          fall_precautions?: boolean | null
          foley_catheter?: boolean | null
          foley_removal_date?: string | null
          follow_up_appointment?: string | null
          follow_up_instructions?: string | null
          held_medications?: string | null
          id?: string
          imaging_orders?: string | null
          incentive_spirometry?: boolean | null
          intake_output?: boolean | null
          is_active?: boolean | null
          iv_fluids?: Json | null
          medications?: Json | null
          morning_labs?: string[] | null
          neuro_checks?: boolean | null
          neuro_frequency?: string | null
          ng_tube?: boolean | null
          ng_tube_orders?: string | null
          ordered_at?: string | null
          ordered_by?: string
          organization_id?: string
          oxygen_therapy?: string | null
          pain_goal?: number | null
          pain_management?: Json | null
          pca_ordered?: boolean | null
          pca_settings?: Json | null
          respiratory_treatments?: string | null
          special_instructions?: string | null
          stat_labs?: string[] | null
          surgery_id?: string
          updated_at?: string | null
          vital_signs_frequency?: string | null
          vte_medication_details?: string | null
          vte_prophylaxis?: string | null
          weight_bearing?: string | null
          wound_care_instructions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_op_orders_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_op_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_op_orders_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      post_op_recovery: {
        Row: {
          aldrete_scores: Json | null
          complications: Json | null
          created_at: string | null
          discharge_criteria_met: boolean | null
          discharge_destination: string | null
          discharge_notes: string | null
          discharge_time: string | null
          discharged_by: string | null
          drain_output_ml: number | null
          emergence_delirium: boolean | null
          final_aldrete_score: number | null
          fluid_intake_ml: number | null
          handover_from: string | null
          handover_notes: string | null
          id: string
          medications_given: Json | null
          nausea_vomiting: boolean | null
          nursing_interventions: Json | null
          pacu_arrival_time: string
          pacu_nurse_id: string | null
          pain_management: Json | null
          pain_scores: Json | null
          shivering: boolean | null
          surgery_id: string
          updated_at: string | null
          urine_output_ml: number | null
          vitals_log: Json | null
        }
        Insert: {
          aldrete_scores?: Json | null
          complications?: Json | null
          created_at?: string | null
          discharge_criteria_met?: boolean | null
          discharge_destination?: string | null
          discharge_notes?: string | null
          discharge_time?: string | null
          discharged_by?: string | null
          drain_output_ml?: number | null
          emergence_delirium?: boolean | null
          final_aldrete_score?: number | null
          fluid_intake_ml?: number | null
          handover_from?: string | null
          handover_notes?: string | null
          id?: string
          medications_given?: Json | null
          nausea_vomiting?: boolean | null
          nursing_interventions?: Json | null
          pacu_arrival_time: string
          pacu_nurse_id?: string | null
          pain_management?: Json | null
          pain_scores?: Json | null
          shivering?: boolean | null
          surgery_id: string
          updated_at?: string | null
          urine_output_ml?: number | null
          vitals_log?: Json | null
        }
        Update: {
          aldrete_scores?: Json | null
          complications?: Json | null
          created_at?: string | null
          discharge_criteria_met?: boolean | null
          discharge_destination?: string | null
          discharge_notes?: string | null
          discharge_time?: string | null
          discharged_by?: string | null
          drain_output_ml?: number | null
          emergence_delirium?: boolean | null
          final_aldrete_score?: number | null
          fluid_intake_ml?: number | null
          handover_from?: string | null
          handover_notes?: string | null
          id?: string
          medications_given?: Json | null
          nausea_vomiting?: boolean | null
          nursing_interventions?: Json | null
          pacu_arrival_time?: string
          pacu_nurse_id?: string | null
          pain_management?: Json | null
          pain_scores?: Json | null
          shivering?: boolean | null
          surgery_id?: string
          updated_at?: string | null
          urine_output_ml?: number | null
          vitals_log?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "post_op_recovery_discharged_by_fkey"
            columns: ["discharged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_op_recovery_handover_from_fkey"
            columns: ["handover_from"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_op_recovery_pacu_nurse_id_fkey"
            columns: ["pacu_nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_op_recovery_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_anesthesia_assessments: {
        Row: {
          airway_notes: string | null
          anticoagulant_status: string | null
          asa_class_id: string | null
          assessed_by: string | null
          assessment_date: string | null
          blood_pressure: string | null
          blood_sugar: number | null
          bmi: number | null
          cardiac_risk_score: string | null
          chest_xray_findings: string | null
          clearance_notes: string | null
          consent_notes: string | null
          consent_obtained: boolean | null
          consent_obtained_at: string | null
          created_at: string | null
          creatinine: number | null
          current_medications: Json | null
          dental_status: string | null
          ecg_findings: string | null
          family_anesthesia_complications: boolean | null
          family_complications_details: string | null
          fitness_decision: string | null
          heart_rate: number | null
          height_cm: number | null
          hemoglobin: number | null
          id: string
          inr: number | null
          known_allergies: Json | null
          last_anticoagulant_dose: string | null
          last_clear_fluid: string | null
          last_solid_food: string | null
          latex_allergy: boolean | null
          mallampati_score: string | null
          mouth_opening: string | null
          neck_mobility: string | null
          not_fit_reason: string | null
          not_fit_reason_category: string | null
          npo_notes: string | null
          npo_verified: boolean | null
          organization_id: string
          overall_risk: string | null
          planned_airway_device_id: string | null
          planned_anesthesia_type_id: string | null
          planned_position_id: string | null
          platelets: number | null
          predicted_difficult_airway: boolean | null
          previous_anesthesia: boolean | null
          previous_anesthesia_type: string | null
          previous_complications: boolean | null
          previous_complications_details: string | null
          pulmonary_risk_score: string | null
          recommended_postpone_days: number | null
          requires_reschedule: boolean | null
          special_considerations: string | null
          spo2: number | null
          status: string | null
          surgery_id: string
          thyromental_distance: string | null
          updated_at: string | null
          weight_kg: number | null
        }
        Insert: {
          airway_notes?: string | null
          anticoagulant_status?: string | null
          asa_class_id?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          blood_pressure?: string | null
          blood_sugar?: number | null
          bmi?: number | null
          cardiac_risk_score?: string | null
          chest_xray_findings?: string | null
          clearance_notes?: string | null
          consent_notes?: string | null
          consent_obtained?: boolean | null
          consent_obtained_at?: string | null
          created_at?: string | null
          creatinine?: number | null
          current_medications?: Json | null
          dental_status?: string | null
          ecg_findings?: string | null
          family_anesthesia_complications?: boolean | null
          family_complications_details?: string | null
          fitness_decision?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          hemoglobin?: number | null
          id?: string
          inr?: number | null
          known_allergies?: Json | null
          last_anticoagulant_dose?: string | null
          last_clear_fluid?: string | null
          last_solid_food?: string | null
          latex_allergy?: boolean | null
          mallampati_score?: string | null
          mouth_opening?: string | null
          neck_mobility?: string | null
          not_fit_reason?: string | null
          not_fit_reason_category?: string | null
          npo_notes?: string | null
          npo_verified?: boolean | null
          organization_id: string
          overall_risk?: string | null
          planned_airway_device_id?: string | null
          planned_anesthesia_type_id?: string | null
          planned_position_id?: string | null
          platelets?: number | null
          predicted_difficult_airway?: boolean | null
          previous_anesthesia?: boolean | null
          previous_anesthesia_type?: string | null
          previous_complications?: boolean | null
          previous_complications_details?: string | null
          pulmonary_risk_score?: string | null
          recommended_postpone_days?: number | null
          requires_reschedule?: boolean | null
          special_considerations?: string | null
          spo2?: number | null
          status?: string | null
          surgery_id: string
          thyromental_distance?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Update: {
          airway_notes?: string | null
          anticoagulant_status?: string | null
          asa_class_id?: string | null
          assessed_by?: string | null
          assessment_date?: string | null
          blood_pressure?: string | null
          blood_sugar?: number | null
          bmi?: number | null
          cardiac_risk_score?: string | null
          chest_xray_findings?: string | null
          clearance_notes?: string | null
          consent_notes?: string | null
          consent_obtained?: boolean | null
          consent_obtained_at?: string | null
          created_at?: string | null
          creatinine?: number | null
          current_medications?: Json | null
          dental_status?: string | null
          ecg_findings?: string | null
          family_anesthesia_complications?: boolean | null
          family_complications_details?: string | null
          fitness_decision?: string | null
          heart_rate?: number | null
          height_cm?: number | null
          hemoglobin?: number | null
          id?: string
          inr?: number | null
          known_allergies?: Json | null
          last_anticoagulant_dose?: string | null
          last_clear_fluid?: string | null
          last_solid_food?: string | null
          latex_allergy?: boolean | null
          mallampati_score?: string | null
          mouth_opening?: string | null
          neck_mobility?: string | null
          not_fit_reason?: string | null
          not_fit_reason_category?: string | null
          npo_notes?: string | null
          npo_verified?: boolean | null
          organization_id?: string
          overall_risk?: string | null
          planned_airway_device_id?: string | null
          planned_anesthesia_type_id?: string | null
          planned_position_id?: string | null
          platelets?: number | null
          predicted_difficult_airway?: boolean | null
          previous_anesthesia?: boolean | null
          previous_anesthesia_type?: string | null
          previous_complications?: boolean | null
          previous_complications_details?: string | null
          pulmonary_risk_score?: string | null
          recommended_postpone_days?: number | null
          requires_reschedule?: boolean | null
          special_considerations?: string | null
          spo2?: number | null
          status?: string | null
          surgery_id?: string
          thyromental_distance?: string | null
          updated_at?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_anesthesia_assessments_asa_class_id_fkey"
            columns: ["asa_class_id"]
            isOneToOne: false
            referencedRelation: "config_asa_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_planned_airway_device_id_fkey"
            columns: ["planned_airway_device_id"]
            isOneToOne: false
            referencedRelation: "config_airway_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_planned_anesthesia_type_id_fkey"
            columns: ["planned_anesthesia_type_id"]
            isOneToOne: false
            referencedRelation: "config_anesthesia_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_planned_position_id_fkey"
            columns: ["planned_position_id"]
            isOneToOne: false
            referencedRelation: "config_surgical_positions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_anesthesia_assessments_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      pre_op_assessments: {
        Row: {
          airway_assessment: Json | null
          allergies: string | null
          anesthesia_clearance: Json | null
          asa_class: Database["public"]["Enums"]["asa_class"] | null
          asa_notes: string | null
          assessed_by: string
          assessment_date: string | null
          blood_arranged: boolean | null
          cardiac_clearance: Json | null
          cardiac_risk_score: string | null
          clearance_notes: string | null
          cleared_at: string | null
          cleared_by: string | null
          consent_verified: boolean | null
          created_at: string | null
          current_medications: Json | null
          dentures_removed: boolean | null
          fasting_confirmed: boolean | null
          id: string
          investigations: Json | null
          investigations_cleared: boolean | null
          is_cleared_for_surgery: boolean | null
          jewelry_removed: boolean | null
          medical_clearance: Json | null
          medical_history_reviewed: boolean | null
          other_clearances: Json | null
          pre_op_orders: Json | null
          relevant_conditions: Json | null
          site_marked: boolean | null
          surgery_id: string
          surgical_risk_notes: string | null
          updated_at: string | null
          vitals: Json | null
        }
        Insert: {
          airway_assessment?: Json | null
          allergies?: string | null
          anesthesia_clearance?: Json | null
          asa_class?: Database["public"]["Enums"]["asa_class"] | null
          asa_notes?: string | null
          assessed_by: string
          assessment_date?: string | null
          blood_arranged?: boolean | null
          cardiac_clearance?: Json | null
          cardiac_risk_score?: string | null
          clearance_notes?: string | null
          cleared_at?: string | null
          cleared_by?: string | null
          consent_verified?: boolean | null
          created_at?: string | null
          current_medications?: Json | null
          dentures_removed?: boolean | null
          fasting_confirmed?: boolean | null
          id?: string
          investigations?: Json | null
          investigations_cleared?: boolean | null
          is_cleared_for_surgery?: boolean | null
          jewelry_removed?: boolean | null
          medical_clearance?: Json | null
          medical_history_reviewed?: boolean | null
          other_clearances?: Json | null
          pre_op_orders?: Json | null
          relevant_conditions?: Json | null
          site_marked?: boolean | null
          surgery_id: string
          surgical_risk_notes?: string | null
          updated_at?: string | null
          vitals?: Json | null
        }
        Update: {
          airway_assessment?: Json | null
          allergies?: string | null
          anesthesia_clearance?: Json | null
          asa_class?: Database["public"]["Enums"]["asa_class"] | null
          asa_notes?: string | null
          assessed_by?: string
          assessment_date?: string | null
          blood_arranged?: boolean | null
          cardiac_clearance?: Json | null
          cardiac_risk_score?: string | null
          clearance_notes?: string | null
          cleared_at?: string | null
          cleared_by?: string | null
          consent_verified?: boolean | null
          created_at?: string | null
          current_medications?: Json | null
          dentures_removed?: boolean | null
          fasting_confirmed?: boolean | null
          id?: string
          investigations?: Json | null
          investigations_cleared?: boolean | null
          is_cleared_for_surgery?: boolean | null
          jewelry_removed?: boolean | null
          medical_clearance?: Json | null
          medical_history_reviewed?: boolean | null
          other_clearances?: Json | null
          pre_op_orders?: Json | null
          relevant_conditions?: Json | null
          site_marked?: boolean | null
          surgery_id?: string
          surgical_risk_notes?: string | null
          updated_at?: string | null
          vitals?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "pre_op_assessments_assessed_by_fkey"
            columns: ["assessed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_op_assessments_cleared_by_fkey"
            columns: ["cleared_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pre_op_assessments_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_order_items: {
        Row: {
          created_at: string
          discount_percent: number
          id: string
          item_id: string
          item_type: string | null
          medicine_id: string | null
          purchase_order_id: string
          quantity: number
          received_quantity: number
          tax_percent: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          discount_percent?: number
          id?: string
          item_id: string
          item_type?: string | null
          medicine_id?: string | null
          purchase_order_id: string
          quantity?: number
          received_quantity?: number
          tax_percent?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          discount_percent?: number
          id?: string
          item_id?: string
          item_type?: string | null
          medicine_id?: string | null
          purchase_order_id?: string
          quantity?: number
          received_quantity?: number
          tax_percent?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          created_by: string | null
          discount_amount: number
          expected_delivery_date: string | null
          id: string
          notes: string | null
          order_date: string
          organization_id: string
          po_number: string
          status: Database["public"]["Enums"]["po_status"]
          store_id: string | null
          subtotal: number
          tax_amount: number
          terms: string | null
          total_amount: number
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          organization_id: string
          po_number: string
          status?: Database["public"]["Enums"]["po_status"]
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          created_by?: string | null
          discount_amount?: number
          expected_delivery_date?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          organization_id?: string
          po_number?: string
          status?: Database["public"]["Enums"]["po_status"]
          store_id?: string | null
          subtotal?: number
          tax_amount?: number
          terms?: string | null
          total_amount?: number
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_orders_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_request_items: {
        Row: {
          created_at: string
          current_stock: number | null
          estimated_unit_cost: number | null
          id: string
          item_id: string | null
          medicine_id: string | null
          notes: string | null
          purchase_request_id: string
          quantity_requested: number
          reorder_level: number | null
        }
        Insert: {
          created_at?: string
          current_stock?: number | null
          estimated_unit_cost?: number | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          purchase_request_id: string
          quantity_requested?: number
          reorder_level?: number | null
        }
        Update: {
          created_at?: string
          current_stock?: number | null
          estimated_unit_cost?: number | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          purchase_request_id?: string
          quantity_requested?: number
          reorder_level?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_request_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_request_items_purchase_request_id_fkey"
            columns: ["purchase_request_id"]
            isOneToOne: false
            referencedRelation: "purchase_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          department: string | null
          id: string
          notes: string | null
          organization_id: string
          pr_number: string
          priority: number | null
          rejection_reason: string | null
          requested_by: string | null
          status: Database["public"]["Enums"]["pr_status"]
          store_id: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          pr_number?: string
          priority?: number | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["pr_status"]
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          department?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          pr_number?: string
          priority?: number | null
          rejection_reason?: string | null
          requested_by?: string | null
          status?: Database["public"]["Enums"]["pr_status"]
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_requests_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      push_device_tokens: {
        Row: {
          created_at: string | null
          device_name: string | null
          id: string
          is_active: boolean | null
          last_used_at: string | null
          organization_id: string | null
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          organization_id?: string | null
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          device_name?: string | null
          id?: string
          is_active?: boolean | null
          last_used_at?: string | null
          organization_id?: string | null
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "push_device_tokens_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      putaway_tasks: {
        Row: {
          actual_bin_id: string | null
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          grn_id: string | null
          id: string
          item_id: string | null
          medicine_id: string | null
          notes: string | null
          organization_id: string
          priority: number
          quantity: number
          started_at: string | null
          status: string
          stock_id: string | null
          store_id: string
          suggested_bin_id: string | null
          updated_at: string
        }
        Insert: {
          actual_bin_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          grn_id?: string | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          organization_id: string
          priority?: number
          quantity?: number
          started_at?: string | null
          status?: string
          stock_id?: string | null
          store_id: string
          suggested_bin_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_bin_id?: string | null
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          grn_id?: string | null
          id?: string
          item_id?: string | null
          medicine_id?: string | null
          notes?: string | null
          organization_id?: string
          priority?: number
          quantity?: number
          started_at?: string | null
          status?: string
          stock_id?: string | null
          store_id?: string
          suggested_bin_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "putaway_tasks_actual_bin_id_fkey"
            columns: ["actual_bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_medicine_id_fkey"
            columns: ["medicine_id"]
            isOneToOne: false
            referencedRelation: "medicines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "putaway_tasks_suggested_bin_id_fkey"
            columns: ["suggested_bin_id"]
            isOneToOne: false
            referencedRelation: "warehouse_bins"
            referencedColumns: ["id"]
          },
        ]
      }
      qualifications: {
        Row: {
          abbreviation: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
        }
        Insert: {
          abbreviation?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
        }
        Update: {
          abbreviation?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "qualifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      queue_display_configs: {
        Row: {
          audio_enabled: boolean | null
          branch_id: string | null
          created_at: string | null
          departments: Json | null
          display_settings: Json | null
          display_type: string
          doctor_ids: Json | null
          id: string
          is_active: boolean | null
          linked_kiosk_ids: Json | null
          name: string
          organization_id: string
          show_next_count: number | null
          theme: string | null
          updated_at: string | null
        }
        Insert: {
          audio_enabled?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          departments?: Json | null
          display_settings?: Json | null
          display_type?: string
          doctor_ids?: Json | null
          id?: string
          is_active?: boolean | null
          linked_kiosk_ids?: Json | null
          name: string
          organization_id: string
          show_next_count?: number | null
          theme?: string | null
          updated_at?: string | null
        }
        Update: {
          audio_enabled?: boolean | null
          branch_id?: string | null
          created_at?: string | null
          departments?: Json | null
          display_settings?: Json | null
          display_type?: string
          doctor_ids?: Json | null
          id?: string
          is_active?: boolean | null
          linked_kiosk_ids?: Json | null
          name?: string
          organization_id?: string
          show_next_count?: number | null
          theme?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "queue_display_configs_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "queue_display_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      radiology_device_catalog: {
        Row: {
          created_at: string | null
          default_port: number | null
          device_type: string
          dicom_ae_title: string | null
          id: string
          is_active: boolean | null
          manufacturer: string
          modality_code: string | null
          model: string
          notes: string | null
          supports_dicomweb: boolean | null
          supports_worklist: boolean | null
        }
        Insert: {
          created_at?: string | null
          default_port?: number | null
          device_type: string
          dicom_ae_title?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer: string
          modality_code?: string | null
          model: string
          notes?: string | null
          supports_dicomweb?: boolean | null
          supports_worklist?: boolean | null
        }
        Update: {
          created_at?: string | null
          default_port?: number | null
          device_type?: string
          dicom_ae_title?: string | null
          id?: string
          is_active?: boolean | null
          manufacturer?: string
          modality_code?: string | null
          model?: string
          notes?: string | null
          supports_dicomweb?: boolean | null
          supports_worklist?: boolean | null
        }
        Relationships: []
      }
      report_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          footer_content: string | null
          header_content: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          organization_id: string
          report_type: string
          styles: string | null
          template_content: string | null
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          organization_id: string
          report_type: string
          styles?: string | null
          template_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          footer_content?: string | null
          header_content?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          organization_id?: string
          report_type?: string
          styles?: string | null
          template_content?: string | null
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "report_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      requisition_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          notes: string | null
          quantity_approved: number
          quantity_issued: number
          quantity_requested: number
          requisition_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          notes?: string | null
          quantity_approved?: number
          quantity_issued?: number
          quantity_requested?: number
          requisition_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity_approved?: number
          quantity_issued?: number
          quantity_requested?: number
          requisition_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "requisition_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requisition_items_requisition_id_fkey"
            columns: ["requisition_id"]
            isOneToOne: false
            referencedRelation: "stock_requisitions"
            referencedColumns: ["id"]
          },
        ]
      }
      resignations: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          approved_at: string | null
          approved_by: string | null
          buyout_amount: number | null
          created_at: string | null
          employee_id: string
          id: string
          is_notice_buyout: boolean | null
          last_working_date: string
          notes: string | null
          notice_period_days: number | null
          notice_period_served: number | null
          notice_period_shortage: number | null
          organization_id: string
          reason_category: string | null
          reason_details: string | null
          resignation_date: string
          resignation_letter_url: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyout_amount?: number | null
          created_at?: string | null
          employee_id: string
          id?: string
          is_notice_buyout?: boolean | null
          last_working_date: string
          notes?: string | null
          notice_period_days?: number | null
          notice_period_served?: number | null
          notice_period_shortage?: number | null
          organization_id: string
          reason_category?: string | null
          reason_details?: string | null
          resignation_date?: string
          resignation_letter_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          buyout_amount?: number | null
          created_at?: string | null
          employee_id?: string
          id?: string
          is_notice_buyout?: boolean | null
          last_working_date?: string
          notes?: string | null
          notice_period_days?: number | null
          notice_period_served?: number | null
          notice_period_shortage?: number | null
          organization_id?: string
          reason_category?: string | null
          reason_details?: string | null
          resignation_date?: string
          resignation_letter_url?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resignations_acknowledged_by_fkey"
            columns: ["acknowledged_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resignations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resignations_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resignations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      return_to_vendor: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          grn_id: string | null
          id: string
          notes: string | null
          organization_id: string
          reason: string | null
          return_date: string
          rtv_number: string
          shipped_at: string | null
          status: string
          store_id: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          grn_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          reason?: string | null
          return_date?: string
          rtv_number: string
          shipped_at?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          grn_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          reason?: string | null
          return_date?: string
          rtv_number?: string
          shipped_at?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "return_to_vendor_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_to_vendor_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_to_vendor_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_to_vendor_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_to_vendor_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "return_to_vendor_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
      roster_publish_status: {
        Row: {
          branch_id: string | null
          created_at: string | null
          department_id: string | null
          id: string
          notes: string | null
          organization_id: string
          published_at: string | null
          published_by: string | null
          roster_type: string | null
          status: string | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          week_start: string
        }
        Insert: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          published_at?: string | null
          published_by?: string | null
          roster_type?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          week_start: string
        }
        Update: {
          branch_id?: string | null
          created_at?: string | null
          department_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          published_at?: string | null
          published_by?: string | null
          roster_type?: string | null
          status?: string | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "roster_publish_status_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_publish_status_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_publish_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_publish_status_published_by_fkey"
            columns: ["published_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "roster_publish_status_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rtv_items: {
        Row: {
          batch_number: string | null
          created_at: string
          id: string
          item_id: string
          quantity: number
          reason: string | null
          rtv_id: string
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          id?: string
          item_id: string
          quantity: number
          reason?: string | null
          rtv_id: string
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          id?: string
          item_id?: string
          quantity?: number
          reason?: string | null
          rtv_id?: string
          unit_cost?: number
        }
        Relationships: [
          {
            foreignKeyName: "rtv_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rtv_items_rtv_id_fkey"
            columns: ["rtv_id"]
            isOneToOne: false
            referencedRelation: "return_to_vendor"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          action_taken: string | null
          created_at: string
          description: string | null
          id: string
          incident_date: string
          incident_type: string
          location: string | null
          organization_id: string
          reported_by: string | null
          severity: string
          status: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date: string
          incident_type?: string
          location?: string | null
          organization_id: string
          reported_by?: string | null
          severity?: string
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          description?: string | null
          id?: string
          incident_date?: string
          incident_type?: string
          location?: string | null
          organization_id?: string
          reported_by?: string | null
          severity?: string
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
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
      sehhaty_sync_log: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          organization_id: string
          patient_id: string
          reference_id: string | null
          reference_type: string | null
          sehhaty_reference_id: string | null
          submission_response: Json | null
          submission_status: string
          submitted_at: string | null
          sync_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id: string
          patient_id: string
          reference_id?: string | null
          reference_type?: string | null
          sehhaty_reference_id?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          sync_type: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          organization_id?: string
          patient_id?: string
          reference_id?: string | null
          reference_type?: string | null
          sehhaty_reference_id?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          sync_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sehhaty_sync_log_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sehhaty_sync_log_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sehhaty_sync_log_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          code: string
          color: string | null
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          is_system: boolean | null
          name: string
          organization_id: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          code: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name: string
          organization_id: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          color?: string | null
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          is_system?: boolean | null
          name?: string
          organization_id?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_categories_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      service_price_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          new_price: number
          old_price: number | null
          reason: string | null
          service_type_id: string
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_price: number
          old_price?: number | null
          reason?: string | null
          service_type_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          new_price?: number
          old_price?: number | null
          reason?: string | null
          service_type_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_price_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_price_history_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          category: Database["public"]["Enums"]["service_category"] | null
          category_id: string | null
          created_at: string
          default_price: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          price_updated_at: string | null
          price_updated_by: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["service_category"] | null
          category_id?: string | null
          created_at?: string
          default_price?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          price_updated_at?: string | null
          price_updated_by?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"] | null
          category_id?: string | null
          created_at?: string
          default_price?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          price_updated_at?: string | null
          price_updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_types_price_updated_by_fkey"
            columns: ["price_updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      shift_handovers: {
        Row: {
          created_at: string
          handed_over_by: string | null
          id: string
          issues_notes: string | null
          organization_id: string
          pending_dispatches: string | null
          pending_receipts: string | null
          received_by: string | null
          shift_date: string
          shift_type: string
          status: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          handed_over_by?: string | null
          id?: string
          issues_notes?: string | null
          organization_id: string
          pending_dispatches?: string | null
          pending_receipts?: string | null
          received_by?: string | null
          shift_date: string
          shift_type?: string
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          handed_over_by?: string | null
          id?: string
          issues_notes?: string | null
          organization_id?: string
          pending_dispatches?: string | null
          pending_receipts?: string | null
          received_by?: string | null
          shift_date?: string
          shift_type?: string
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shift_handovers_handed_over_by_fkey"
            columns: ["handed_over_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_handovers_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          break_duration_minutes: number | null
          code: string
          color: string | null
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
          color?: string | null
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
          color?: string | null
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
      shipment_tracking_events: {
        Row: {
          created_at: string
          created_by: string | null
          event_description: string | null
          event_time: string
          event_type: string
          id: string
          location: string | null
          shipment_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_description?: string | null
          event_time?: string
          event_type: string
          id?: string
          location?: string | null
          shipment_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_description?: string | null
          event_time?: string
          event_type?: string
          id?: string
          location?: string | null
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipment_tracking_events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipment_tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      shipments: {
        Row: {
          actual_delivery: string | null
          carrier_name: string | null
          created_at: string
          destination_address: Json | null
          destination_id: string | null
          destination_type: string
          dispatched_at: string | null
          dispatched_by: string | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          organization_id: string
          packing_slip_id: string | null
          proof_of_delivery: string | null
          received_at: string | null
          received_by_name: string | null
          shipment_number: string
          shipping_cost: number | null
          shipping_method: string
          status: string
          store_id: string
          total_boxes: number | null
          total_weight: number | null
          tracking_number: string | null
          transfer_id: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery?: string | null
          carrier_name?: string | null
          created_at?: string
          destination_address?: Json | null
          destination_id?: string | null
          destination_type?: string
          dispatched_at?: string | null
          dispatched_by?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          organization_id: string
          packing_slip_id?: string | null
          proof_of_delivery?: string | null
          received_at?: string | null
          received_by_name?: string | null
          shipment_number?: string
          shipping_cost?: number | null
          shipping_method?: string
          status?: string
          store_id: string
          total_boxes?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery?: string | null
          carrier_name?: string | null
          created_at?: string
          destination_address?: Json | null
          destination_id?: string | null
          destination_type?: string
          dispatched_at?: string | null
          dispatched_by?: string | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
          packing_slip_id?: string | null
          proof_of_delivery?: string | null
          received_at?: string | null
          received_by_name?: string | null
          shipment_number?: string
          shipping_cost?: number | null
          shipping_method?: string
          status?: string
          store_id?: string
          total_boxes?: number | null
          total_weight?: number | null
          tracking_number?: string | null
          transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shipments_dispatched_by_fkey"
            columns: ["dispatched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_packing_slip_id_fkey"
            columns: ["packing_slip_id"]
            isOneToOne: false
            referencedRelation: "packing_slips"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "store_stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      specializations: {
        Row: {
          category: string | null
          code: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
        }
        Insert: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
        }
        Update: {
          category?: string | null
          code?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "specializations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_adjustments: {
        Row: {
          adjusted_by: string | null
          adjustment_type: string
          branch_id: string
          created_at: string
          id: string
          item_id: string
          new_quantity: number
          organization_id: string
          previous_quantity: number
          quantity: number
          reason: string | null
          reference_id: string | null
          reference_type: string | null
        }
        Insert: {
          adjusted_by?: string | null
          adjustment_type: string
          branch_id: string
          created_at?: string
          id?: string
          item_id: string
          new_quantity: number
          organization_id: string
          previous_quantity: number
          quantity: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Update: {
          adjusted_by?: string | null
          adjustment_type?: string
          branch_id?: string
          created_at?: string
          id?: string
          item_id?: string
          new_quantity?: number
          organization_id?: string
          previous_quantity?: number
          quantity?: number
          reason?: string | null
          reference_id?: string | null
          reference_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_adjustments_adjusted_by_fkey"
            columns: ["adjusted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_adjustments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_requisitions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          branch_id: string
          created_at: string
          department_id: string | null
          from_store_id: string | null
          id: string
          issued_at: string | null
          issued_by: string | null
          notes: string | null
          organization_id: string
          priority: number
          request_date: string
          requested_by: string
          required_date: string | null
          requisition_number: string
          status: Database["public"]["Enums"]["requisition_status"]
          to_store_id: string | null
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          department_id?: string | null
          from_store_id?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id: string
          priority?: number
          request_date?: string
          requested_by: string
          required_date?: string | null
          requisition_number: string
          status?: Database["public"]["Enums"]["requisition_status"]
          to_store_id?: string | null
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          department_id?: string | null
          from_store_id?: string | null
          id?: string
          issued_at?: string | null
          issued_by?: string | null
          notes?: string | null
          organization_id?: string
          priority?: number
          request_date?: string
          requested_by?: string
          required_date?: string | null
          requisition_number?: string
          status?: Database["public"]["Enums"]["requisition_status"]
          to_store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_requisitions_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_issued_by_fkey"
            columns: ["issued_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_requisitions_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_racks: {
        Row: {
          capacity_info: Json | null
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          rack_code: string
          rack_name: string | null
          section: string | null
          store_id: string
          updated_at: string
        }
        Insert: {
          capacity_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          rack_code: string
          rack_name?: string | null
          section?: string | null
          store_id: string
          updated_at?: string
        }
        Update: {
          capacity_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          rack_code?: string
          rack_name?: string | null
          section?: string | null
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_racks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_racks_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_stock_transfer_items: {
        Row: {
          batch_number: string | null
          created_at: string
          expiry_date: string | null
          id: string
          item_id: string | null
          item_type: string
          medicine_id: string | null
          notes: string | null
          quantity_received: number
          quantity_requested: number
          quantity_sent: number
          transfer_id: string
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          item_type?: string
          medicine_id?: string | null
          notes?: string | null
          quantity_received?: number
          quantity_requested?: number
          quantity_sent?: number
          transfer_id: string
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          id?: string
          item_id?: string | null
          item_type?: string
          medicine_id?: string | null
          notes?: string | null
          quantity_received?: number
          quantity_requested?: number
          quantity_sent?: number
          transfer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_stock_transfer_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfer_items_transfer_id_fkey"
            columns: ["transfer_id"]
            isOneToOne: false
            referencedRelation: "store_stock_transfers"
            referencedColumns: ["id"]
          },
        ]
      }
      store_stock_transfers: {
        Row: {
          approved_by: string | null
          created_at: string
          dispatched_by: string | null
          from_store_id: string
          id: string
          notes: string | null
          organization_id: string
          received_by: string | null
          request_date: string
          requested_by: string | null
          status: Database["public"]["Enums"]["transfer_status"]
          to_store_id: string
          transfer_number: string
          updated_at: string
        }
        Insert: {
          approved_by?: string | null
          created_at?: string
          dispatched_by?: string | null
          from_store_id: string
          id?: string
          notes?: string | null
          organization_id: string
          received_by?: string | null
          request_date?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_store_id: string
          transfer_number: string
          updated_at?: string
        }
        Update: {
          approved_by?: string | null
          created_at?: string
          dispatched_by?: string | null
          from_store_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          received_by?: string | null
          request_date?: string
          requested_by?: string | null
          status?: Database["public"]["Enums"]["transfer_status"]
          to_store_id?: string
          transfer_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_stock_transfers_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_dispatched_by_fkey"
            columns: ["dispatched_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_from_store_id_fkey"
            columns: ["from_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_received_by_fkey"
            columns: ["received_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_stock_transfers_to_store_id_fkey"
            columns: ["to_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          branch_id: string
          code: string | null
          context: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_central: boolean
          location_info: Json | null
          manager_id: string | null
          name: string
          organization_id: string
          store_type: Database["public"]["Enums"]["store_type"]
          updated_at: string
        }
        Insert: {
          branch_id: string
          code?: string | null
          context?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_central?: boolean
          location_info?: Json | null
          manager_id?: string | null
          name: string
          organization_id: string
          store_type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Update: {
          branch_id?: string
          code?: string | null
          context?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_central?: boolean
          location_info?: Json | null
          manager_id?: string | null
          name?: string
          organization_id?: string
          store_type?: Database["public"]["Enums"]["store_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stores_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stores_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      surgeon_fee_templates: {
        Row: {
          consumables_fee: number
          created_at: string
          created_by: string | null
          default_anesthesia_fee: number
          default_anesthesia_type: string | null
          id: string
          is_active: boolean
          notes: string | null
          nursing_fee: number
          organization_id: string
          ot_room_fee: number
          procedure_code: string | null
          procedure_name: string
          recovery_fee: number
          surgeon_fee: number
          surgeon_id: string
          total_package: number | null
          updated_at: string
        }
        Insert: {
          consumables_fee?: number
          created_at?: string
          created_by?: string | null
          default_anesthesia_fee?: number
          default_anesthesia_type?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          nursing_fee?: number
          organization_id: string
          ot_room_fee?: number
          procedure_code?: string | null
          procedure_name: string
          recovery_fee?: number
          surgeon_fee?: number
          surgeon_id: string
          total_package?: number | null
          updated_at?: string
        }
        Update: {
          consumables_fee?: number
          created_at?: string
          created_by?: string | null
          default_anesthesia_fee?: number
          default_anesthesia_type?: string | null
          id?: string
          is_active?: boolean
          notes?: string | null
          nursing_fee?: number
          organization_id?: string
          ot_room_fee?: number
          procedure_code?: string | null
          procedure_name?: string
          recovery_fee?: number
          surgeon_fee?: number
          surgeon_id?: string
          total_package?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgeon_fee_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeon_fee_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeon_fee_templates_surgeon_id_fkey"
            columns: ["surgeon_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      surgeries: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          admission_id: string | null
          anesthesia_confirmed_at: string | null
          anesthetist_id: string | null
          assistant_surgeon_id: string | null
          blood_reservation: Json | null
          branch_id: string
          cancellation_reason: string | null
          consent_document_url: string | null
          consent_signed: boolean | null
          consent_signed_at: string | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          equipment_needed: Json | null
          estimated_cost: number | null
          estimated_duration_minutes: number | null
          fee_template_id: string | null
          id: string
          invoice_id: string | null
          is_billable: boolean | null
          laterality: string | null
          lead_surgeon_id: string | null
          npo_from: string | null
          organization_id: string
          ot_room_id: string | null
          outcome: string | null
          outcome_notes: string | null
          outcome_recorded_at: string | null
          outcome_recorded_by: string | null
          patient_id: string
          post_op_destination: string | null
          post_op_instructions: string | null
          postponement_reason: string | null
          pre_op_medications_ordered: boolean | null
          pre_op_supplies_ready: boolean | null
          priority: Database["public"]["Enums"]["surgery_priority"]
          priority_id: string | null
          procedure_code: string | null
          procedure_id: string | null
          procedure_name: string
          procedure_type: string | null
          ready_at: string | null
          ready_by: string | null
          rescheduled_from: string | null
          scheduled_date: string
          scheduled_end_time: string | null
          scheduled_start_time: string
          special_requirements: string | null
          status: Database["public"]["Enums"]["surgery_status"]
          surgeon_confirmed_at: string | null
          surgery_charges: Json | null
          surgery_number: string
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admission_id?: string | null
          anesthesia_confirmed_at?: string | null
          anesthetist_id?: string | null
          assistant_surgeon_id?: string | null
          blood_reservation?: Json | null
          branch_id: string
          cancellation_reason?: string | null
          consent_document_url?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          equipment_needed?: Json | null
          estimated_cost?: number | null
          estimated_duration_minutes?: number | null
          fee_template_id?: string | null
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          laterality?: string | null
          lead_surgeon_id?: string | null
          npo_from?: string | null
          organization_id: string
          ot_room_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          outcome_recorded_at?: string | null
          outcome_recorded_by?: string | null
          patient_id: string
          post_op_destination?: string | null
          post_op_instructions?: string | null
          postponement_reason?: string | null
          pre_op_medications_ordered?: boolean | null
          pre_op_supplies_ready?: boolean | null
          priority?: Database["public"]["Enums"]["surgery_priority"]
          priority_id?: string | null
          procedure_code?: string | null
          procedure_id?: string | null
          procedure_name: string
          procedure_type?: string | null
          ready_at?: string | null
          ready_by?: string | null
          rescheduled_from?: string | null
          scheduled_date: string
          scheduled_end_time?: string | null
          scheduled_start_time: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["surgery_status"]
          surgeon_confirmed_at?: string | null
          surgery_charges?: Json | null
          surgery_number: string
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admission_id?: string | null
          anesthesia_confirmed_at?: string | null
          anesthetist_id?: string | null
          assistant_surgeon_id?: string | null
          blood_reservation?: Json | null
          branch_id?: string
          cancellation_reason?: string | null
          consent_document_url?: string | null
          consent_signed?: boolean | null
          consent_signed_at?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          equipment_needed?: Json | null
          estimated_cost?: number | null
          estimated_duration_minutes?: number | null
          fee_template_id?: string | null
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          laterality?: string | null
          lead_surgeon_id?: string | null
          npo_from?: string | null
          organization_id?: string
          ot_room_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          outcome_recorded_at?: string | null
          outcome_recorded_by?: string | null
          patient_id?: string
          post_op_destination?: string | null
          post_op_instructions?: string | null
          postponement_reason?: string | null
          pre_op_medications_ordered?: boolean | null
          pre_op_supplies_ready?: boolean | null
          priority?: Database["public"]["Enums"]["surgery_priority"]
          priority_id?: string | null
          procedure_code?: string | null
          procedure_id?: string | null
          procedure_name?: string
          procedure_type?: string | null
          ready_at?: string | null
          ready_by?: string | null
          rescheduled_from?: string | null
          scheduled_date?: string
          scheduled_end_time?: string | null
          scheduled_start_time?: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["surgery_status"]
          surgeon_confirmed_at?: string | null
          surgery_charges?: Json | null
          surgery_number?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgeries_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_anesthetist_id_fkey"
            columns: ["anesthetist_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_assistant_surgeon_id_fkey"
            columns: ["assistant_surgeon_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_fee_template_id_fkey"
            columns: ["fee_template_id"]
            isOneToOne: false
            referencedRelation: "surgeon_fee_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_lead_surgeon_id_fkey"
            columns: ["lead_surgeon_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_ot_room_id_fkey"
            columns: ["ot_room_id"]
            isOneToOne: false
            referencedRelation: "ot_rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_priority_id_fkey"
            columns: ["priority_id"]
            isOneToOne: false
            referencedRelation: "config_surgery_priorities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_procedure_id_fkey"
            columns: ["procedure_id"]
            isOneToOne: false
            referencedRelation: "config_surgical_procedures"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_ready_by_fkey"
            columns: ["ready_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgeries_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_consents: {
        Row: {
          alternatives_explained: string | null
          consent_template: string | null
          consent_type: string
          created_at: string | null
          explained_by: string | null
          id: string
          is_valid: boolean | null
          organization_id: string
          patient_questions: string | null
          patient_relationship: string | null
          patient_signature: string | null
          patient_signed_at: string | null
          procedure_explained: string | null
          revocation_reason: string | null
          revoked_at: string | null
          risks_explained: string | null
          surgery_id: string
          updated_at: string | null
          witness_name: string | null
          witness_signature: string | null
          witness_signed_at: string | null
        }
        Insert: {
          alternatives_explained?: string | null
          consent_template?: string | null
          consent_type: string
          created_at?: string | null
          explained_by?: string | null
          id?: string
          is_valid?: boolean | null
          organization_id: string
          patient_questions?: string | null
          patient_relationship?: string | null
          patient_signature?: string | null
          patient_signed_at?: string | null
          procedure_explained?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          risks_explained?: string | null
          surgery_id: string
          updated_at?: string | null
          witness_name?: string | null
          witness_signature?: string | null
          witness_signed_at?: string | null
        }
        Update: {
          alternatives_explained?: string | null
          consent_template?: string | null
          consent_type?: string
          created_at?: string | null
          explained_by?: string | null
          id?: string
          is_valid?: boolean | null
          organization_id?: string
          patient_questions?: string | null
          patient_relationship?: string | null
          patient_signature?: string | null
          patient_signed_at?: string | null
          procedure_explained?: string | null
          revocation_reason?: string | null
          revoked_at?: string | null
          risks_explained?: string | null
          surgery_id?: string
          updated_at?: string | null
          witness_name?: string | null
          witness_signature?: string | null
          witness_signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgery_consents_explained_by_fkey"
            columns: ["explained_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consents_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_consumables: {
        Row: {
          added_by: string | null
          batch_number: string | null
          billed_to_invoice_id: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          implant_location: string | null
          implant_size: string | null
          inventory_item_id: string | null
          is_billable: boolean | null
          is_implant: boolean | null
          item_category: string | null
          item_name: string
          lot_number: string | null
          manufacturer: string | null
          organization_id: string
          quantity: number
          serial_number: string | null
          surgery_id: string
          total_price: number | null
          unit: string | null
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          added_by?: string | null
          batch_number?: string | null
          billed_to_invoice_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          implant_location?: string | null
          implant_size?: string | null
          inventory_item_id?: string | null
          is_billable?: boolean | null
          is_implant?: boolean | null
          item_category?: string | null
          item_name: string
          lot_number?: string | null
          manufacturer?: string | null
          organization_id: string
          quantity?: number
          serial_number?: string | null
          surgery_id: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          added_by?: string | null
          batch_number?: string | null
          billed_to_invoice_id?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          implant_location?: string | null
          implant_size?: string | null
          inventory_item_id?: string | null
          is_billable?: boolean | null
          is_implant?: boolean | null
          item_category?: string | null
          item_name?: string
          lot_number?: string | null
          manufacturer?: string | null
          organization_id?: string
          quantity?: number
          serial_number?: string | null
          surgery_id?: string
          total_price?: number | null
          unit?: string | null
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgery_consumables_added_by_fkey"
            columns: ["added_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consumables_billed_to_invoice_id_fkey"
            columns: ["billed_to_invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consumables_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consumables_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_consumables_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_medications: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          approved_at: string | null
          approved_by: string | null
          batch_number: string | null
          billing_status: string | null
          created_at: string | null
          dispensed_at: string | null
          dispensed_by: string | null
          dosage: string | null
          hold_reason: string | null
          id: string
          inventory_item_id: string | null
          is_billed: boolean | null
          medication_name: string
          notes: string | null
          ordered_at: string | null
          ordered_by: string | null
          organization_id: string
          pharmacy_status: string | null
          rejection_reason: string | null
          route: string | null
          scheduled_time: string | null
          status: string
          surgery_id: string
          timing: string
          unit_price: number | null
          updated_at: string | null
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          billing_status?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage?: string | null
          hold_reason?: string | null
          id?: string
          inventory_item_id?: string | null
          is_billed?: boolean | null
          medication_name: string
          notes?: string | null
          ordered_at?: string | null
          ordered_by?: string | null
          organization_id: string
          pharmacy_status?: string | null
          rejection_reason?: string | null
          route?: string | null
          scheduled_time?: string | null
          status?: string
          surgery_id: string
          timing?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          approved_at?: string | null
          approved_by?: string | null
          batch_number?: string | null
          billing_status?: string | null
          created_at?: string | null
          dispensed_at?: string | null
          dispensed_by?: string | null
          dosage?: string | null
          hold_reason?: string | null
          id?: string
          inventory_item_id?: string | null
          is_billed?: boolean | null
          medication_name?: string
          notes?: string | null
          ordered_at?: string | null
          ordered_by?: string | null
          organization_id?: string
          pharmacy_status?: string | null
          rejection_reason?: string | null
          route?: string | null
          scheduled_time?: string | null
          status?: string
          surgery_id?: string
          timing?: string
          unit_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgery_medications_administered_by_fkey"
            columns: ["administered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_dispensed_by_fkey"
            columns: ["dispensed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_inventory_item_id_fkey"
            columns: ["inventory_item_id"]
            isOneToOne: false
            referencedRelation: "medicine_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_ordered_by_fkey"
            columns: ["ordered_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_medications_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_requests: {
        Row: {
          admission_id: string | null
          branch_id: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          clinical_notes: string | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          diagnosis: string | null
          estimated_duration_minutes: number | null
          id: string
          organization_id: string
          patient_id: string
          preferred_date_from: string | null
          preferred_date_to: string | null
          priority: string | null
          procedure_name: string
          recommended_by: string | null
          recommended_date: string | null
          request_status: string | null
          surgery_id: string | null
          updated_at: string | null
        }
        Insert: {
          admission_id?: string | null
          branch_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinical_notes?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          organization_id: string
          patient_id: string
          preferred_date_from?: string | null
          preferred_date_to?: string | null
          priority?: string | null
          procedure_name: string
          recommended_by?: string | null
          recommended_date?: string | null
          request_status?: string | null
          surgery_id?: string | null
          updated_at?: string | null
        }
        Update: {
          admission_id?: string | null
          branch_id?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          clinical_notes?: string | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          diagnosis?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          organization_id?: string
          patient_id?: string
          preferred_date_from?: string | null
          preferred_date_to?: string | null
          priority?: string | null
          procedure_name?: string
          recommended_by?: string | null
          recommended_date?: string | null
          request_status?: string | null
          surgery_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgery_requests_admission_id_fkey"
            columns: ["admission_id"]
            isOneToOne: false
            referencedRelation: "admissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_recommended_by_fkey"
            columns: ["recommended_by"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_requests_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_reschedule_requests: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string
          original_date: string
          original_time: string
          proposed_date: string | null
          proposed_time: string | null
          reason: string
          reason_category: string | null
          requested_by: string
          requested_by_role: string
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          surgery_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id: string
          original_date: string
          original_time: string
          proposed_date?: string | null
          proposed_time?: string | null
          reason: string
          reason_category?: string | null
          requested_by: string
          requested_by_role: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          surgery_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string
          original_date?: string
          original_time?: string
          proposed_date?: string | null
          proposed_time?: string | null
          reason?: string
          reason_category?: string | null
          requested_by?: string
          requested_by_role?: string
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          surgery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgery_reschedule_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_reschedule_requests_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_reschedule_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_reschedule_requests_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgery_team_members: {
        Row: {
          confirmation_status: string | null
          confirmed_at: string | null
          created_at: string | null
          declined_reason: string | null
          doctor_id: string | null
          employee_id: string | null
          id: string
          is_confirmed: boolean | null
          notes: string | null
          nurse_id: string | null
          proposed_reschedule_time: string | null
          reschedule_notes: string | null
          role: Database["public"]["Enums"]["surgery_team_role"]
          staff_id: string | null
          surgery_id: string
        }
        Insert: {
          confirmation_status?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          declined_reason?: string | null
          doctor_id?: string | null
          employee_id?: string | null
          id?: string
          is_confirmed?: boolean | null
          notes?: string | null
          nurse_id?: string | null
          proposed_reschedule_time?: string | null
          reschedule_notes?: string | null
          role: Database["public"]["Enums"]["surgery_team_role"]
          staff_id?: string | null
          surgery_id: string
        }
        Update: {
          confirmation_status?: string | null
          confirmed_at?: string | null
          created_at?: string | null
          declined_reason?: string | null
          doctor_id?: string | null
          employee_id?: string | null
          id?: string
          is_confirmed?: boolean | null
          notes?: string | null
          nurse_id?: string | null
          proposed_reschedule_time?: string | null
          reschedule_notes?: string | null
          role?: Database["public"]["Enums"]["surgery_team_role"]
          staff_id?: string | null
          surgery_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "surgery_team_members_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_team_members_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_team_members_nurse_id_fkey"
            columns: ["nurse_id"]
            isOneToOne: false
            referencedRelation: "nurses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_team_members_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgery_team_members_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: false
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
        ]
      }
      surgical_safety_checklists: {
        Row: {
          created_at: string | null
          id: string
          sign_in_by: string | null
          sign_in_completed: boolean | null
          sign_in_data: Json | null
          sign_in_time: string | null
          sign_out_by: string | null
          sign_out_completed: boolean | null
          sign_out_data: Json | null
          sign_out_time: string | null
          surgery_id: string
          time_out_by: string | null
          time_out_completed: boolean | null
          time_out_data: Json | null
          time_out_time: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          sign_in_by?: string | null
          sign_in_completed?: boolean | null
          sign_in_data?: Json | null
          sign_in_time?: string | null
          sign_out_by?: string | null
          sign_out_completed?: boolean | null
          sign_out_data?: Json | null
          sign_out_time?: string | null
          surgery_id: string
          time_out_by?: string | null
          time_out_completed?: boolean | null
          time_out_data?: Json | null
          time_out_time?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          sign_in_by?: string | null
          sign_in_completed?: boolean | null
          sign_in_data?: Json | null
          sign_in_time?: string | null
          sign_out_by?: string | null
          sign_out_completed?: boolean | null
          sign_out_data?: Json | null
          sign_out_time?: string | null
          surgery_id?: string
          time_out_by?: string | null
          time_out_completed?: boolean | null
          time_out_data?: Json | null
          time_out_time?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surgical_safety_checklists_sign_in_by_fkey"
            columns: ["sign_in_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgical_safety_checklists_sign_out_by_fkey"
            columns: ["sign_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgical_safety_checklists_surgery_id_fkey"
            columns: ["surgery_id"]
            isOneToOne: true
            referencedRelation: "surgeries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "surgical_safety_checklists_time_out_by_fkey"
            columns: ["time_out_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      tatmeen_transactions: {
        Row: {
          batch_number: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          expiry_date: string | null
          gtin: string
          id: string
          organization_id: string
          patient_id: string | null
          pharmacy_item_id: string | null
          prescription_id: string | null
          quantity: number
          serial_number: string | null
          submission_response: Json | null
          submission_status: string
          submitted_at: string | null
          tatmeen_reference_id: string | null
          transaction_type: string
        }
        Insert: {
          batch_number?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          gtin: string
          id?: string
          organization_id: string
          patient_id?: string | null
          pharmacy_item_id?: string | null
          prescription_id?: string | null
          quantity?: number
          serial_number?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          tatmeen_reference_id?: string | null
          transaction_type: string
        }
        Update: {
          batch_number?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          expiry_date?: string | null
          gtin?: string
          id?: string
          organization_id?: string
          patient_id?: string | null
          pharmacy_item_id?: string | null
          prescription_id?: string | null
          quantity?: number
          serial_number?: string | null
          submission_response?: Json | null
          submission_status?: string
          submitted_at?: string | null
          tatmeen_reference_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tatmeen_transactions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tatmeen_transactions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tatmeen_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tatmeen_transactions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
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
      transfusion_reactions: {
        Row: {
          actions_taken: string | null
          created_at: string | null
          id: string
          investigated_by: string | null
          investigation_notes: string | null
          medications_given: Json | null
          organization_id: string
          outcome: string | null
          patient_stable: boolean | null
          reaction_time: string
          reaction_type: string
          reported_by: string | null
          root_cause: string | null
          severity: Database["public"]["Enums"]["reaction_severity"]
          symptoms: Json | null
          transfusion_id: string
          transfusion_stopped: boolean | null
          vitals_at_reaction: Json | null
        }
        Insert: {
          actions_taken?: string | null
          created_at?: string | null
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          medications_given?: Json | null
          organization_id: string
          outcome?: string | null
          patient_stable?: boolean | null
          reaction_time?: string
          reaction_type: string
          reported_by?: string | null
          root_cause?: string | null
          severity: Database["public"]["Enums"]["reaction_severity"]
          symptoms?: Json | null
          transfusion_id: string
          transfusion_stopped?: boolean | null
          vitals_at_reaction?: Json | null
        }
        Update: {
          actions_taken?: string | null
          created_at?: string | null
          id?: string
          investigated_by?: string | null
          investigation_notes?: string | null
          medications_given?: Json | null
          organization_id?: string
          outcome?: string | null
          patient_stable?: boolean | null
          reaction_time?: string
          reaction_type?: string
          reported_by?: string | null
          root_cause?: string | null
          severity?: Database["public"]["Enums"]["reaction_severity"]
          symptoms?: Json | null
          transfusion_id?: string
          transfusion_stopped?: boolean | null
          vitals_at_reaction?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "transfusion_reactions_investigated_by_fkey"
            columns: ["investigated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfusion_reactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfusion_reactions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfusion_reactions_transfusion_id_fkey"
            columns: ["transfusion_id"]
            isOneToOne: false
            referencedRelation: "blood_transfusions"
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
      vaccination_records: {
        Row: {
          administered_at: string | null
          administered_by: string | null
          administered_date: string
          batch_number: string | null
          certificate_url: string | null
          created_at: string | null
          dose_number: number | null
          employee_id: string
          id: string
          next_due_date: string | null
          notes: string | null
          organization_id: string
          vaccine_name: string
          vaccine_type: string | null
        }
        Insert: {
          administered_at?: string | null
          administered_by?: string | null
          administered_date: string
          batch_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          dose_number?: number | null
          employee_id: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id: string
          vaccine_name: string
          vaccine_type?: string | null
        }
        Update: {
          administered_at?: string | null
          administered_by?: string | null
          administered_date?: string
          batch_number?: string | null
          certificate_url?: string | null
          created_at?: string | null
          dose_number?: number | null
          employee_id?: string
          id?: string
          next_due_date?: string | null
          notes?: string | null
          organization_id?: string
          vaccine_name?: string
          vaccine_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccination_records_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccination_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_documents: {
        Row: {
          created_at: string
          document_name: string
          document_type: string
          expiry_date: string | null
          file_url: string | null
          id: string
          organization_id: string
          status: string
          uploaded_by: string | null
          vendor_id: string
        }
        Insert: {
          created_at?: string
          document_name: string
          document_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          organization_id: string
          status?: string
          uploaded_by?: string | null
          vendor_id: string
        }
        Update: {
          created_at?: string
          document_name?: string
          document_type?: string
          expiry_date?: string | null
          file_url?: string | null
          id?: string
          organization_id?: string
          status?: string
          uploaded_by?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payments: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          bank_account_id: string | null
          branch_id: string | null
          created_at: string
          created_by: string | null
          grn_id: string | null
          id: string
          journal_entry_id: string | null
          notes: string | null
          organization_id: string
          payment_date: string
          payment_method_id: string | null
          payment_number: string
          purchase_order_id: string | null
          reference_number: string | null
          status: string
          updated_at: string
          vendor_id: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          grn_id?: string | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          organization_id: string
          payment_date: string
          payment_method_id?: string | null
          payment_number: string
          purchase_order_id?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
          vendor_id: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          bank_account_id?: string | null
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          grn_id?: string | null
          id?: string
          journal_entry_id?: string | null
          notes?: string | null
          organization_id?: string
          payment_date?: string
          payment_method_id?: string | null
          payment_number?: string
          purchase_order_id?: string | null
          reference_number?: string | null
          status?: string
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payments_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_grn_id_fkey"
            columns: ["grn_id"]
            isOneToOne: false
            referencedRelation: "goods_received_notes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            isOneToOne: false
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_purchase_order_id_fkey"
            columns: ["purchase_order_id"]
            isOneToOne: false
            referencedRelation: "purchase_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string | null
          bank_details: Json | null
          city: string | null
          contact_person: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          is_preferred: boolean | null
          ledger_account_id: string | null
          name: string
          notes: string | null
          organization_id: string
          payment_terms: string | null
          phone: string | null
          rating: number | null
          tax_number: string | null
          updated_at: string
          vendor_code: string
          vendor_type: string | null
        }
        Insert: {
          address?: string | null
          bank_details?: Json | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_preferred?: boolean | null
          ledger_account_id?: string | null
          name: string
          notes?: string | null
          organization_id: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
          vendor_code: string
          vendor_type?: string | null
        }
        Update: {
          address?: string | null
          bank_details?: Json | null
          city?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          is_preferred?: boolean | null
          ledger_account_id?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          tax_number?: string | null
          updated_at?: string
          vendor_code?: string
          vendor_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_ledger_account_id_fkey"
            columns: ["ledger_account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
          room_section: string | null
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
          room_section?: string | null
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
          room_section?: string | null
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
      warehouse_bins: {
        Row: {
          bin_code: string
          bin_type: string
          created_at: string
          current_volume: number | null
          current_weight: number | null
          id: string
          is_active: boolean
          is_occupied: boolean
          max_volume: number | null
          max_weight: number | null
          organization_id: string
          rack_id: string | null
          store_id: string
          updated_at: string
          zone_id: string | null
        }
        Insert: {
          bin_code: string
          bin_type?: string
          created_at?: string
          current_volume?: number | null
          current_weight?: number | null
          id?: string
          is_active?: boolean
          is_occupied?: boolean
          max_volume?: number | null
          max_weight?: number | null
          organization_id: string
          rack_id?: string | null
          store_id: string
          updated_at?: string
          zone_id?: string | null
        }
        Update: {
          bin_code?: string
          bin_type?: string
          created_at?: string
          current_volume?: number | null
          current_weight?: number | null
          id?: string
          is_active?: boolean
          is_occupied?: boolean
          max_volume?: number | null
          max_weight?: number | null
          organization_id?: string
          rack_id?: string | null
          store_id?: string
          updated_at?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_bins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_bins_rack_id_fkey"
            columns: ["rack_id"]
            isOneToOne: false
            referencedRelation: "store_racks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_bins_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_bins_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "warehouse_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_order_items: {
        Row: {
          id: string
          item_id: string | null
          notes: string | null
          order_id: string
          packed_quantity: number
          picked_quantity: number
          quantity: number
        }
        Insert: {
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id: string
          packed_quantity?: number
          picked_quantity?: number
          quantity?: number
        }
        Update: {
          id?: string
          item_id?: string | null
          notes?: string | null
          order_id?: string
          packed_quantity?: number
          picked_quantity?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_order_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "warehouse_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_orders: {
        Row: {
          created_at: string
          created_by: string | null
          customer_address: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_date: string
          order_number: string
          organization_id: string
          required_date: string | null
          status: string
          store_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number: string
          organization_id: string
          required_date?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          customer_address?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_date?: string
          order_number?: string
          organization_id?: string
          required_date?: string | null
          status?: string
          store_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_orders_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      warehouse_zones: {
        Row: {
          capacity_info: Json | null
          created_at: string
          id: string
          is_active: boolean
          organization_id: string
          store_id: string
          temperature_range: string | null
          updated_at: string
          zone_code: string
          zone_name: string
          zone_type: string
        }
        Insert: {
          capacity_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id: string
          store_id: string
          temperature_range?: string | null
          updated_at?: string
          zone_code: string
          zone_name: string
          zone_type?: string
        }
        Update: {
          capacity_info?: Json | null
          created_at?: string
          id?: string
          is_active?: boolean
          organization_id?: string
          store_id?: string
          temperature_range?: string | null
          updated_at?: string
          zone_code?: string
          zone_name?: string
          zone_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "warehouse_zones_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "warehouse_zones_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      wasfaty_prescriptions: {
        Row: {
          branch_id: string | null
          consultation_id: string | null
          created_at: string | null
          diagnosis_codes: string[] | null
          dispensed_at: string | null
          dispensing_pharmacy: string | null
          doctor_id: string | null
          error_message: string | null
          id: string
          medications: Json
          organization_id: string
          patient_id: string
          prescription_id: string | null
          response_data: Json | null
          submitted_at: string | null
          submitted_by: string | null
          updated_at: string | null
          wasfaty_prescription_id: string | null
          wasfaty_status: string | null
        }
        Insert: {
          branch_id?: string | null
          consultation_id?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          dispensed_at?: string | null
          dispensing_pharmacy?: string | null
          doctor_id?: string | null
          error_message?: string | null
          id?: string
          medications?: Json
          organization_id: string
          patient_id: string
          prescription_id?: string | null
          response_data?: Json | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          wasfaty_prescription_id?: string | null
          wasfaty_status?: string | null
        }
        Update: {
          branch_id?: string | null
          consultation_id?: string | null
          created_at?: string | null
          diagnosis_codes?: string[] | null
          dispensed_at?: string | null
          dispensing_pharmacy?: string | null
          doctor_id?: string | null
          error_message?: string | null
          id?: string
          medications?: Json
          organization_id?: string
          patient_id?: string
          prescription_id?: string | null
          response_data?: Json | null
          submitted_at?: string | null
          submitted_by?: string | null
          updated_at?: string | null
          wasfaty_prescription_id?: string | null
          wasfaty_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wasfaty_prescriptions_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wasfaty_prescriptions_submitted_by_fkey"
            columns: ["submitted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      create_coa_hierarchy: { Args: { p_org_id: string }; Returns: undefined }
      create_kiosk_session: {
        Args: {
          p_device_info?: Json
          p_ip_address?: string
          p_kiosk_id: string
        }
        Returns: {
          session_id: string
          session_token: string
        }[]
      }
      find_opd_department_by_specialization: {
        Args: { p_branch_id: string; p_specialization_id: string }
        Returns: string
      }
      generate_claim_number: { Args: { org_id: string }; Returns: string }
      generate_closing_number: {
        Args: { p_branch_id: string; p_date: string; p_org_id: string }
        Returns: string
      }
      generate_expense_number: { Args: { p_org_id: string }; Returns: string }
      generate_kiosk_username: {
        Args: { kiosk_name: string; org_id: string }
        Returns: string
      }
      generate_opd_token: {
        Args: {
          p_appointment_date: string
          p_branch_id: string
          p_opd_department_id: string
        }
        Returns: {
          token_display: string
          token_number: number
        }[]
      }
      generate_session_number: { Args: { p_org_id: string }; Returns: string }
      generate_surgery_number: {
        Args: { branch_id: string; org_id: string }
        Returns: string
      }
      get_or_create_default_account: {
        Args: {
          p_account_code: string
          p_account_name: string
          p_account_type_category?: string
          p_organization_id: string
        }
        Returns: string
      }
      get_patient_for_published_lab_order: {
        Args: { p_patient_id: string }
        Returns: {
          first_name: string
          id: string
          last_name: string
        }[]
      }
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
      hash_kiosk_password: { Args: { password: string }; Returns: string }
      is_super_admin: { Args: never; Returns: boolean }
      log_kiosk_token: {
        Args: {
          p_appointment_id: string
          p_department: string
          p_doctor_name: string
          p_kiosk_id: string
          p_organization_id: string
          p_patient_name: string
          p_patient_phone: string
          p_priority?: number
          p_session_id: string
          p_token_number: number
        }
        Returns: string
      }
      set_org_language: {
        Args: { p_language: string; p_supported_languages: string[] }
        Returns: undefined
      }
      validate_kiosk_session: {
        Args: { p_session_token: string }
        Returns: {
          departments: string[]
          display_message: string
          kiosk_id: string
          kiosk_name: string
          kiosk_type: string
          organization_id: string
          session_id: string
          valid: boolean
        }[]
      }
      verify_kiosk_password: {
        Args: { kiosk_id: string; password: string }
        Returns: boolean
      }
    }
    Enums: {
      admission_status:
        | "pending"
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
      ai_context_type: "patient_intake" | "doctor_assist" | "general"
      ai_suggestion_type:
        | "diagnosis"
        | "prescription"
        | "lab_order"
        | "soap_note"
      ambulance_status: "incoming" | "arrived" | "cancelled"
      anesthesia_type:
        | "general"
        | "spinal"
        | "epidural"
        | "local"
        | "regional"
        | "sedation"
        | "combined"
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
        | "blood_bank_technician"
        | "radiologist"
        | "radiology_technician"
        | "ipd_nurse"
        | "ot_technician"
        | "ot_nurse"
        | "surgeon"
        | "anesthetist"
        | "ot_pharmacist"
        | "opd_nurse"
        | "warehouse_admin"
        | "warehouse_user"
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
      asa_class: "I" | "II" | "III" | "IV" | "V" | "VI"
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
      blood_component_type:
        | "whole_blood"
        | "packed_rbc"
        | "fresh_frozen_plasma"
        | "platelet_concentrate"
        | "cryoprecipitate"
        | "granulocytes"
      blood_group_type: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-"
      blood_request_priority: "routine" | "urgent" | "emergency"
      blood_request_status:
        | "pending"
        | "processing"
        | "cross_matching"
        | "ready"
        | "issued"
        | "completed"
        | "cancelled"
      blood_unit_status:
        | "quarantine"
        | "available"
        | "reserved"
        | "cross_matched"
        | "issued"
        | "transfused"
        | "discarded"
        | "expired"
      cross_match_result: "compatible" | "incompatible" | "pending"
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
      donation_status:
        | "screening"
        | "collecting"
        | "processing"
        | "completed"
        | "rejected"
      donor_status: "active" | "inactive" | "deferred" | "permanently_deferred"
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
      grn_status: "draft" | "pending_verification" | "verified" | "posted"
      imaging_finding_status: "normal" | "abnormal" | "critical"
      imaging_modality:
        | "xray"
        | "ultrasound"
        | "ct_scan"
        | "mri"
        | "fluoroscopy"
        | "mammography"
        | "dexa"
        | "ecg"
        | "echo"
        | "pet_ct"
        | "other"
      imaging_order_status:
        | "ordered"
        | "scheduled"
        | "in_progress"
        | "completed"
        | "reported"
        | "verified"
        | "cancelled"
      imaging_priority: "routine" | "urgent" | "stat"
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
      medical_code_type:
        | "icd10"
        | "cpt"
        | "drg"
        | "achi"
        | "sbs"
        | "snomed"
        | "loinc"
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
      ot_room_status:
        | "available"
        | "occupied"
        | "cleaning"
        | "maintenance"
        | "reserved"
      payroll_run_status: "draft" | "processing" | "completed" | "cancelled"
      po_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "ordered"
        | "partially_received"
        | "received"
        | "cancelled"
      pr_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "converted"
      prescription_status:
        | "created"
        | "dispensed"
        | "partially_dispensed"
        | "cancelled"
      reaction_severity: "mild" | "moderate" | "severe" | "fatal"
      requisition_status:
        | "draft"
        | "pending"
        | "approved"
        | "partially_issued"
        | "issued"
        | "rejected"
        | "cancelled"
      salary_component_type: "earning" | "deduction"
      service_category:
        | "consultation"
        | "procedure"
        | "lab"
        | "pharmacy"
        | "room"
        | "other"
        | "radiology"
      setting_type: "string" | "number" | "boolean" | "json"
      shift_type:
        | "morning"
        | "evening"
        | "night"
        | "rotational"
        | "flexible"
        | "general"
      store_type:
        | "central"
        | "medical"
        | "surgical"
        | "dental"
        | "equipment"
        | "pharmacy"
        | "general"
      subscription_plan: "basic" | "professional" | "enterprise"
      subscription_status: "trial" | "active" | "suspended" | "cancelled"
      surgery_priority: "emergency" | "urgent" | "elective"
      surgery_status:
        | "scheduled"
        | "requested"
        | "booked"
        | "confirmed"
        | "on_hold"
        | "pre_op"
        | "ready"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "postponed"
      surgery_team_role:
        | "lead_surgeon"
        | "assistant_surgeon"
        | "anesthetist"
        | "scrub_nurse"
        | "circulating_nurse"
        | "technician"
      transfer_status:
        | "draft"
        | "pending"
        | "approved"
        | "in_transit"
        | "received"
        | "cancelled"
      transfusion_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "stopped"
        | "cancelled"
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
        "pending",
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
      ai_context_type: ["patient_intake", "doctor_assist", "general"],
      ai_suggestion_type: [
        "diagnosis",
        "prescription",
        "lab_order",
        "soap_note",
      ],
      ambulance_status: ["incoming", "arrived", "cancelled"],
      anesthesia_type: [
        "general",
        "spinal",
        "epidural",
        "local",
        "regional",
        "sedation",
        "combined",
      ],
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
        "blood_bank_technician",
        "radiologist",
        "radiology_technician",
        "ipd_nurse",
        "ot_technician",
        "ot_nurse",
        "surgeon",
        "anesthetist",
        "ot_pharmacist",
        "opd_nurse",
        "warehouse_admin",
        "warehouse_user",
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
      asa_class: ["I", "II", "III", "IV", "V", "VI"],
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
      blood_component_type: [
        "whole_blood",
        "packed_rbc",
        "fresh_frozen_plasma",
        "platelet_concentrate",
        "cryoprecipitate",
        "granulocytes",
      ],
      blood_group_type: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      blood_request_priority: ["routine", "urgent", "emergency"],
      blood_request_status: [
        "pending",
        "processing",
        "cross_matching",
        "ready",
        "issued",
        "completed",
        "cancelled",
      ],
      blood_unit_status: [
        "quarantine",
        "available",
        "reserved",
        "cross_matched",
        "issued",
        "transfused",
        "discarded",
        "expired",
      ],
      cross_match_result: ["compatible", "incompatible", "pending"],
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
      donation_status: [
        "screening",
        "collecting",
        "processing",
        "completed",
        "rejected",
      ],
      donor_status: ["active", "inactive", "deferred", "permanently_deferred"],
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
      grn_status: ["draft", "pending_verification", "verified", "posted"],
      imaging_finding_status: ["normal", "abnormal", "critical"],
      imaging_modality: [
        "xray",
        "ultrasound",
        "ct_scan",
        "mri",
        "fluoroscopy",
        "mammography",
        "dexa",
        "ecg",
        "echo",
        "pet_ct",
        "other",
      ],
      imaging_order_status: [
        "ordered",
        "scheduled",
        "in_progress",
        "completed",
        "reported",
        "verified",
        "cancelled",
      ],
      imaging_priority: ["routine", "urgent", "stat"],
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
      medical_code_type: [
        "icd10",
        "cpt",
        "drg",
        "achi",
        "sbs",
        "snomed",
        "loinc",
      ],
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
      ot_room_status: [
        "available",
        "occupied",
        "cleaning",
        "maintenance",
        "reserved",
      ],
      payroll_run_status: ["draft", "processing", "completed", "cancelled"],
      po_status: [
        "draft",
        "pending_approval",
        "approved",
        "ordered",
        "partially_received",
        "received",
        "cancelled",
      ],
      pr_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "converted",
      ],
      prescription_status: [
        "created",
        "dispensed",
        "partially_dispensed",
        "cancelled",
      ],
      reaction_severity: ["mild", "moderate", "severe", "fatal"],
      requisition_status: [
        "draft",
        "pending",
        "approved",
        "partially_issued",
        "issued",
        "rejected",
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
        "radiology",
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
      store_type: [
        "central",
        "medical",
        "surgical",
        "dental",
        "equipment",
        "pharmacy",
        "general",
      ],
      subscription_plan: ["basic", "professional", "enterprise"],
      subscription_status: ["trial", "active", "suspended", "cancelled"],
      surgery_priority: ["emergency", "urgent", "elective"],
      surgery_status: [
        "scheduled",
        "requested",
        "booked",
        "confirmed",
        "on_hold",
        "pre_op",
        "ready",
        "in_progress",
        "completed",
        "cancelled",
        "postponed",
      ],
      surgery_team_role: [
        "lead_surgeon",
        "assistant_surgeon",
        "anesthetist",
        "scrub_nurse",
        "circulating_nurse",
        "technician",
      ],
      transfer_status: [
        "draft",
        "pending",
        "approved",
        "in_transit",
        "received",
        "cancelled",
      ],
      transfusion_status: [
        "scheduled",
        "in_progress",
        "completed",
        "stopped",
        "cancelled",
      ],
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
