import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";

const ORG_ID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const BRANCH_ID = "b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11";
const PATIENT_IDS = [
  "21eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "22eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "23eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "24eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "25eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
];
const STAFF_ID = "00000000-0000-0000-0000-000000000030";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
const COMPONENT_TYPES = ["whole_blood", "packed_rbc", "fresh_frozen_plasma", "platelet_concentrate", "cryoprecipitate"] as const;
const STORAGE_LOCATIONS = ["Fridge A", "Fridge B", "Freezer 1", "Platelet Agitator"];

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function dateStr(d: Date) {
  return d.toISOString().split("T")[0];
}
function monthsAgo(n: number): Date {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return d;
}

const DONOR_NAMES = [
  { first: "Ahmed", last: "Khan", gender: "male" },
  { first: "Fatima", last: "Ali", gender: "female" },
  { first: "Omar", last: "Hassan", gender: "male" },
  { first: "Aisha", last: "Siddiqui", gender: "female" },
  { first: "Yusuf", last: "Rahman", gender: "male" },
  { first: "Zainab", last: "Malik", gender: "female" },
  { first: "Ibrahim", last: "Ahmed", gender: "male" },
  { first: "Maryam", last: "Hussain", gender: "female" },
  { first: "Hamza", last: "Sheikh", gender: "male" },
  { first: "Khadija", last: "Iqbal", gender: "female" },
  { first: "Bilal", last: "Qureshi", gender: "male" },
  { first: "Sara", last: "Nawaz", gender: "female" },
  { first: "Tariq", last: "Mirza", gender: "male" },
  { first: "Nadia", last: "Bukhari", gender: "female" },
  { first: "Usman", last: "Chaudhry", gender: "male" },
  { first: "Hina", last: "Raza", gender: "female" },
  { first: "Saad", last: "Javed", gender: "male" },
  { first: "Amina", last: "Farooq", gender: "female" },
  { first: "Rashid", last: "Ansari", gender: "male" },
  { first: "Lubna", last: "Zahid", gender: "female" },
];

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check if data already exists
    const { count: donorCount } = await supabase
      .from("blood_donors")
      .select("*", { count: "exact", head: true })
      .eq("organization_id", ORG_ID);

    if (donorCount && donorCount > 0) {
      return new Response(
        JSON.stringify({ message: "Blood bank data already seeded", donorCount }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========================
    // 1. INSERT 20 DONORS
    // ========================
    const donors = DONOR_NAMES.map((name, i) => {
      const status = i === 18 ? "deferred" : i === 19 ? "inactive" : "active";
      const bg = BLOOD_GROUPS[i % 8];
      const dob = new Date(1970 + randomBetween(0, 35), randomBetween(0, 11), randomBetween(1, 28));
      const totalDonations = randomBetween(1, 8);
      const lastDonation = monthsAgo(randomBetween(2, 10));
      return {
        organization_id: ORG_ID,
        branch_id: BRANCH_ID,
        donor_number: `SEED-DN-${String(i + 1).padStart(3, "0")}`,
        first_name: name.first,
        last_name: name.last,
        date_of_birth: dateStr(dob),
        gender: name.gender,
        blood_group: bg,
        phone: `+92300${randomBetween(1000000, 9999999)}`,
        email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@example.com`,
        address: `${randomBetween(1, 500)} Main Street`,
        city: randomItem(["Karachi", "Lahore", "Islamabad", "Rawalpindi", "Peshawar"]),
        weight_kg: randomBetween(55, 95),
        hemoglobin_level: +(12 + Math.random() * 4).toFixed(1),
        status,
        deferral_reason: status === "deferred" ? "Low hemoglobin" : null,
        deferral_until: status === "deferred" ? dateStr(monthsAgo(-3)) : null,
        last_donation_date: status !== "inactive" ? dateStr(lastDonation) : null,
        total_donations: totalDonations,
      };
    });

    const { data: insertedDonors, error: donorErr } = await supabase
      .from("blood_donors")
      .insert(donors)
      .select("id, blood_group");
    if (donorErr) throw new Error(`Donors: ${donorErr.message}`);

    // ========================
    // 2. INSERT 60 DONATIONS
    // ========================
    const donations: any[] = [];
    const donationTypes = ["whole_blood", "whole_blood", "whole_blood", "whole_blood", "platelet", "plasma"];
    
    for (let i = 0; i < 60; i++) {
      const donorIdx = i % 20;
      const donor = insertedDonors![donorIdx];
      const donDate = monthsAgo(randomBetween(0, 11));
      const status = i < 50 ? "completed" : i < 55 ? "rejected" : "processing";
      donations.push({
        organization_id: ORG_ID,
        branch_id: BRANCH_ID,
        donation_number: `SEED-DON-${String(i + 1).padStart(3, "0")}`,
        donor_id: donor.id,
        donation_date: dateStr(donDate),
        donation_time: `${String(8 + randomBetween(0, 8)).padStart(2, "0")}:${String(randomBetween(0, 59)).padStart(2, "0")}`,
        donation_type: randomItem(donationTypes),
        hemoglobin_level: +(12 + Math.random() * 4).toFixed(1),
        blood_pressure: `${randomBetween(110, 140)}/${randomBetween(70, 90)}`,
        pulse_rate: randomBetween(60, 100),
        temperature: +(36.2 + Math.random() * 1.2).toFixed(1),
        volume_ml: status === "rejected" ? null : randomBetween(350, 500),
        screening_passed: status !== "rejected",
        rejection_reason: status === "rejected" ? randomItem(["Low hemoglobin", "High blood pressure", "Recent medication"]) : null,
        status,
        bag_number: status !== "rejected" ? `BAG-${String(i + 1).padStart(4, "0")}` : null,
      });
    }

    const { data: insertedDonations, error: donationErr } = await supabase
      .from("blood_donations")
      .insert(donations)
      .select("id, donation_date, donor_id, status");
    if (donationErr) throw new Error(`Donations: ${donationErr.message}`);

    // ========================
    // 3. INSERT 80 INVENTORY UNITS
    // ========================
    const completedDonations = insertedDonations!.filter((d: any) => d.status === "completed");
    const inventory: any[] = [];
    const now = new Date();

    // Status distribution: 50 available, 10 issued, 5 transfused, 5 expired, 5 quarantine, 5 reserved
    const statusDistribution = [
      ...Array(50).fill("available"),
      ...Array(10).fill("issued"),
      ...Array(5).fill("transfused"),
      ...Array(5).fill("expired"),
      ...Array(5).fill("quarantine"),
      ...Array(5).fill("reserved"),
    ];

    for (let i = 0; i < 80; i++) {
      const donation = i < completedDonations.length ? completedDonations[i] : null;
      const donorForUnit = donation ? insertedDonors!.find((d: any) => d.id === donation.donor_id) : null;
      const bg = donorForUnit ? donorForUnit.blood_group : randomItem(BLOOD_GROUPS);
      const ct = randomItem(COMPONENT_TYPES);
      const status = statusDistribution[i];
      
      const collDate = donation ? new Date(donation.donation_date) : monthsAgo(randomBetween(0, 11));
      let expiryDate: Date;
      
      // Set expiry based on component type
      if (ct === "platelet_concentrate") {
        expiryDate = new Date(collDate);
        expiryDate.setDate(expiryDate.getDate() + 5);
      } else if (ct === "fresh_frozen_plasma" || ct === "cryoprecipitate") {
        expiryDate = new Date(collDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      } else {
        expiryDate = new Date(collDate);
        expiryDate.setDate(expiryDate.getDate() + 42);
      }

      // Override some to expire soon for alert testing
      if (i >= 0 && i < 3) {
        // 3 units expiring within 3 days
        expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + randomBetween(1, 2));
        inventory.push(buildUnit(i, donation, bg, "whole_blood", "available", collDate, expiryDate));
        continue;
      }
      if (i >= 3 && i < 8) {
        // 5 units expiring within 7 days
        expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + randomBetween(4, 6));
        inventory.push(buildUnit(i, donation, bg, ct, "available", collDate, expiryDate));
        continue;
      }
      
      // For expired status, ensure expiry is in the past
      if (status === "expired") {
        expiryDate = monthsAgo(randomBetween(1, 3));
      }
      // For available, ensure expiry is in future
      if (status === "available" && expiryDate <= now) {
        expiryDate = new Date(now);
        expiryDate.setDate(expiryDate.getDate() + randomBetween(10, 40));
      }
      
      inventory.push(buildUnit(i, donation, bg, ct, status, collDate, expiryDate));
    }

    function buildUnit(i: number, donation: any, bg: string, ct: string, status: string, collDate: Date, expiryDate: Date) {
      return {
        organization_id: ORG_ID,
        branch_id: BRANCH_ID,
        unit_number: `SEED-BU-${String(i + 1).padStart(3, "0")}`,
        donation_id: donation?.id || null,
        blood_group: bg,
        component_type: ct,
        volume_ml: ct === "platelet_concentrate" ? randomBetween(50, 70) : ct === "cryoprecipitate" ? randomBetween(15, 30) : randomBetween(200, 450),
        collection_date: dateStr(collDate),
        expiry_date: dateStr(expiryDate),
        storage_location: randomItem(STORAGE_LOCATIONS),
        status,
        all_tests_negative: status !== "quarantine",
        hiv_tested: true,
        hbsag_tested: true,
        hcv_tested: true,
        vdrl_tested: true,
        malaria_tested: true,
      };
    }

    const { error: invErr } = await supabase.from("blood_inventory").insert(inventory);
    if (invErr) throw new Error(`Inventory: ${invErr.message}`);

    // ========================
    // 4. INSERT 15 REQUESTS
    // ========================
    const indications = ["Pre-operative surgery", "Severe anemia", "Trauma/hemorrhage", "Post-partum bleeding", "Chronic kidney disease", "Cancer treatment", "GI bleeding", "Thalassemia"];
    const departments = ["Surgery", "ICU", "Emergency", "Obstetrics", "Oncology", "Medicine"];
    const requestStatuses = [
      ...Array(5).fill("pending"),
      ...Array(3).fill("processing"),
      ...Array(2).fill("ready"),
      ...Array(3).fill("completed"),
      ...Array(2).fill("cancelled"),
    ];
    const priorities = [
      ...Array(8).fill("routine"),
      ...Array(4).fill("urgent"),
      ...Array(3).fill("emergency"),
    ];

    const requests = [];
    for (let i = 0; i < 15; i++) {
      const requiredBy = new Date(now);
      requiredBy.setDate(requiredBy.getDate() + randomBetween(-5, 10));
      requests.push({
        organization_id: ORG_ID,
        branch_id: BRANCH_ID,
        request_number: `SEED-BR-${String(i + 1).padStart(3, "0")}`,
        patient_id: PATIENT_IDS[i % 5],
        blood_group: randomItem(BLOOD_GROUPS),
        component_type: randomItem(COMPONENT_TYPES),
        units_requested: randomBetween(1, 4),
        units_issued: requestStatuses[i] === "completed" ? randomBetween(1, 3) : 0,
        clinical_indication: randomItem(indications),
        priority: priorities[i],
        required_by: dateStr(requiredBy),
        requesting_department: randomItem(departments),
        requested_by: STAFF_ID,
        status: requestStatuses[i],
        hemoglobin_level: +(6 + Math.random() * 6).toFixed(1),
      });
    }

    const { error: reqErr } = await supabase.from("blood_requests").insert(requests);
    if (reqErr) throw new Error(`Requests: ${reqErr.message}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Blood bank seeded successfully",
        counts: {
          donors: 20,
          donations: 60,
          inventory: 80,
          requests: 15,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
