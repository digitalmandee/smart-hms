
DO $$
DECLARE
  v_org_id UUID := 'b1111111-1111-1111-1111-111111111111';
  v_emp RECORD;
  v_date DATE;
  v_dow INT;
  v_rand FLOAT;
  v_status attendance_status;
  v_ci TIME; v_co TIME; v_wh NUMERIC;
  v_late INT; v_el INT; v_ot NUMERIC;
  v_src TEXT; v_bid UUID; v_h INT := 0;
BEGIN
  FOR v_emp IN SELECT id, branch_id FROM employees WHERE organization_id = v_org_id AND employment_status = 'active'
  LOOP
    v_bid := COALESCE(v_emp.branch_id, (SELECT id FROM branches WHERE organization_id = v_org_id LIMIT 1));
    v_date := '2026-03-11'::DATE;
    WHILE v_date <= '2026-04-01'::DATE LOOP
      IF NOT EXISTS (SELECT 1 FROM attendance_records WHERE employee_id = v_emp.id AND attendance_date = v_date) THEN
        v_dow := EXTRACT(DOW FROM v_date)::INT;
        v_h := v_h + 1;
        v_rand := ABS((hashtext(v_emp.id::text || v_date::text || v_h::text) % 1000)::FLOAT / 1000.0);
        v_ci := NULL; v_co := NULL; v_wh := NULL; v_late := 0; v_el := 0; v_ot := 0;
        v_src := CASE WHEN v_rand < 0.6 THEN 'biometric' WHEN v_rand < 0.85 THEN 'manual' ELSE 'system' END;

        IF v_dow IN (5, 0) THEN
          v_status := 'weekend'; v_src := NULL;
        ELSIF v_rand < 0.70 THEN
          v_status := 'present';
          v_ci := ('08:0' || (v_h % 3)::text || ':' || LPAD(((v_h * 7) % 60)::text, 2, '0'))::TIME;
          v_co := ('16:' || LPAD((30 + (v_h * 3) % 30)::text, 2, '0') || ':00')::TIME;
          v_wh := ROUND((EXTRACT(EPOCH FROM v_co - v_ci) / 3600.0)::NUMERIC, 1);
          IF v_wh > 8.5 THEN v_ot := ROUND(v_wh - 8.0, 1); END IF;
        ELSIF v_rand < 0.80 THEN
          v_status := 'late'; v_late := 15 + (v_h % 46);
          v_ci := ('08:' || LPAD((30 + (v_h % 30))::text, 2, '0') || ':00')::TIME;
          v_co := ('16:' || LPAD((30 + (v_h * 5) % 30)::text, 2, '0') || ':00')::TIME;
          v_wh := ROUND((EXTRACT(EPOCH FROM v_co - v_ci) / 3600.0)::NUMERIC, 1);
        ELSIF v_rand < 0.85 THEN
          v_status := 'absent'; v_src := NULL;
        ELSIF v_rand < 0.90 THEN
          v_status := 'half_day'; v_ci := '08:00'::TIME; v_co := '12:30'::TIME; v_wh := 4.5; v_el := 210;
        ELSIF v_rand < 0.95 THEN
          v_status := 'on_leave'; v_src := NULL;
        ELSE
          v_status := 'work_from_home'; v_ci := '08:00'::TIME; v_co := '16:30'::TIME; v_wh := 8.5; v_src := 'system';
        END IF;

        INSERT INTO attendance_records (employee_id, organization_id, branch_id, attendance_date, status, check_in, check_out, check_in_source, check_out_source, working_hours, late_minutes, early_leave_minutes, overtime_hours)
        VALUES (v_emp.id, v_org_id, v_bid, v_date, v_status, v_ci, v_co, v_src, v_src, v_wh, v_late, v_el, v_ot);
      END IF;
      v_date := v_date + 1;
    END LOOP;
  END LOOP;
END;
$$;
