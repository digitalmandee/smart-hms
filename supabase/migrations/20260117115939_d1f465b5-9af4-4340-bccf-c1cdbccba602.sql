-- =====================================================
-- Organization Email Settings & Default Email Templates
-- =====================================================

-- Seed default email templates for all organizations to customize
-- organization_id = NULL means system default that can be cloned

-- Appointment Templates
INSERT INTO notification_templates (organization_id, event_type, channel, subject, template, is_active)
VALUES 
  (NULL, 'appointment_reminder', 'email', 'Reminder: Your Appointment Tomorrow - {{organization_name}}', 
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">Appointment Reminder</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>This is a friendly reminder about your upcoming appointment:</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
    <p style="margin: 5px 0;"><strong>Date:</strong> {{appointment_date}}</p>
    <p style="margin: 5px 0;"><strong>Time:</strong> {{appointment_time}}</p>
    <p style="margin: 5px 0;"><strong>Doctor:</strong> {{doctor_name}}</p>
    <p style="margin: 5px 0;"><strong>Department:</strong> {{department}}</p>
  </div>
  <p>Please arrive 15 minutes early to complete any necessary paperwork.</p>
  <p style="color: #666; font-size: 14px;">If you need to reschedule, please contact us at {{organization_phone}}.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}}<br>{{organization_address}}</p>
</div>
</body></html>', true),

  (NULL, 'appointment_confirmation', 'email', 'Appointment Confirmed - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">✓ Appointment Confirmed</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>Your appointment has been successfully booked!</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e;">
    <p style="margin: 5px 0;"><strong>Date:</strong> {{appointment_date}}</p>
    <p style="margin: 5px 0;"><strong>Time:</strong> {{appointment_time}}</p>
    <p style="margin: 5px 0;"><strong>Doctor:</strong> {{doctor_name}}</p>
    <p style="margin: 5px 0;"><strong>Token:</strong> #{{token_number}}</p>
  </div>
  <p>We look forward to seeing you!</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}} | {{organization_phone}}</p>
</div>
</body></html>', true),

  (NULL, 'appointment_cancellation', 'email', 'Appointment Cancelled - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #eb3349 0%, #f45c43 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">Appointment Cancelled</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>Your appointment scheduled for <strong>{{appointment_date}}</strong> at <strong>{{appointment_time}}</strong> with <strong>{{doctor_name}}</strong> has been cancelled.</p>
  <p>If you would like to reschedule, please contact us or book online.</p>
  <p style="color: #666;">Contact: {{organization_phone}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}}</p>
</div>
</body></html>', true),

-- Billing Templates
  (NULL, 'invoice_created', 'email', 'Invoice #{{invoice_number}} - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">New Invoice</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>A new invoice has been generated for your recent visit:</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4facfe;">
    <p style="margin: 5px 0;"><strong>Invoice #:</strong> {{invoice_number}}</p>
    <p style="margin: 5px 0;"><strong>Amount:</strong> {{currency}} {{total_amount}}</p>
    <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
  </div>
  <p>Please make your payment by the due date to avoid any late fees.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}} | {{organization_phone}}</p>
</div>
</body></html>', true),

  (NULL, 'payment_received', 'email', 'Payment Received - Thank You! - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">✓ Payment Received</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>We have received your payment. Thank you!</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e;">
    <p style="margin: 5px 0;"><strong>Amount Paid:</strong> {{currency}} {{payment_amount}}</p>
    <p style="margin: 5px 0;"><strong>Invoice #:</strong> {{invoice_number}}</p>
    <p style="margin: 5px 0;"><strong>Payment Date:</strong> {{payment_date}}</p>
    <p style="margin: 5px 0;"><strong>Payment Method:</strong> {{payment_method}}</p>
  </div>
  <p>Your account balance is now: {{currency}} {{balance_due}}</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}}</p>
