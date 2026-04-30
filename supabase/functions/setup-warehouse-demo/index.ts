import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { requireAuth, userHasAnyRole, forbidden } from "../_shared/auth.ts";

const DEMO_PASSWORD = "Demo@123";
const ORG = "a1111111-1111-1111-1111-111111111111";
const BRANCH = "ab111111-1111-1111-1111-111111111111";
const STORE_MAIN = "a621e590-c63f-4d70-a14d-14edf8fd984e";
const STORE_MED = "4a00c015-5150-4325-956a-6c9124b97682";
const STORE_GEN = "99ca171e-dadc-45d5-be1b-2d32a258829b";
const USER_ADMIN = "00000000-0000-0000-0000-000000000040";
const USER_WH = "00000000-0000-0000-0000-000000000041";

// Pre-generated UUIDs
const CAT = {
  pharma: "c0000001-1111-4000-a000-000000000001",
  surgical: "c0000001-1111-4000-a000-000000000002",
  consumables: "c0000001-1111-4000-a000-000000000003",
  equipment: "c0000001-1111-4000-a000-000000000004",
  lab: "c0000001-1111-4000-a000-000000000005",
};
const VND = {
  mediline: "d0000001-1111-4000-a000-000000000001",
  surgical: "d0000001-1111-4000-a000-000000000002",
  labchem: "d0000001-1111-4000-a000-000000000003",
  medequip: "d0000001-1111-4000-a000-000000000004",
};
const ITM: Record<string, string> = {};
for (let i = 1; i <= 15; i++) ITM[`i${i}`] = `e0000001-1111-4000-a000-0000000000${i.toString().padStart(2, "0")}`;

const ZON: Record<string, string> = {};
for (let i = 1; i <= 4; i++) ZON[`z${i}`] = `f0000001-1111-4000-a000-00000000000${i}`;

const BIN: Record<string, string> = {};
for (let i = 1; i <= 12; i++) BIN[`b${i}`] = `f1000001-1111-4000-a000-0000000000${i.toString().padStart(2, "0")}`;

const PR: Record<string, string> = {};
for (let i = 1; i <= 3; i++) PR[`pr${i}`] = `a2000001-1111-4000-a000-00000000000${i}`;

const PRI: Record<string, string> = {};
for (let i = 1; i <= 8; i++) PRI[`pri${i}`] = `a3000001-1111-4000-a000-00000000000${i}`;

const PO: Record<string, string> = {};
for (let i = 1; i <= 4; i++) PO[`po${i}`] = `a4000001-1111-4000-a000-00000000000${i}`;

const POI: Record<string, string> = {};
for (let i = 1; i <= 12; i++) POI[`poi${i}`] = `a5000001-1111-4000-a000-0000000000${i.toString().padStart(2, "0")}`;

const GRN: Record<string, string> = {};
for (let i = 1; i <= 3; i++) GRN[`g${i}`] = `a6000001-1111-4000-a000-00000000000${i}`;

const GI: Record<string, string> = {};
for (let i = 1; i <= 9; i++) GI[`gi${i}`] = `a7000001-1111-4000-a000-00000000000${i}`;

const IS: Record<string, string> = {};
for (let i = 1; i <= 15; i++) IS[`s${i}`] = `a8000001-1111-4000-a000-0000000000${i.toString().padStart(2, "0")}`;

const PT: Record<string, string> = {};
for (let i = 1; i <= 4; i++) PT[`pt${i}`] = `a9000001-1111-4000-a000-00000000000${i}`;

const RQ: Record<string, string> = {};
for (let i = 1; i <= 3; i++) RQ[`rq${i}`] = `b1000001-1111-4000-a000-00000000000${i}`;

const RI: Record<string, string> = {};
for (let i = 1; i <= 8; i++) RI[`ri${i}`] = `b2000001-1111-4000-a000-00000000000${i}`;

const TR: Record<string, string> = {};
for (let i = 1; i <= 2; i++) TR[`tr${i}`] = `b3000001-1111-4000-a000-00000000000${i}`;

const TI: Record<string, string> = {};
for (let i = 1; i <= 5; i++) TI[`ti${i}`] = `b4000001-1111-4000-a000-00000000000${i}`;

const PL: Record<string, string> = {};
for (let i = 1; i <= 3; i++) PL[`pl${i}`] = `b5000001-1111-4000-a000-00000000000${i}`;

const PLI: Record<string, string> = {};
for (let i = 1; i <= 8; i++) PLI[`pli${i}`] = `b6000001-1111-4000-a000-00000000000${i}`;

const PS: Record<string, string> = {};
for (let i = 1; i <= 2; i++) PS[`ps${i}`] = `b7000001-1111-4000-a000-00000000000${i}`;

const PSI: Record<string, string> = {};
for (let i = 1; i <= 5; i++) PSI[`psi${i}`] = `b8000001-1111-4000-a000-00000000000${i}`;

const SH: Record<string, string> = {};
for (let i = 1; i <= 2; i++) SH[`sh${i}`] = `b9000001-1111-4000-a000-00000000000${i}`;

const TE: Record<string, string> = {};
for (let i = 1; i <= 4; i++) TE[`te${i}`] = `c1000001-1111-4000-a000-00000000000${i}`;

