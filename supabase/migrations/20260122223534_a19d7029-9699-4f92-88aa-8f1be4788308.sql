-- Link employees to profiles by matching names
-- Link Fatima Khan (employee) to Dr. Fatima Khan (profile - pediatrician)
UPDATE employees SET profile_id = 'd3333333-3333-3333-3333-333333333333' WHERE id = 'f595fa73-804e-4a9a-a5d1-885331abe260';

-- Link Sana Tariq (employee) to Sana Bibi (profile - nurse healthos)
UPDATE employees SET profile_id = '0ef565b0-8a15-4101-90c3-f7622371874d' WHERE id = 'f31088a5-ffa5-47e3-bb1d-36bd076ab9d6';

-- Link Ayesha Begum (employee) to Dr. Ayesha Nawaz (profile - doctor)
UPDATE employees SET profile_id = '1fbdf4c6-08ce-404a-a287-abb85d0ba49f' WHERE id = '0d54f875-d2fd-4178-adc6-09c9860bf768';

-- Link Hassan Iqbal (employee) to Nasir Ahmed - HR Manager
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000021' WHERE id = 'ce330915-10d1-4529-8b0b-d082c19ec52b';

-- Link Bilal Ahmad (employee) to Bilal Ahmed Khan - superadmin healthos
UPDATE employees SET profile_id = '8a6259a3-64f0-48c6-bb0c-3a16eba948de' WHERE id = '0cc43e03-9967-49ba-9cfe-5a33ba4f3657';

-- Link Muhammad Ali (employee) to Imran Hussain - receptionist
UPDATE employees SET profile_id = '71be585d-01ca-4f6f-94b7-70382ba8ab56' WHERE id = '7cf338d4-f5d7-47ee-a057-fac1b4f7c3e1';

-- Link Usman Shah (employee) to Dr. Usman Malik - cardiologist  
UPDATE employees SET profile_id = 'd2222222-2222-2222-2222-222222222222' WHERE id = 'aaec3aff-531c-42f0-b28b-329275f6bc95';

-- Link Zainab Malik (employee) to Fatima Zahra Malik - orgadmin
UPDATE employees SET profile_id = '8812e69e-d65a-4a98-99c4-c3e172ff7368' WHERE id = '44a81057-c430-45dc-ae31-46acb4f00a99';

-- Link Ahmed Raza (employee) to Dr. Ahmed Raza - surgeon
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000030' WHERE id = '551dff97-9579-4e05-81e8-210793f3fc6c';

-- Link Amina Hussain (employee) to Nadia Perveen - IPD nurse
UPDATE employees SET profile_id = '00000000-0000-0000-0000-000000000027' WHERE id = '3a8eef1e-93d8-4a59-af68-7e458d66eb18';