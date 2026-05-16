
-- Chunk 7: Patient Portal RLS (additive read policies via user_owns_patient)

CREATE POLICY "portal_self_select_patients" ON public.patients
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(id));

CREATE POLICY "portal_self_select_appointments" ON public.appointments
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

CREATE POLICY "portal_self_select_invoices" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

CREATE POLICY "portal_self_select_lab_orders" ON public.lab_orders
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

CREATE POLICY "portal_self_select_prescriptions" ON public.prescriptions
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

CREATE POLICY "portal_self_select_immunizations" ON public.immunizations
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

CREATE POLICY "portal_self_select_telemed" ON public.telemedicine_sessions
  FOR SELECT TO authenticated
  USING (public.user_owns_patient(patient_id));

-- patient_devices: portal user manages their own devices
CREATE POLICY "portal_device_select" ON public.patient_devices
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "portal_device_insert" ON public.patient_devices
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND public.user_owns_patient(patient_id));

CREATE POLICY "portal_device_update" ON public.patient_devices
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "portal_device_delete" ON public.patient_devices
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());
