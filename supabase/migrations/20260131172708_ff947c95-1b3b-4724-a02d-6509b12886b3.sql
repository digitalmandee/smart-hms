-- Lab Analyzer Catalog (reference data - not org-specific)
CREATE TABLE public.lab_analyzer_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  analyzer_type TEXT NOT NULL,
  connection_protocol TEXT NOT NULL DEFAULT 'HL7',
  default_port INTEGER DEFAULT 2575,
  hl7_version TEXT,
  message_format TEXT,
  result_segment TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manufacturer, model)
);

-- Radiology Device Catalog (reference data - not org-specific)
CREATE TABLE public.radiology_device_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  manufacturer TEXT NOT NULL,
  model TEXT NOT NULL,
  device_type TEXT NOT NULL,
  modality_code TEXT,
  dicom_ae_title TEXT,
  default_port INTEGER DEFAULT 104,
  supports_dicomweb BOOLEAN DEFAULT false,
  supports_worklist BOOLEAN DEFAULT false,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(manufacturer, model)
);

-- Lab Result Imports (org-specific audit log)
CREATE TABLE public.lab_result_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  analyzer_id UUID REFERENCES public.lab_analyzers(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('HL7', 'ASTM')),
  raw_message TEXT NOT NULL,
  parsed_data JSONB,
  patient_id_from_message TEXT,
  matched_patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  matched_order_id UUID REFERENCES public.lab_orders(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'imported', 'error', 'duplicate')),
  error_message TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lab_result_imports ENABLE ROW LEVEL SECURITY;