</div>
</body></html>', true),

  (NULL, 'payment_overdue', 'email', 'Payment Reminder - Invoice #{{invoice_number}} - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">Payment Reminder</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>This is a friendly reminder that your payment is overdue:</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c;">
    <p style="margin: 5px 0;"><strong>Invoice #:</strong> {{invoice_number}}</p>
    <p style="margin: 5px 0;"><strong>Amount Due:</strong> {{currency}} {{amount_due}}</p>
    <p style="margin: 5px 0;"><strong>Due Date:</strong> {{due_date}}</p>
    <p style="margin: 5px 0;"><strong>Days Overdue:</strong> {{days_overdue}}</p>
  </div>
  <p>Please make your payment at your earliest convenience to avoid any service interruptions.</p>
  <p style="color: #666;">Contact us at {{organization_phone}} if you have any questions.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}}</p>
</div>
</body></html>', true),

-- Lab Report Templates
  (NULL, 'lab_report_ready', 'email', 'Your Lab Report is Ready - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">🔬 Lab Report Ready</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>Your lab test results are now available!</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
    <p style="margin: 5px 0;"><strong>Order #:</strong> {{lab_order_number}}</p>
    <p style="margin: 5px 0;"><strong>Tests:</strong> {{test_names}}</p>
    <p style="margin: 5px 0;"><strong>Access Code:</strong> <span style="background: #667eea; color: white; padding: 5px 10px; border-radius: 4px; font-family: monospace;">{{access_code}}</span></p>
  </div>
  <p>To view and download your report:</p>
  <ol>
    <li>Visit: <a href="{{report_link}}">{{report_link}}</a></li>
    <li>Enter your Order Number and Access Code</li>
    <li>Download your report as PDF</li>
  </ol>
  <p style="color: #666; font-size: 14px;">This link will be available for 30 days.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}} | {{organization_phone}}</p>
</div>
</body></html>', true),

-- Prescription Template
  (NULL, 'prescription_ready', 'email', 'Your Prescription is Ready - {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">💊 Prescription Ready</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>Your prescription has been prepared and is ready for pickup at our pharmacy.</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e;">
    <p style="margin: 5px 0;"><strong>Prescription #:</strong> {{prescription_number}}</p>
    <p style="margin: 5px 0;"><strong>Doctor:</strong> {{doctor_name}}</p>
    <p style="margin: 5px 0;"><strong>Items:</strong> {{medication_count}} medication(s)</p>
  </div>
  <p>Pharmacy Hours: {{pharmacy_hours}}</p>
  <p style="color: #666;">Please bring your ID when picking up your prescription.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}} Pharmacy | {{organization_phone}}</p>
</div>
</body></html>', true),

-- Welcome Template
  (NULL, 'welcome_patient', 'email', 'Welcome to {{organization_name}}',
   '<!DOCTYPE html><html><head><meta charset="utf-8"></head><body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
  <h1 style="color: white; margin: 0;">Welcome! 👋</h1>
</div>
<div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
  <p>Dear <strong>{{patient_name}}</strong>,</p>
  <p>Welcome to {{organization_name}}! We are delighted to have you as our patient.</p>
  <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <p style="margin: 5px 0;"><strong>Your Patient ID:</strong> {{patient_number}}</p>
  </div>
  <p>As a registered patient, you can:</p>
  <ul>
    <li>Book appointments online</li>
    <li>Access your medical records</li>
    <li>View lab results</li>
    <li>Receive appointment reminders</li>
  </ul>
  <p>If you have any questions, please don''t hesitate to contact us.</p>
  <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
  <p style="color: #888; font-size: 12px;">{{organization_name}}<br>{{organization_address}}<br>{{organization_phone}}</p>
</div>
</body></html>', true)

ON CONFLICT DO NOTHING;

-- Add index for faster template lookups
CREATE INDEX IF NOT EXISTS idx_notification_templates_event_channel 
ON notification_templates(event_type, channel);

CREATE INDEX IF NOT EXISTS idx_notification_templates_org_event 
ON notification_templates(organization_id, event_type);