const SA: Record<string, string> = {};
for (let i = 1; i <= 2; i++) SA[`sa${i}`] = `c2000001-1111-4000-a000-00000000000${i}`;

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Phase 1.3: Restrict demo seeding to super_admin/admin only.
  const auth = await requireAuth(req);
  if (!auth.ok) return auth.response;
  if (!(await userHasAnyRole(auth.admin, auth.userId, ["super_admin", "admin"]))) {
    return forbidden(req);
  }

  try {
    const supabase = auth.admin;

    const { action } = await req.json().catch(() => ({ action: "seed" }));
    const results: string[] = [];

    // ===================== USERS =====================
    if (action === "users" || action === "all") {
      const users = [
        { id: USER_ADMIN, email: "warehouse.admin@healthos.demo", full_name: "Khalid Mehmood", first_name: "Khalid", last_name: "Mehmood", role: "warehouse_admin", employee_id: "e7777777-7777-7777-7777-777777777777", employee_number: "EMP-WH-001" },
        { id: USER_WH, email: "warehouse.user@healthos.demo", full_name: "Tariq Hussain", first_name: "Tariq", last_name: "Hussain", role: "warehouse_user", employee_id: "e8888888-8888-8888-8888-888888888888", employee_number: "EMP-WH-002" },
      ];

      for (const user of users) {
        const { data: existing } = await supabase.auth.admin.getUserById(user.id);
        if (!existing?.user) {
          await supabase.auth.admin.createUser({ id: user.id, email: user.email, password: DEMO_PASSWORD, email_confirm: true, user_metadata: { full_name: user.full_name } });
          await new Promise(r => setTimeout(r, 500));
        }
        await supabase.from("profiles").upsert({ id: user.id, email: user.email, full_name: user.full_name, organization_id: ORG, branch_id: BRANCH, is_active: true });
        await supabase.from("user_roles").upsert({ user_id: user.id, role: user.role }, { onConflict: "user_id,role" });
        const { data: emp } = await supabase.from("employees").select("id").eq("profile_id", user.id).maybeSingle();
        if (!emp) {
          await supabase.from("employees").insert({ id: user.employee_id, organization_id: ORG, branch_id: BRANCH, profile_id: user.id, employee_number: user.employee_number, first_name: user.first_name, last_name: user.last_name, work_email: user.email, employee_type: "permanent", employment_status: "active", join_date: "2024-01-15" });
        }
        results.push(`User: ${user.email}`);
      }
    }

    // ===================== SEED DATA =====================
    if (action === "seed" || action === "all") {
      // Step 1: Categories
      const { error: catErr } = await supabase.from("inventory_categories").upsert([
        { id: CAT.pharma, organization_id: ORG, name: "Pharmaceuticals", description: "Medicines, drugs, and pharmaceutical products" },
        { id: CAT.surgical, organization_id: ORG, name: "Surgical Supplies", description: "Surgical instruments and supplies" },
        { id: CAT.consumables, organization_id: ORG, name: "Consumables", description: "Disposable medical consumables" },
        { id: CAT.equipment, organization_id: ORG, name: "Equipment", description: "Medical devices and equipment" },
        { id: CAT.lab, organization_id: ORG, name: "Lab Reagents", description: "Laboratory chemicals and reagents" },
      ]);
      results.push(catErr ? `Categories ERROR: ${catErr.message}` : "Categories: 5 inserted");

      // Step 1: Vendors
      const { error: vndErr } = await supabase.from("vendors").upsert([
        { id: VND.mediline, organization_id: ORG, vendor_code: "VND-0001", name: "Mediline Pharma Pvt Ltd", contact_person: "Imran Malik", email: "imran@mediline.pk", phone: "+92-321-1234567", address: "45 Industrial Area, Multan Road", city: "Lahore", country: "Pakistan", payment_terms: "Net 30", tax_number: "NTN-4567891", vendor_type: "pharmaceutical", is_preferred: true },
        { id: VND.surgical, organization_id: ORG, vendor_code: "VND-0002", name: "Surgical Plus International", contact_person: "Fatima Noor", email: "fatima@surgicalplus.pk", phone: "+92-333-9876543", address: "12 Surgical Market, GT Road", city: "Sialkot", country: "Pakistan", payment_terms: "Net 45", tax_number: "NTN-7891234", vendor_type: "surgical", is_preferred: false },
        { id: VND.labchem, organization_id: ORG, vendor_code: "VND-0003", name: "LabChem Pakistan", contact_person: "Usman Shah", email: "usman@labchem.pk", phone: "+92-300-5551234", address: "78 Science Park, SITE Area", city: "Karachi", country: "Pakistan", payment_terms: "Net 30", tax_number: "NTN-3456789", vendor_type: "laboratory", is_preferred: false },
        { id: VND.medequip, organization_id: ORG, vendor_code: "VND-0004", name: "MedEquip International", contact_person: "Rizwan Ahmed", email: "rizwan@medequip.pk", phone: "+92-42-35761234", address: "22 Tech Zone, Ferozepur Road", city: "Lahore", country: "Pakistan", payment_terms: "Net 60", tax_number: "NTN-6789123", vendor_type: "equipment", is_preferred: true },
      ]);
      results.push(vndErr ? `Vendors ERROR: ${vndErr.message}` : "Vendors: 4 inserted");

      // Step 1: Items (15) - item_code auto-generated by trigger
      const items = [
        { id: ITM.i1, organization_id: ORG, item_code: "ITM-00001", name: "Paracetamol 500mg Tablets", category_id: CAT.pharma, unit_of_measure: "Box", minimum_stock: 50, reorder_level: 100, standard_cost: 150, is_consumable: true },
        { id: ITM.i2, organization_id: ORG, item_code: "ITM-00002", name: "Amoxicillin 250mg Capsules", category_id: CAT.pharma, unit_of_measure: "Box", minimum_stock: 30, reorder_level: 80, standard_cost: 280, is_consumable: true },
        { id: ITM.i3, organization_id: ORG, item_code: "ITM-00003", name: "Omeprazole 20mg Capsules", category_id: CAT.pharma, unit_of_measure: "Box", minimum_stock: 25, reorder_level: 60, standard_cost: 320, is_consumable: true },
        { id: ITM.i4, organization_id: ORG, item_code: "ITM-00004", name: "Normal Saline 0.9% 1L", category_id: CAT.pharma, unit_of_measure: "Bottle", minimum_stock: 100, reorder_level: 200, standard_cost: 85, is_consumable: true },
        { id: ITM.i5, organization_id: ORG, item_code: "ITM-00005", name: "Surgical Gloves (Sterile)", category_id: CAT.surgical, unit_of_measure: "Pair", minimum_stock: 200, reorder_level: 500, standard_cost: 45, is_consumable: true },
        { id: ITM.i6, organization_id: ORG, item_code: "ITM-00006", name: "Disposable Syringes 5ml", category_id: CAT.consumables, unit_of_measure: "Pack", minimum_stock: 100, reorder_level: 300, standard_cost: 120, is_consumable: true },
        { id: ITM.i7, organization_id: ORG, item_code: "ITM-00007", name: "Suture Silk 3-0", category_id: CAT.surgical, unit_of_measure: "Pack", minimum_stock: 20, reorder_level: 50, standard_cost: 450, is_consumable: true },
        { id: ITM.i8, organization_id: ORG, item_code: "ITM-00008", name: "Surgical Masks N95", category_id: CAT.consumables, unit_of_measure: "Box", minimum_stock: 50, reorder_level: 150, standard_cost: 650, is_consumable: true },
        { id: ITM.i9, organization_id: ORG, item_code: "ITM-00009", name: "Blood Glucose Test Strips", category_id: CAT.lab, unit_of_measure: "Box", minimum_stock: 30, reorder_level: 80, standard_cost: 1200, is_consumable: true },
        { id: ITM.i10, organization_id: ORG, item_code: "ITM-00010", name: "CBC Reagent Kit", category_id: CAT.lab, unit_of_measure: "Kit", minimum_stock: 10, reorder_level: 25, standard_cost: 8500, is_consumable: true },
        { id: ITM.i11, organization_id: ORG, item_code: "ITM-00011", name: "Digital Thermometer", category_id: CAT.equipment, unit_of_measure: "Piece", minimum_stock: 10, reorder_level: 20, standard_cost: 350, is_consumable: false },
        { id: ITM.i12, organization_id: ORG, item_code: "ITM-00012", name: "Pulse Oximeter", category_id: CAT.equipment, unit_of_measure: "Piece", minimum_stock: 5, reorder_level: 10, standard_cost: 2500, is_consumable: false },
        { id: ITM.i13, organization_id: ORG, item_code: "ITM-00013", name: "Bandage Roll 4 inch", category_id: CAT.consumables, unit_of_measure: "Roll", minimum_stock: 100, reorder_level: 250, standard_cost: 55, is_consumable: true },
        { id: ITM.i14, organization_id: ORG, item_code: "ITM-00014", name: "IV Cannula 20G", category_id: CAT.consumables, unit_of_measure: "Piece", minimum_stock: 200, reorder_level: 500, standard_cost: 25, is_consumable: true },
        { id: ITM.i15, organization_id: ORG, item_code: "ITM-00015", name: "Urine Test Strips", category_id: CAT.lab, unit_of_measure: "Box", minimum_stock: 20, reorder_level: 50, standard_cost: 950, is_consumable: true },
      ];
      const { error: itmErr } = await supabase.from("inventory_items").upsert(items);
      results.push(itmErr ? `Items ERROR: ${itmErr.message}` : "Items: 15 inserted");

      // Step 2: Zones (4 in Main Distribution Center)
      const { error: zonErr } = await supabase.from("warehouse_zones").upsert([
        { id: ZON.z1, organization_id: ORG, store_id: STORE_MAIN, zone_code: "GEN-01", zone_name: "General Storage", zone_type: "general", is_active: true },
        { id: ZON.z2, organization_id: ORG, store_id: STORE_MAIN, zone_code: "COLD-01", zone_name: "Cold Storage", zone_type: "cold_storage", temperature_range: "2-8°C", is_active: true },
        { id: ZON.z3, organization_id: ORG, store_id: STORE_MAIN, zone_code: "CTRL-01", zone_name: "Controlled Substances", zone_type: "controlled", is_active: true },
        { id: ZON.z4, organization_id: ORG, store_id: STORE_MAIN, zone_code: "BULK-01", zone_name: "Bulk Storage", zone_type: "bulk", is_active: true },
      ]);
      results.push(zonErr ? `Zones ERROR: ${zonErr.message}` : "Zones: 4 inserted");

      // Step 2: Bins (12) - uses max_weight, max_volume, current_weight, current_volume, bin_type
      const bins = [
        { id: BIN.b1, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z1, bin_code: "GEN-A1-01", bin_type: "shelf", max_weight: 100, max_volume: 100, current_weight: 45, current_volume: 45, is_active: true },
        { id: BIN.b2, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z1, bin_code: "GEN-A1-02", bin_type: "shelf", max_weight: 100, max_volume: 100, current_weight: 30, current_volume: 30, is_active: true },
        { id: BIN.b3, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z1, bin_code: "GEN-A2-01", bin_type: "shelf", max_weight: 150, max_volume: 150, current_weight: 0, current_volume: 0, is_active: true },
        { id: BIN.b4, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z2, bin_code: "COLD-B1-01", bin_type: "refrigerator", max_weight: 50, max_volume: 50, current_weight: 20, current_volume: 20, is_active: true },
        { id: BIN.b5, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z2, bin_code: "COLD-B1-02", bin_type: "refrigerator", max_weight: 50, max_volume: 50, current_weight: 10, current_volume: 10, is_active: true },
        { id: BIN.b6, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z2, bin_code: "COLD-B2-01", bin_type: "refrigerator", max_weight: 50, max_volume: 50, current_weight: 0, current_volume: 0, is_active: true },
        { id: BIN.b7, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z3, bin_code: "CTRL-C1-01", bin_type: "cabinet", max_weight: 30, max_volume: 30, current_weight: 15, current_volume: 15, is_active: true },
        { id: BIN.b8, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z3, bin_code: "CTRL-C1-02", bin_type: "cabinet", max_weight: 30, max_volume: 30, current_weight: 5, current_volume: 5, is_active: true },
        { id: BIN.b9, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z3, bin_code: "CTRL-C2-01", bin_type: "safe", max_weight: 20, max_volume: 20, current_weight: 0, current_volume: 0, is_active: true },
        { id: BIN.b10, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z4, bin_code: "BULK-D1-01", bin_type: "pallet", max_weight: 500, max_volume: 500, current_weight: 200, current_volume: 200, is_active: true },
        { id: BIN.b11, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z4, bin_code: "BULK-D1-02", bin_type: "pallet", max_weight: 500, max_volume: 500, current_weight: 100, current_volume: 100, is_active: true },
        { id: BIN.b12, organization_id: ORG, store_id: STORE_MAIN, zone_id: ZON.z4, bin_code: "BULK-D2-01", bin_type: "pallet", max_weight: 500, max_volume: 500, current_weight: 0, current_volume: 0, is_active: true },
      ];
      const { error: binErr } = await supabase.from("warehouse_bins").upsert(bins);
      results.push(binErr ? `Bins ERROR: ${binErr.message}` : "Bins: 12 inserted");

      // Step 3: Purchase Requests (3) - priority is integer (1=normal,2=medium,3=high)
      const { error: prErr } = await supabase.from("purchase_requests").upsert([
        { id: PR.pr1, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, pr_number: "PR-20260101-0001", requested_by: USER_WH, department: "Pharmacy", priority: 3, status: "draft", notes: "Urgent restock needed for OPD pharmacy" },
        { id: PR.pr2, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, pr_number: "PR-20260115-0001", requested_by: USER_WH, department: "Laboratory", priority: 2, status: "approved", approved_by: USER_ADMIN, approved_at: "2026-01-16T10:00:00Z", notes: "Monthly lab reagent order" },
        { id: PR.pr3, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, pr_number: "PR-20260201-0001", requested_by: USER_ADMIN, department: "General Ward", priority: 1, status: "converted", approved_by: USER_ADMIN, approved_at: "2026-02-02T09:00:00Z", notes: "Converted to PO-20260205-0001" },
      ]);
      results.push(prErr ? `PRs ERROR: ${prErr.message}` : "Purchase Requests: 3 inserted");

      // Step 3: PR Items (8)
      const { error: priErr } = await supabase.from("purchase_request_items").upsert([
        { id: PRI.pri1, purchase_request_id: PR.pr1, item_id: ITM.i1, quantity_requested: 200, current_stock: 30, reorder_level: 100, estimated_unit_cost: 150, notes: "Running low" },
        { id: PRI.pri2, purchase_request_id: PR.pr1, item_id: ITM.i2, quantity_requested: 100, current_stock: 15, reorder_level: 80, estimated_unit_cost: 280 },
        { id: PRI.pri3, purchase_request_id: PR.pr1, item_id: ITM.i4, quantity_requested: 300, current_stock: 50, reorder_level: 200, estimated_unit_cost: 85 },
        { id: PRI.pri4, purchase_request_id: PR.pr2, item_id: ITM.i9, quantity_requested: 50, current_stock: 10, reorder_level: 80, estimated_unit_cost: 1200 },
        { id: PRI.pri5, purchase_request_id: PR.pr2, item_id: ITM.i10, quantity_requested: 20, current_stock: 5, reorder_level: 25, estimated_unit_cost: 8500 },
        { id: PRI.pri6, purchase_request_id: PR.pr3, item_id: ITM.i5, quantity_requested: 500, current_stock: 150, reorder_level: 500, estimated_unit_cost: 45 },
        { id: PRI.pri7, purchase_request_id: PR.pr3, item_id: ITM.i6, quantity_requested: 300, current_stock: 80, reorder_level: 300, estimated_unit_cost: 120 },
        { id: PRI.pri8, purchase_request_id: PR.pr3, item_id: ITM.i8, quantity_requested: 200, current_stock: 40, reorder_level: 150, estimated_unit_cost: 650 },
      ]);
      results.push(priErr ? `PR Items ERROR: ${priErr.message}` : "PR Items: 8 inserted");

      // Step 4: Purchase Orders (4)
      const { error: poErr } = await supabase.from("purchase_orders").upsert([
        { id: PO.po1, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, po_number: "PO-20260105-0001", vendor_id: VND.mediline, status: "draft", total_amount: 45000, notes: "Draft PO for pharma items" },
        { id: PO.po2, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, po_number: "PO-20260120-0001", vendor_id: VND.labchem, status: "approved", total_amount: 230000, approved_by: USER_ADMIN, notes: "Lab reagents order approved" },
        { id: PO.po3, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, po_number: "PO-20260201-0001", vendor_id: VND.surgical, status: "partially_received", total_amount: 125000, approved_by: USER_ADMIN, notes: "Partially received surgical supplies" },
        { id: PO.po4, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, po_number: "PO-20260205-0001", vendor_id: VND.mediline, status: "received", total_amount: 175000, approved_by: USER_ADMIN, notes: "Fully received consumables order" },
      ]);
      results.push(poErr ? `POs ERROR: ${poErr.message}` : "Purchase Orders: 4 inserted");

      // Step 4: PO Items (12)
      const { error: poiErr } = await supabase.from("purchase_order_items").upsert([
        // PO1 (draft) - 3 items  (received_quantity not quantity_received)
        { id: POI.poi1, purchase_order_id: PO.po1, item_id: ITM.i1, quantity: 200, unit_price: 150, total_price: 30000, received_quantity: 0, item_type: "inventory" },
        { id: POI.poi2, purchase_order_id: PO.po1, item_id: ITM.i3, quantity: 50, unit_price: 300, total_price: 15000, received_quantity: 0, item_type: "inventory" },
        { id: POI.poi3, purchase_order_id: PO.po1, item_id: ITM.i4, quantity: 100, unit_price: 85, total_price: 8500, received_quantity: 0, item_type: "inventory" },
        // PO2 (approved) - 3 items
        { id: POI.poi4, purchase_order_id: PO.po2, item_id: ITM.i9, quantity: 50, unit_price: 1200, total_price: 60000, received_quantity: 0, item_type: "inventory" },
        { id: POI.poi5, purchase_order_id: PO.po2, item_id: ITM.i10, quantity: 15, unit_price: 8500, total_price: 127500, received_quantity: 0, item_type: "inventory" },
        { id: POI.poi6, purchase_order_id: PO.po2, item_id: ITM.i15, quantity: 30, unit_price: 950, total_price: 28500, received_quantity: 0, item_type: "inventory" },
        // PO3 (partially_received) - 3 items
        { id: POI.poi7, purchase_order_id: PO.po3, item_id: ITM.i5, quantity: 500, unit_price: 45, total_price: 22500, received_quantity: 300, item_type: "inventory" },
        { id: POI.poi8, purchase_order_id: PO.po3, item_id: ITM.i7, quantity: 100, unit_price: 450, total_price: 45000, received_quantity: 100, item_type: "inventory" },
        { id: POI.poi9, purchase_order_id: PO.po3, item_id: ITM.i8, quantity: 200, unit_price: 650, total_price: 130000, received_quantity: 0, item_type: "inventory" },
        // PO4 (received) - 3 items
        { id: POI.poi10, purchase_order_id: PO.po4, item_id: ITM.i6, quantity: 300, unit_price: 120, total_price: 36000, received_quantity: 300, item_type: "inventory" },
        { id: POI.poi11, purchase_order_id: PO.po4, item_id: ITM.i13, quantity: 250, unit_price: 55, total_price: 13750, received_quantity: 250, item_type: "inventory" },
        { id: POI.poi12, purchase_order_id: PO.po4, item_id: ITM.i14, quantity: 500, unit_price: 25, total_price: 12500, received_quantity: 500, item_type: "inventory" },
      ]);
      results.push(poiErr ? `PO Items ERROR: ${poiErr.message}` : "PO Items: 12 inserted");

      // Step 5: GRNs (3)
      const { error: grnErr } = await supabase.from("goods_received_notes").upsert([
        { id: GRN.g1, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, grn_number: "GRN-20260210-0001", purchase_order_id: PO.po3, vendor_id: VND.surgical, received_date: "2026-02-10", invoice_number: "SP-INV-2026-0034", invoice_date: "2026-02-08", invoice_amount: 67500, status: "draft", received_by: USER_WH, qc_status: "pending", notes: "Partial delivery from Surgical Plus" },
        { id: GRN.g2, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, grn_number: "GRN-20260212-0001", purchase_order_id: PO.po4, vendor_id: VND.mediline, received_date: "2026-02-12", invoice_number: "ML-INV-2026-0078", invoice_date: "2026-02-10", invoice_amount: 62250, status: "verified", received_by: USER_WH, verified_by: USER_ADMIN, verified_at: "2026-02-12T14:00:00Z", qc_status: "approved", qc_checked_by: USER_ADMIN, qc_checked_at: "2026-02-12T13:00:00Z", notes: "Full delivery verified" },
        { id: GRN.g3, organization_id: ORG, branch_id: BRANCH, store_id: STORE_MAIN, grn_number: "GRN-20260215-0001", purchase_order_id: PO.po4, vendor_id: VND.mediline, received_date: "2026-02-15", invoice_number: "ML-INV-2026-0082", invoice_date: "2026-02-14", invoice_amount: 12500, status: "verified", received_by: USER_WH, verified_by: USER_ADMIN, verified_at: "2026-02-15T11:00:00Z", qc_status: "approved", qc_checked_by: USER_ADMIN, qc_checked_at: "2026-02-15T10:30:00Z", notes: "Remaining items from PO" },
      ]);
      results.push(grnErr ? `GRNs ERROR: ${grnErr.message}` : "GRNs: 3 inserted");

      // Step 5: GRN Items (9)
      const { error: giErr } = await supabase.from("grn_items").upsert([
        // GRN1 (draft) - 3 items from PO3
        { id: GI.gi1, grn_id: GRN.g1, po_item_id: POI.poi7, item_id: ITM.i5, quantity_received: 300, quantity_accepted: 290, quantity_rejected: 10, rejection_reason: "Torn packaging", batch_number: "SG-2026-A01", expiry_date: "2028-02-10", unit_cost: 45, item_type: "inventory", qc_status: "pending" },
        { id: GI.gi2, grn_id: GRN.g1, po_item_id: POI.poi8, item_id: ITM.i7, quantity_received: 100, quantity_accepted: 100, quantity_rejected: 0, batch_number: "SS-2026-B05", expiry_date: "2029-06-30", unit_cost: 450, item_type: "inventory", qc_status: "pending" },
        { id: GI.gi3, grn_id: GRN.g1, item_id: ITM.i8, quantity_received: 50, quantity_accepted: 50, quantity_rejected: 0, batch_number: "NM-2026-C12", expiry_date: "2028-12-31", unit_cost: 650, item_type: "inventory", qc_status: "pending" },
        // GRN2 (verified) - 3 items from PO4
        { id: GI.gi4, grn_id: GRN.g2, po_item_id: POI.poi10, item_id: ITM.i6, quantity_received: 300, quantity_accepted: 300, quantity_rejected: 0, batch_number: "SYR-2026-D01", expiry_date: "2029-01-31", unit_cost: 120, item_type: "inventory", qc_status: "accepted" },
        { id: GI.gi5, grn_id: GRN.g2, po_item_id: POI.poi11, item_id: ITM.i13, quantity_received: 250, quantity_accepted: 245, quantity_rejected: 5, rejection_reason: "Water damage", batch_number: "BND-2026-E03", expiry_date: "2028-06-30", unit_cost: 55, item_type: "inventory", qc_status: "accepted" },
        { id: GI.gi6, grn_id: GRN.g2, po_item_id: POI.poi12, item_id: ITM.i14, quantity_received: 300, quantity_accepted: 300, quantity_rejected: 0, batch_number: "IVC-2026-F07", expiry_date: "2029-03-31", unit_cost: 25, item_type: "inventory", qc_status: "accepted" },
        // GRN3 (verified) - remaining from PO4
        { id: GI.gi7, grn_id: GRN.g3, po_item_id: POI.poi12, item_id: ITM.i14, quantity_received: 200, quantity_accepted: 200, quantity_rejected: 0, batch_number: "IVC-2026-F08", expiry_date: "2029-04-30", unit_cost: 25, item_type: "inventory", qc_status: "accepted" },
        { id: GI.gi8, grn_id: GRN.g3, item_id: ITM.i1, quantity_received: 50, quantity_accepted: 50, quantity_rejected: 0, batch_number: "PCM-2026-G01", expiry_date: "2028-08-31", unit_cost: 150, item_type: "inventory", qc_status: "accepted" },
        { id: GI.gi9, grn_id: GRN.g3, item_id: ITM.i3, quantity_received: 40, quantity_accepted: 40, quantity_rejected: 0, batch_number: "OMP-2026-H02", expiry_date: "2028-11-30", unit_cost: 320, item_type: "inventory", qc_status: "accepted" },
      ]);
      results.push(giErr ? `GRN Items ERROR: ${giErr.message}` : "GRN Items: 9 inserted");

      // Step 5: Inventory Stock (15 records) - needs branch_id
      const { error: isErr } = await supabase.from("inventory_stock").upsert([
        { id: IS.s1, item_id: ITM.i1, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "PCM-2026-G01", quantity: 50, unit_cost: 150, expiry_date: "2028-08-31", received_date: "2026-02-15", vendor_id: VND.mediline, grn_id: GRN.g3, location: "GEN-A1-01" },
        { id: IS.s2, item_id: ITM.i2, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "AMX-2025-X01", quantity: 15, unit_cost: 280, expiry_date: "2027-06-30", received_date: "2025-12-01", vendor_id: VND.mediline, location: "GEN-A1-01" },
        { id: IS.s3, item_id: ITM.i3, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "OMP-2026-H02", quantity: 40, unit_cost: 320, expiry_date: "2028-11-30", received_date: "2026-02-15", vendor_id: VND.mediline, grn_id: GRN.g3, location: "GEN-A1-02" },
        { id: IS.s4, item_id: ITM.i4, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "NS-2025-Y01", quantity: 50, unit_cost: 85, expiry_date: "2027-12-31", received_date: "2025-11-15", vendor_id: VND.mediline, location: "COLD-B1-01" },
        { id: IS.s5, item_id: ITM.i5, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "SG-2026-A01", quantity: 290, unit_cost: 45, expiry_date: "2028-02-10", received_date: "2026-02-10", vendor_id: VND.surgical, grn_id: GRN.g1, location: "GEN-A2-01" },
        { id: IS.s6, item_id: ITM.i6, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "SYR-2026-D01", quantity: 300, unit_cost: 120, expiry_date: "2029-01-31", received_date: "2026-02-12", vendor_id: VND.mediline, grn_id: GRN.g2, location: "GEN-A1-02" },
        { id: IS.s7, item_id: ITM.i7, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "SS-2026-B05", quantity: 100, unit_cost: 450, expiry_date: "2029-06-30", received_date: "2026-02-10", vendor_id: VND.surgical, grn_id: GRN.g1, location: "CTRL-C1-01" },
        { id: IS.s8, item_id: ITM.i8, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "NM-2026-C12", quantity: 50, unit_cost: 650, expiry_date: "2028-12-31", received_date: "2026-02-10", vendor_id: VND.surgical, grn_id: GRN.g1, location: "GEN-A2-01" },
        { id: IS.s9, item_id: ITM.i9, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "BGS-2025-Z01", quantity: 10, unit_cost: 1200, expiry_date: "2027-03-31", received_date: "2025-10-01", vendor_id: VND.labchem, location: "COLD-B1-02" },
        { id: IS.s10, item_id: ITM.i10, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "CBC-2025-W01", quantity: 5, unit_cost: 8500, expiry_date: "2027-01-31", received_date: "2025-09-15", vendor_id: VND.labchem, location: "COLD-B1-02" },
        { id: IS.s11, item_id: ITM.i11, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "DT-2025-V01", quantity: 8, unit_cost: 350, received_date: "2025-08-01", vendor_id: VND.medequip, location: "GEN-A1-01" },
        { id: IS.s12, item_id: ITM.i12, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "PO-2025-U01", quantity: 3, unit_cost: 2500, received_date: "2025-07-15", vendor_id: VND.medequip, location: "GEN-A1-02" },
        { id: IS.s13, item_id: ITM.i13, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "BND-2026-E03", quantity: 245, unit_cost: 55, expiry_date: "2028-06-30", received_date: "2026-02-12", vendor_id: VND.mediline, grn_id: GRN.g2, location: "BULK-D1-01" },
        { id: IS.s14, item_id: ITM.i14, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "IVC-2026-F07", quantity: 300, unit_cost: 25, expiry_date: "2029-03-31", received_date: "2026-02-12", vendor_id: VND.mediline, grn_id: GRN.g2, location: "BULK-D1-01" },
        { id: IS.s15, item_id: ITM.i15, branch_id: BRANCH, store_id: STORE_MAIN, batch_number: "UTS-2025-T01", quantity: 8, unit_cost: 950, expiry_date: "2027-05-31", received_date: "2025-11-01", vendor_id: VND.labchem, location: "COLD-B1-01" },
      ]);
      results.push(isErr ? `Inventory Stock ERROR: ${isErr.message}` : "Inventory Stock: 15 inserted");

      // Step 6: Put-Away Tasks (4) - uses grn_id, actual_bin_id
      const { error: ptErr } = await supabase.from("putaway_tasks").upsert([
        { id: PT.pt1, organization_id: ORG, store_id: STORE_MAIN, grn_id: GRN.g2, item_id: ITM.i6, quantity: 300, suggested_bin_id: BIN.b2, actual_bin_id: BIN.b2, status: "completed", assigned_to: USER_WH, completed_at: "2026-02-12T15:00:00Z" },
        { id: PT.pt2, organization_id: ORG, store_id: STORE_MAIN, grn_id: GRN.g2, item_id: ITM.i13, quantity: 245, suggested_bin_id: BIN.b10, actual_bin_id: BIN.b10, status: "completed", assigned_to: USER_WH, completed_at: "2026-02-12T16:00:00Z" },
        { id: PT.pt3, organization_id: ORG, store_id: STORE_MAIN, grn_id: GRN.g3, item_id: ITM.i14, quantity: 200, suggested_bin_id: BIN.b11, actual_bin_id: BIN.b11, status: "in_progress", assigned_to: USER_WH },
        { id: PT.pt4, organization_id: ORG, store_id: STORE_MAIN, grn_id: GRN.g3, item_id: ITM.i1, quantity: 50, suggested_bin_id: BIN.b1, status: "pending", assigned_to: USER_WH },
      ]);
      results.push(ptErr ? `Put-Away ERROR: ${ptErr.message}` : "Put-Away Tasks: 4 inserted");

      // Step 7: Stock Requisitions (3) - uses department_id (null ok), from_store_id, to_store_id, request_date
      const { error: rqErr } = await supabase.from("stock_requisitions").upsert([
        { id: RQ.rq1, organization_id: ORG, branch_id: BRANCH, from_store_id: STORE_MAIN, requisition_number: "REQ-20260210-0001", priority: 3, status: "pending", requested_by: USER_WH, request_date: "2026-02-10", notes: "Urgent pharmacy restock" },
        { id: RQ.rq2, organization_id: ORG, branch_id: BRANCH, from_store_id: STORE_MAIN, requisition_number: "REQ-20260212-0001", priority: 4, status: "approved", requested_by: USER_WH, approved_by: USER_ADMIN, approved_at: "2026-02-12T09:00:00Z", request_date: "2026-02-12", notes: "Emergency supplies needed" },
        { id: RQ.rq3, organization_id: ORG, branch_id: BRANCH, from_store_id: STORE_MAIN, requisition_number: "REQ-20260215-0001", priority: 1, status: "issued", requested_by: USER_WH, approved_by: USER_ADMIN, approved_at: "2026-02-15T10:00:00Z", issued_by: USER_ADMIN, issued_at: "2026-02-15T14:00:00Z", request_date: "2026-02-15", notes: "Routine ward supplies" },
      ]);
      results.push(rqErr ? `Requisitions ERROR: ${rqErr.message}` : "Requisitions: 3 inserted");

      // Step 7: Requisition Items (8)
      const { error: riErr } = await supabase.from("requisition_items").upsert([
        { id: RI.ri1, requisition_id: RQ.rq1, item_id: ITM.i1, quantity_requested: 50, quantity_approved: 0, quantity_issued: 0 },
        { id: RI.ri2, requisition_id: RQ.rq1, item_id: ITM.i6, quantity_requested: 100, quantity_approved: 0, quantity_issued: 0 },
        { id: RI.ri3, requisition_id: RQ.rq2, item_id: ITM.i4, quantity_requested: 20, quantity_approved: 20, quantity_issued: 0 },
        { id: RI.ri4, requisition_id: RQ.rq2, item_id: ITM.i5, quantity_requested: 50, quantity_approved: 50, quantity_issued: 0 },
        { id: RI.ri5, requisition_id: RQ.rq2, item_id: ITM.i14, quantity_requested: 100, quantity_approved: 100, quantity_issued: 0 },
        { id: RI.ri6, requisition_id: RQ.rq3, item_id: ITM.i13, quantity_requested: 30, quantity_approved: 30, quantity_issued: 30 },
        { id: RI.ri7, requisition_id: RQ.rq3, item_id: ITM.i8, quantity_requested: 20, quantity_approved: 20, quantity_issued: 20 },
        { id: RI.ri8, requisition_id: RQ.rq3, item_id: ITM.i6, quantity_requested: 50, quantity_approved: 50, quantity_issued: 50 },
      ]);
      results.push(riErr ? `Requisition Items ERROR: ${riErr.message}` : "Requisition Items: 8 inserted");

      // Step 7: Store Stock Transfers (2) - uses requested_by, dispatched_by, received_by, request_date
      const { error: trErr } = await supabase.from("store_stock_transfers").upsert([
        { id: TR.tr1, organization_id: ORG, transfer_number: "TRF-20260212-0001", from_store_id: STORE_MAIN, to_store_id: STORE_MED, status: "in_transit", requested_by: USER_ADMIN, dispatched_by: USER_ADMIN, request_date: "2026-02-12", notes: "Transfer to Medical Supplies Store" },
        { id: TR.tr2, organization_id: ORG, transfer_number: "TRF-20260215-0001", from_store_id: STORE_MAIN, to_store_id: STORE_GEN, status: "received", requested_by: USER_ADMIN, dispatched_by: USER_ADMIN, received_by: USER_WH, request_date: "2026-02-15", notes: "Consumables to General Storage" },
      ]);
      results.push(trErr ? `Transfers ERROR: ${trErr.message}` : "Transfers: 2 inserted");

      // Step 7: Transfer Items (5) - table is store_stock_transfer_items, uses quantity_requested/sent/received
      const { error: tiErr } = await supabase.from("store_stock_transfer_items").upsert([
        { id: TI.ti1, transfer_id: TR.tr1, item_id: ITM.i1, item_type: "inventory", quantity_requested: 20, quantity_sent: 20, quantity_received: 0, batch_number: "PCM-2026-G01" },
        { id: TI.ti2, transfer_id: TR.tr1, item_id: ITM.i6, item_type: "inventory", quantity_requested: 50, quantity_sent: 50, quantity_received: 0, batch_number: "SYR-2026-D01" },
        { id: TI.ti3, transfer_id: TR.tr1, item_id: ITM.i5, item_type: "inventory", quantity_requested: 100, quantity_sent: 100, quantity_received: 0, batch_number: "SG-2026-A01" },
        { id: TI.ti4, transfer_id: TR.tr2, item_id: ITM.i13, item_type: "inventory", quantity_requested: 50, quantity_sent: 50, quantity_received: 50, batch_number: "BND-2026-E03" },
        { id: TI.ti5, transfer_id: TR.tr2, item_id: ITM.i14, item_type: "inventory", quantity_requested: 100, quantity_sent: 100, quantity_received: 100, batch_number: "IVC-2026-F07" },
      ]);
      results.push(tiErr ? `Transfer Items ERROR: ${tiErr.message}` : "Transfer Items: 5 inserted");

      // Step 7: Pick Lists (3) - pick_strategy not picking_strategy
      const { error: plErr } = await supabase.from("pick_lists").upsert([
        { id: PL.pl1, organization_id: ORG, store_id: STORE_MAIN, pick_list_number: "PL-20260212-0001", source_type: "requisition", source_id: RQ.rq3, status: "completed", assigned_to: USER_WH, pick_strategy: "fefo", started_at: "2026-02-15T11:00:00Z", completed_at: "2026-02-15T12:30:00Z" },
        { id: PL.pl2, organization_id: ORG, store_id: STORE_MAIN, pick_list_number: "PL-20260215-0001", source_type: "requisition", source_id: RQ.rq2, status: "in_progress", assigned_to: USER_WH, pick_strategy: "fefo", started_at: "2026-02-16T09:00:00Z" },
        { id: PL.pl3, organization_id: ORG, store_id: STORE_MAIN, pick_list_number: "PL-20260218-0001", source_type: "transfer", source_id: TR.tr1, status: "pending", assigned_to: USER_WH, pick_strategy: "fefo" },
      ]);
      results.push(plErr ? `Pick Lists ERROR: ${plErr.message}` : "Pick Lists: 3 inserted");

      // Step 7: Pick List Items (8)
      const { error: pliErr } = await supabase.from("pick_list_items").upsert([
        // PL1 (completed)
        { id: PLI.pli1, pick_list_id: PL.pl1, item_id: ITM.i13, quantity_required: 30, quantity_picked: 30, bin_id: BIN.b10, batch_number: "BND-2026-E03", expiry_date: "2028-06-30", pick_sequence: 1, status: "picked", picked_at: "2026-02-15T11:15:00Z" },
        { id: PLI.pli2, pick_list_id: PL.pl1, item_id: ITM.i8, quantity_required: 20, quantity_picked: 20, bin_id: BIN.b3, batch_number: "NM-2026-C12", expiry_date: "2028-12-31", pick_sequence: 2, status: "picked", picked_at: "2026-02-15T11:30:00Z" },
        { id: PLI.pli3, pick_list_id: PL.pl1, item_id: ITM.i6, quantity_required: 50, quantity_picked: 50, bin_id: BIN.b2, batch_number: "SYR-2026-D01", expiry_date: "2029-01-31", pick_sequence: 3, status: "picked", picked_at: "2026-02-15T11:45:00Z" },
        // PL2 (in_progress)
        { id: PLI.pli4, pick_list_id: PL.pl2, item_id: ITM.i4, quantity_required: 20, quantity_picked: 20, bin_id: BIN.b4, batch_number: "NS-2025-Y01", expiry_date: "2027-12-31", pick_sequence: 1, status: "picked", picked_at: "2026-02-16T09:15:00Z" },
        { id: PLI.pli5, pick_list_id: PL.pl2, item_id: ITM.i5, quantity_required: 50, quantity_picked: 0, bin_id: BIN.b3, batch_number: "SG-2026-A01", expiry_date: "2028-02-10", pick_sequence: 2, status: "pending" },
        { id: PLI.pli6, pick_list_id: PL.pl2, item_id: ITM.i14, quantity_required: 100, quantity_picked: 0, bin_id: BIN.b10, batch_number: "IVC-2026-F07", expiry_date: "2029-03-31", pick_sequence: 3, status: "pending" },
        // PL3 (pending)
        { id: PLI.pli7, pick_list_id: PL.pl3, item_id: ITM.i1, quantity_required: 20, quantity_picked: 0, bin_id: BIN.b1, batch_number: "PCM-2026-G01", expiry_date: "2028-08-31", pick_sequence: 1, status: "pending" },
        { id: PLI.pli8, pick_list_id: PL.pl3, item_id: ITM.i6, quantity_required: 50, quantity_picked: 0, bin_id: BIN.b2, batch_number: "SYR-2026-D01", expiry_date: "2029-01-31", pick_sequence: 2, status: "pending" },
      ]);
      results.push(pliErr ? `Pick List Items ERROR: ${pliErr.message}` : "Pick List Items: 8 inserted");

      // Step 7: Packing Slips (2)
      const { error: psErr } = await supabase.from("packing_slips").upsert([
        { id: PS.ps1, organization_id: ORG, store_id: STORE_MAIN, packing_slip_number: "PS-20260215-0001", pick_list_id: PL.pl1, source_type: "requisition", source_id: RQ.rq3, status: "verified", packed_by: USER_WH, verified_by: USER_ADMIN, total_items: 3, total_weight: 12.5, box_count: 2, packed_at: "2026-02-15T13:00:00Z", verified_at: "2026-02-15T13:30:00Z" },
        { id: PS.ps2, organization_id: ORG, store_id: STORE_MAIN, packing_slip_number: "PS-20260218-0001", pick_list_id: PL.pl1, source_type: "transfer", source_id: TR.tr2, status: "pending", packed_by: USER_WH, total_items: 2, total_weight: 8.0, box_count: 1, packed_at: "2026-02-18T10:00:00Z" },
      ]);
      results.push(psErr ? `Packing Slips ERROR: ${psErr.message}` : "Packing Slips: 2 inserted");

      // Step 7: Packing Slip Items (5)
      const { error: psiErr } = await supabase.from("packing_slip_items").upsert([
        { id: PSI.psi1, packing_slip_id: PS.ps1, item_id: ITM.i13, quantity: 30, batch_number: "BND-2026-E03", box_number: 1 },
        { id: PSI.psi2, packing_slip_id: PS.ps1, item_id: ITM.i8, quantity: 20, batch_number: "NM-2026-C12", box_number: 1 },
        { id: PSI.psi3, packing_slip_id: PS.ps1, item_id: ITM.i6, quantity: 50, batch_number: "SYR-2026-D01", box_number: 2 },
        { id: PSI.psi4, packing_slip_id: PS.ps2, item_id: ITM.i13, quantity: 50, batch_number: "BND-2026-E03", box_number: 1 },
        { id: PSI.psi5, packing_slip_id: PS.ps2, item_id: ITM.i14, quantity: 100, batch_number: "IVC-2026-F07", box_number: 1 },
      ]);
      results.push(psiErr ? `Packing Slip Items ERROR: ${psiErr.message}` : "Packing Slip Items: 5 inserted");

      // Step 7: Shipments (2) - destination_address, actual_delivery, no notes col
      const { error: shErr } = await supabase.from("shipments").upsert([
        { id: SH.sh1, organization_id: ORG, store_id: STORE_MAIN, shipment_number: "SHP-20260215-0001", packing_slip_id: PS.ps1, destination_type: "department", destination_address: "General Ward, Main Hospital", carrier_name: "Internal Logistics", status: "dispatched", dispatched_at: "2026-02-15T14:00:00Z", dispatched_by: USER_ADMIN },
        { id: SH.sh2, organization_id: ORG, store_id: STORE_MAIN, shipment_number: "SHP-20260218-0001", packing_slip_id: PS.ps2, destination_type: "store", destination_address: "General Storage Area", carrier_name: "Internal Transport", status: "delivered", dispatched_at: "2026-02-18T11:00:00Z", dispatched_by: USER_ADMIN, actual_delivery: "2026-02-18T14:00:00Z" },
      ]);
      results.push(shErr ? `Shipments ERROR: ${shErr.message}` : "Shipments: 2 inserted");

      // Step 7: Tracking Events (4) - event_description, created_by
      const { error: teErr } = await supabase.from("shipment_tracking_events").upsert([
        { id: TE.te1, shipment_id: SH.sh1, event_type: "picked_up", event_description: "Items picked up from Main Warehouse", location: "Main Distribution Center", event_time: "2026-02-15T14:00:00Z", created_by: USER_ADMIN },
        { id: TE.te2, shipment_id: SH.sh1, event_type: "in_transit", event_description: "In transit to General Ward", location: "Hospital Corridor", event_time: "2026-02-15T14:15:00Z", created_by: USER_WH },
        { id: TE.te3, shipment_id: SH.sh2, event_type: "picked_up", event_description: "Items dispatched to General Storage", location: "Main Distribution Center", event_time: "2026-02-18T11:00:00Z", created_by: USER_ADMIN },
        { id: TE.te4, shipment_id: SH.sh2, event_type: "delivered", event_description: "Delivered and received at General Storage", location: "General Storage Area", event_time: "2026-02-18T14:00:00Z", created_by: USER_WH },
      ]);
      results.push(teErr ? `Tracking Events ERROR: ${teErr.message}` : "Tracking Events: 4 inserted");

      // Step 8: Stock Adjustments (2) - uses branch_id, previous_quantity, new_quantity, reference_type/id
      const { error: saErr } = await supabase.from("stock_adjustments").upsert([
        { id: SA.sa1, organization_id: ORG, branch_id: BRANCH, item_id: ITM.i9, adjustment_type: "expired", quantity: -5, previous_quantity: 15, new_quantity: 10, reason: "Expired blood glucose test strips - batch past expiry date", adjusted_by: USER_ADMIN },
        { id: SA.sa2, organization_id: ORG, branch_id: BRANCH, item_id: ITM.i11, adjustment_type: "damaged", quantity: -2, previous_quantity: 10, new_quantity: 8, reason: "Digital thermometers damaged during warehouse reorganization", adjusted_by: USER_WH },
      ]);
      results.push(saErr ? `Stock Adjustments ERROR: ${saErr.message}` : "Stock Adjustments: 2 inserted");
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed failed:", error);
    return new Response(
      JSON.stringify({ success: false, error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