-- RLS policies for lab_result_imports
CREATE POLICY "Users can view lab result imports for their organization"
  ON public.lab_result_imports FOR SELECT
  USING (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can insert lab result imports for their organization"
  ON public.lab_result_imports FOR INSERT
  WITH CHECK (organization_id = public.get_user_organization_id());

CREATE POLICY "Users can update lab result imports for their organization"
  ON public.lab_result_imports FOR UPDATE
  USING (organization_id = public.get_user_organization_id());

-- Indexes
CREATE INDEX idx_lab_result_imports_org ON public.lab_result_imports(organization_id);
CREATE INDEX idx_lab_result_imports_status ON public.lab_result_imports(status);
CREATE INDEX idx_lab_result_imports_patient ON public.lab_result_imports(matched_patient_id);

-- Seed Lab Analyzer Catalog
INSERT INTO public.lab_analyzer_catalog (manufacturer, model, analyzer_type, connection_protocol, default_port, hl7_version, notes) VALUES
-- Sysmex
('Sysmex', 'XN-1000', 'hematology', 'HL7', 2575, '2.3.1', 'Single-module hematology analyzer with WNR, WDF, RET channels'),
('Sysmex', 'XN-2000', 'hematology', 'HL7', 2575, '2.3.1', 'Dual-module hematology analyzer'),
('Sysmex', 'XN-3000', 'hematology', 'HL7', 2575, '2.3.1', 'Triple-module hematology analyzer for high throughput'),
('Sysmex', 'XN-550', 'hematology', 'HL7', 2575, '2.3.1', 'Compact 5-part differential analyzer'),
('Sysmex', 'CS-5100', 'coagulation', 'HL7', 2575, '2.3.1', 'Fully automated coagulation analyzer'),
('Sysmex', 'CS-2500', 'coagulation', 'HL7', 2575, '2.3.1', 'Mid-range coagulation analyzer'),
-- Roche
('Roche', 'Cobas 6000', 'chemistry', 'ASTM', 4000, NULL, 'Modular chemistry/immunology system with c501/c502 and e601/e602'),
('Roche', 'Cobas c311', 'chemistry', 'ASTM', 4000, NULL, 'Compact clinical chemistry analyzer'),
('Roche', 'Cobas c501', 'chemistry', 'ASTM', 4000, NULL, 'High-throughput chemistry module'),
('Roche', 'Cobas e411', 'immunology', 'ASTM', 4000, NULL, 'Compact immunoassay analyzer'),
('Roche', 'Cobas e801', 'immunology', 'ASTM', 4000, NULL, 'High-throughput immunoassay module'),
('Roche', 'Cobas u 601', 'urinalysis', 'ASTM', 4000, NULL, 'Fully automated urine analyzer'),
-- Beckman Coulter
('Beckman Coulter', 'DxH 800', 'hematology', 'HL7', 2575, '2.5.1', 'High-volume hematology analyzer with Early Sepsis Indicator'),
('Beckman Coulter', 'DxH 520', 'hematology', 'HL7', 2575, '2.5.1', 'Compact 5-part differential analyzer'),
('Beckman Coulter', 'AU5800', 'chemistry', 'HL7', 2575, '2.5', 'High-volume clinical chemistry system'),
('Beckman Coulter', 'AU680', 'chemistry', 'HL7', 2575, '2.5', 'Mid-range chemistry analyzer'),
('Beckman Coulter', 'DxI 800', 'immunology', 'HL7', 2575, '2.5', 'High-volume immunoassay system'),
-- Abbott
('Abbott', 'Alinity ci', 'chemistry', 'HL7', 2575, '2.5.1', 'Integrated clinical chemistry and immunoassay'),
('Abbott', 'Alinity h-series', 'hematology', 'HL7', 2575, '2.5.1', 'Advanced hematology system'),
('Abbott', 'Architect c8000', 'chemistry', 'HL7', 2575, '2.3.1', 'High-throughput chemistry analyzer'),
('Abbott', 'Architect i2000SR', 'immunology', 'HL7', 2575, '2.3.1', 'Immunoassay analyzer'),
('Abbott', 'Cell-Dyn Ruby', 'hematology', 'HL7', 2575, '2.3', 'Compact 5-part hematology analyzer'),
-- Siemens
('Siemens', 'Atellica CH 930', 'chemistry', 'HL7', 2575, '2.5.1', 'Modular clinical chemistry analyzer'),
('Siemens', 'Atellica IM 1600', 'immunology', 'HL7', 2575, '2.5.1', 'High-throughput immunoassay'),
('Siemens', 'ADVIA 2120i', 'hematology', 'HL7', 2575, '2.5.1', 'Advanced hematology system with reticulocyte analysis'),
('Siemens', 'ADVIA Centaur XP', 'immunology', 'HL7', 2575, '2.5.1', 'Immunoassay system'),
('Siemens', 'BCS XP', 'coagulation', 'HL7', 2575, '2.5.1', 'Coagulation analyzer'),
-- Mindray
('Mindray', 'BC-6800', 'hematology', 'HL7', 5555, '2.3.1', 'High-end modular hematology analyzer'),
('Mindray', 'BC-6200', 'hematology', 'HL7', 5555, '2.3.1', '5-part differential analyzer'),
('Mindray', 'BS-800M', 'chemistry', 'HL7', 5555, '2.3.1', 'Modular clinical chemistry system'),
('Mindray', 'BS-480', 'chemistry', 'HL7', 5555, '2.3.1', 'Mid-range chemistry analyzer'),
('Mindray', 'CL-6000i', 'immunology', 'HL7', 5555, '2.3.1', 'Chemiluminescence immunoassay'),
-- Horiba
('Horiba', 'Yumizen H500', 'hematology', 'ASTM', 4000, NULL, '5-part differential hematology'),
('Horiba', 'Yumizen H2500', 'hematology', 'ASTM', 4000, NULL, 'High-throughput hematology'),
('Horiba', 'Pentra C400', 'chemistry', 'ASTM', 4000, NULL, 'Clinical chemistry analyzer'),
-- Urinalysis
('Dirui', 'CS-T300', 'urinalysis', 'HL7', 2575, '2.3', 'Automated urine chemistry analyzer'),
('Dirui', 'H-800', 'urinalysis', 'HL7', 2575, '2.3', 'Urine sediment analyzer'),
('Urit', 'UA-600', 'urinalysis', 'ASTM', 4000, NULL, 'Automated urine analyzer'),
('Arkray', 'AUTION MAX AX-4030', 'urinalysis', 'HL7', 2575, '2.3', 'Fully automated urine analyzer'),
-- Electrolyte/Blood Gas
('Radiometer', 'ABL90 FLEX', 'blood_gas', 'HL7', 2575, '2.5.1', 'Blood gas, electrolyte, and metabolite analyzer'),
('Nova Biomedical', 'Stat Profile Prime', 'blood_gas', 'HL7', 2575, '2.3.1', 'Critical care analyzer'),
('Siemens', 'RAPIDPoint 500', 'blood_gas', 'HL7', 2575, '2.5.1', 'Blood gas and electrolyte analyzer'),
-- Special
('Bio-Rad', 'D-100', 'special', 'HL7', 2575, '2.3.1', 'HbA1c analyzer'),
('Tosoh', 'G8', 'special', 'HL7', 2575, '2.3', 'HPLC HbA1c and hemoglobin variants'),
('Trinity Biotech', 'Destiny Max', 'special', 'ASTM', 4000, NULL, 'HbA1c analyzer');

-- Seed Radiology Device Catalog
INSERT INTO public.radiology_device_catalog (manufacturer, model, device_type, modality_code, dicom_ae_title, default_port, supports_dicomweb, supports_worklist, notes) VALUES
-- Siemens CT
('Siemens Healthineers', 'SOMATOM go.Top', 'ct', 'CT', 'SIEMENS_CT', 104, true, true, '64-slice CT with Tin Filter technology'),
('Siemens Healthineers', 'SOMATOM Force', 'ct', 'CT', 'SIEMENS_CT', 104, true, true, 'Dual Source CT, 384-slice equivalent'),
('Siemens Healthineers', 'SOMATOM Definition Edge', 'ct', 'CT', 'SIEMENS_CT', 104, true, true, '128-slice single source CT'),
-- Siemens MRI
('Siemens Healthineers', 'MAGNETOM Vida', 'mri', 'MR', 'SIEMENS_MR', 104, true, true, '3T MRI with BioMatrix technology'),
('Siemens Healthineers', 'MAGNETOM Altea', 'mri', 'MR', 'SIEMENS_MR', 104, true, true, '1.5T MRI'),
('Siemens Healthineers', 'MAGNETOM Lumina', 'mri', 'MR', 'SIEMENS_MR', 104, true, true, '3T wide bore MRI'),
-- Siemens X-Ray
('Siemens Healthineers', 'Ysio Max', 'xray', 'DX', 'SIEMENS_DX', 104, true, true, 'Ceiling-mounted digital radiography'),
('Siemens Healthineers', 'Multix Impact', 'xray', 'DX', 'SIEMENS_DX', 104, false, true, 'Floor-mounted X-ray system'),
-- GE CT
('GE Healthcare', 'Revolution CT', 'ct', 'CT', 'GE_CT', 104, true, true, '256-slice wide coverage CT'),
('GE Healthcare', 'Optima CT660', 'ct', 'CT', 'GE_CT', 104, true, true, '64-slice CT'),
('GE Healthcare', 'Revolution Maxima', 'ct', 'CT', 'GE_CT', 104, true, true, '128-slice CT'),
-- GE MRI
('GE Healthcare', 'SIGNA Artist', 'mri', 'MR', 'GE_MR', 104, true, true, '1.5T MRI with AIR Technology'),
('GE Healthcare', 'SIGNA Premier', 'mri', 'MR', 'GE_MR', 104, true, true, '3T MRI'),
('GE Healthcare', 'SIGNA Hero', 'mri', 'MR', 'GE_MR', 104, true, true, '3T wide bore MRI'),
-- GE X-Ray
('GE Healthcare', 'Discovery XR656', 'xray', 'DX', 'GE_DX', 104, true, true, 'Advanced digital radiography'),
('GE Healthcare', 'Optima XR240amx', 'xray', 'CR', 'GE_CR', 104, false, true, 'Mobile X-ray'),
-- GE Ultrasound
('GE Healthcare', 'LOGIQ E10', 'ultrasound', 'US', 'GE_US', 104, true, false, 'Premium ultrasound system'),
('GE Healthcare', 'Voluson E10', 'ultrasound', 'US', 'GE_US', 104, true, false, 'OB/GYN ultrasound'),
-- Philips CT
('Philips', 'Incisive CT', 'ct', 'CT', 'PHILIPS_CT', 104, true, true, '64/128-slice CT'),
('Philips', 'Spectral CT 7500', 'ct', 'CT', 'PHILIPS_CT', 104, true, true, 'Spectral detector CT'),
-- Philips MRI
('Philips', 'Ingenia Ambition', 'mri', 'MR', 'PHILIPS_MR', 104, true, true, '1.5T MRI with BlueSeal magnet'),
('Philips', 'Ingenia Elition', 'mri', 'MR', 'PHILIPS_MR', 104, true, true, '3T MRI'),
-- Philips Ultrasound
('Philips', 'EPIQ Elite', 'ultrasound', 'US', 'PHILIPS_US', 104, true, false, 'Premium ultrasound'),
('Philips', 'Affiniti 70', 'ultrasound', 'US', 'PHILIPS_US', 104, true, false, 'General imaging ultrasound'),
-- Canon
('Canon Medical', 'Aquilion ONE PRISM', 'ct', 'CT', 'CANON_CT', 104, true, true, '320-row area detector CT'),
('Canon Medical', 'Aquilion Prime SP', 'ct', 'CT', 'CANON_CT', 104, true, true, '160-slice CT'),
('Canon Medical', 'Vantage Titan 3T', 'mri', 'MR', 'CANON_MR', 104, true, true, '3T MRI'),
('Canon Medical', 'Vantage Orian 1.5T', 'mri', 'MR', 'CANON_MR', 104, true, true, '1.5T MRI'),
-- Fujifilm
('Fujifilm', 'FDR D-EVO II', 'xray', 'DX', 'FUJI_DX', 104, true, true, 'Digital radiography with ISS technology'),
('Fujifilm', 'FCT Speedia HD', 'ct', 'CT', 'FUJI_CT', 104, true, true, '64-slice CT'),
-- Carestream
('Carestream', 'DRX-Evolution Plus', 'xray', 'CR', 'CARESTREAM', 104, true, true, 'Digital radiography room'),
('Carestream', 'OnSight 3D Extremity', 'ct', 'CT', 'CARESTREAM', 104, true, false, 'Cone beam CT for extremities'),
-- Samsung
('Samsung', 'RS85 Prestige', 'ultrasound', 'US', 'SAMSUNG_US', 104, true, false, 'Premium ultrasound with AI'),
('Samsung', 'HS60', 'ultrasound', 'US', 'SAMSUNG_US', 104, true, false, 'Mid-range ultrasound'),
-- Mindray
('Mindray', 'Resona 7', 'ultrasound', 'US', 'MINDRAY_US', 104, true, false, 'High-end ultrasound'),
('Mindray', 'DC-80', 'ultrasound', 'US', 'MINDRAY_US', 104, true, false, 'General imaging ultrasound'),
-- Open Source/PACS
('Orthanc', 'Orthanc Server', 'pacs', NULL, 'ORTHANC', 8042, true, true, 'Open-source lightweight PACS with DICOMweb support'),
('DCM4CHEE', 'DCM4CHEE Arc', 'pacs', NULL, 'DCM4CHEE', 8080, true, true, 'Open-source clinical image archive'),
('Horos', 'Horos Viewer', 'workstation', NULL, 'HOROS', 11112, true, false, 'Open-source DICOM viewer for macOS'),
('OsiriX', 'OsiriX MD', 'workstation', NULL, 'OSIRIX', 11112, true, false, 'Advanced DICOM viewer'),
('Dicoogle', 'Dicoogle', 'pacs', NULL, 'DICOOGLE', 8080, true, false, 'Open-source PACS with indexing'),
-- C-Arms/Fluoroscopy
('Siemens Healthineers', 'Cios Alpha', 'c_arm', 'XA', 'SIEMENS_XA', 104, false, true, 'Mobile C-arm for surgery'),
('GE Healthcare', 'OEC 3D', 'c_arm', 'XA', 'GE_XA', 104, false, true, 'Mobile C-arm with 3D imaging'),
('Philips', 'Zenition 50', 'c_arm', 'XA', 'PHILIPS_XA', 104, false, true, 'Mobile C-arm'),
-- Mammography
('Hologic', 'Selenia Dimensions', 'mammography', 'MG', 'HOLOGIC_MG', 104, true, true, '3D mammography with tomosynthesis'),
('GE Healthcare', 'Senographe Pristina', 'mammography', 'MG', 'GE_MG', 104, true, true, '3D mammography'),
('Siemens Healthineers', 'MAMMOMAT Revelation', 'mammography', 'MG', 'SIEMENS_MG', 104, true, true, 'HD mammography');

-- Add catalog_id column to lab_analyzers for reference
ALTER TABLE public.lab_analyzers ADD COLUMN IF NOT EXISTS catalog_id UUID REFERENCES public.lab_analyzer_catalog(id);
ALTER TABLE public.lab_analyzers ADD COLUMN IF NOT EXISTS hl7_version TEXT;
ALTER TABLE public.lab_analyzers ADD COLUMN IF NOT EXISTS message_format TEXT;