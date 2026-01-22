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
          account_number: string
          account_type_id: string
          branch_id: string | null
          created_at: string
          created_by: string | null
          current_balance: number
          description: string | null
          id: string
          is_active: boolean
          is_system: boolean
          name: string
          opening_balance: number
          opening_balance_date: string | null
          organization_id: string
          parent_account_id: string | null
          updated_at: string
        }
        Insert: {
          account_number: string
          account_type_id: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_system?: boolean
          name: string
          opening_balance?: number
          opening_balance_date?: string | null
          organization_id: string
          parent_account_id?: string | null
          updated_at?: string
        }
        Update: {
          account_number?: string
          account_type_id?: string
          branch_id?: string | null
          created_at?: string
          created_by?: string | null
          current_balance?: number
          description?: string | null
          id?: string
          is_active?: boolean
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
          organization_id: string
          patient_id: string
          payment_status: string | null
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
          invoice_id?: string | null
          kiosk_id?: string | null
          notes?: string | null
          organization_id: string
          patient_id: string
          payment_status?: string | null
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
          invoice_id?: string | null
          kiosk_id?: string | null
          notes?: string | null
          organization_id?: string
          patient_id?: string
          payment_status?: string | null
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
      doctors: {
        Row: {
          branch_id: string | null
          consultation_fee: number | null
          created_at: string
          emergency_fee: number | null
          employee_id: string | null
          followup_fee: number | null
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
          emergency_fee?: number | null
          employee_id?: string | null
          followup_fee?: number | null
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
          emergency_fee?: number | null
          employee_id?: string | null
          followup_fee?: number | null
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
          received_by: string | null
          received_date: string
          status: Database["public"]["Enums"]["grn_status"]
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
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
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
          received_by?: string | null
          received_date?: string
          status?: Database["public"]["Enums"]["grn_status"]
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
          item_id: string
          po_item_id: string | null
          quantity_accepted: number
          quantity_received: number
          quantity_rejected: number
          rejection_reason: string | null
          unit_cost: number
        }
        Insert: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id: string
          id?: string
          item_id: string
          po_item_id?: string | null
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
          unit_cost?: number
        }
        Update: {
          batch_number?: string | null
          created_at?: string
          expiry_date?: string | null
          grn_id?: string
          id?: string
          item_id?: string
          po_item_id?: string | null
          quantity_accepted?: number
          quantity_received?: number
          quantity_rejected?: number
          rejection_reason?: string | null
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
            foreignKeyName: "grn_items_po_item_id_fkey"
            columns: ["po_item_id"]
            isOneToOne: false
            referencedRelation: "purchase_order_items"
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
          id: string
          invoice_id: string | null
          notes: string | null
          organization_id: string
          paid_amount: number | null
          patient_insurance_id: string
          patient_responsibility: number | null
          payment_date: string | null
          payment_reference: string | null
          pre_auth_date: string | null
          pre_auth_number: string | null
          rejection_reason: string | null
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
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id: string
          paid_amount?: number | null
          patient_insurance_id: string
          patient_responsibility?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          pre_auth_date?: string | null
          pre_auth_number?: string | null
          rejection_reason?: string | null
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
          id?: string
          invoice_id?: string | null
          notes?: string | null
          organization_id?: string
          paid_amount?: number | null
          patient_insurance_id?: string
          patient_responsibility?: number | null
          payment_date?: string | null
          payment_reference?: string | null
          pre_auth_date?: string | null
          pre_auth_number?: string | null
          rejection_reason?: string | null
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
          organization_id: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
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
          organization_id: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
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
      intra_op_notes: {
        Row: {
          approach: string | null
          blood_loss_ml: number | null
          catheters: Json | null
          closure_details: string | null
          closure_time: string | null
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
          standard_cost: number | null
          unit_of_measure: string
          updated_at: string
        }
        Insert: {
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
          standard_cost?: number | null
          unit_of_measure?: string
          updated_at?: string
        }
        Update: {
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
          billing_workflow: string | null
          city: string | null
          country: string | null
          created_at: string
          default_tax_rate: number | null
          email: string | null
          facility_type: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          receipt_footer: string | null
          receipt_header: string | null
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
          working_days: string[] | null
          working_hours_end: string | null
          working_hours_start: string | null
        }
        Insert: {
          address?: string | null
          billing_workflow?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          email?: string | null
          facility_type?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
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
          working_days?: string[] | null
          working_hours_end?: string | null
          working_hours_start?: string | null
        }
        Update: {
          address?: string | null
          billing_workflow?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          default_tax_rate?: number | null
          email?: string | null
          facility_type?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          receipt_footer?: string | null
          receipt_header?: string | null
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
      patient_insurance: {
        Row: {
          created_at: string | null
          end_date: string | null
          group_number: string | null
          id: string
          insurance_plan_id: string
          is_active: boolean | null
          is_primary: boolean | null
          member_id: string | null
          notes: string | null
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
          created_at?: string | null
          end_date?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id: string
          is_active?: boolean | null
          is_primary?: boolean | null
          member_id?: string | null
          notes?: string | null
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
          created_at?: string | null
          end_date?: string | null
          group_number?: string | null
          id?: string
          insurance_plan_id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          member_id?: string | null
          notes?: string | null
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
            foreignKeyName: "pharmacy_pos_transactions_voided_by_fkey"
            columns: ["voided_by"]
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
            foreignKeyName: "purchase_orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
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
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id: string
          created_at?: string
          department_id?: string | null
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
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          branch_id?: string
          created_at?: string
          department_id?: string | null
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
        ]
      }
      surgeries: {
        Row: {
          actual_end_time: string | null
          actual_start_time: string | null
          admission_id: string | null
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
          id: string
          invoice_id: string | null
          is_billable: boolean | null
          laterality: string | null
          lead_surgeon_id: string | null
          npo_from: string | null
          organization_id: string
          ot_room_id: string | null
          patient_id: string
          post_op_destination: string | null
          post_op_instructions: string | null
          postponement_reason: string | null
          priority: Database["public"]["Enums"]["surgery_priority"]
          priority_id: string | null
          procedure_code: string | null
          procedure_id: string | null
          procedure_name: string
          procedure_type: string | null
          rescheduled_from: string | null
          scheduled_date: string
          scheduled_end_time: string | null
          scheduled_start_time: string
          special_requirements: string | null
          status: Database["public"]["Enums"]["surgery_status"]
          surgery_number: string
          updated_at: string | null
        }
        Insert: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admission_id?: string | null
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
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          laterality?: string | null
          lead_surgeon_id?: string | null
          npo_from?: string | null
          organization_id: string
          ot_room_id?: string | null
          patient_id: string
          post_op_destination?: string | null
          post_op_instructions?: string | null
          postponement_reason?: string | null
          priority?: Database["public"]["Enums"]["surgery_priority"]
          priority_id?: string | null
          procedure_code?: string | null
          procedure_id?: string | null
          procedure_name: string
          procedure_type?: string | null
          rescheduled_from?: string | null
          scheduled_date: string
          scheduled_end_time?: string | null
          scheduled_start_time: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["surgery_status"]
          surgery_number: string
          updated_at?: string | null
        }
        Update: {
          actual_end_time?: string | null
          actual_start_time?: string | null
          admission_id?: string | null
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
          id?: string
          invoice_id?: string | null
          is_billable?: boolean | null
          laterality?: string | null
          lead_surgeon_id?: string | null
          npo_from?: string | null
          organization_id?: string
          ot_room_id?: string | null
          patient_id?: string
          post_op_destination?: string | null
          post_op_instructions?: string | null
          postponement_reason?: string | null
          priority?: Database["public"]["Enums"]["surgery_priority"]
          priority_id?: string | null
          procedure_code?: string | null
          procedure_id?: string | null
          procedure_name?: string
          procedure_type?: string | null
          rescheduled_from?: string | null
          scheduled_date?: string
          scheduled_end_time?: string | null
          scheduled_start_time?: string
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["surgery_status"]
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
            foreignKeyName: "surgeries_rescheduled_from_fkey"
            columns: ["rescheduled_from"]
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
      surgery_team_members: {
        Row: {
          confirmed_at: string | null
          created_at: string | null
          doctor_id: string | null
          employee_id: string | null
          id: string
          is_confirmed: boolean | null
          notes: string | null
          nurse_id: string | null
          role: Database["public"]["Enums"]["surgery_team_role"]
          surgery_id: string
        }
        Insert: {
          confirmed_at?: string | null
          created_at?: string | null
          doctor_id?: string | null
          employee_id?: string | null
          id?: string
          is_confirmed?: boolean | null
          notes?: string | null
          nurse_id?: string | null
          role: Database["public"]["Enums"]["surgery_team_role"]
          surgery_id: string
        }
        Update: {
          confirmed_at?: string | null
          created_at?: string | null
          doctor_id?: string | null
          employee_id?: string | null
          id?: string
          is_confirmed?: boolean | null
          notes?: string | null
          nurse_id?: string | null
          role?: Database["public"]["Enums"]["surgery_team_role"]
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
      generate_claim_number: { Args: { org_id: string }; Returns: string }
      generate_kiosk_username: {
        Args: { kiosk_name: string; org_id: string }
        Returns: string
      }
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
      subscription_plan: "basic" | "professional" | "enterprise"
      subscription_status: "trial" | "active" | "suspended" | "cancelled"
      surgery_priority: "emergency" | "urgent" | "elective"
      surgery_status:
        | "scheduled"
        | "pre_op"
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
      subscription_plan: ["basic", "professional", "enterprise"],
      subscription_status: ["trial", "active", "suspended", "cancelled"],
      surgery_priority: ["emergency", "urgent", "elective"],
      surgery_status: [
        "scheduled",
        "pre_op",
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
