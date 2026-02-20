

# Seed Inventory Data for All Warehouses

## Current State

| Store | Stock Records | Zones | Bins |
|-------|--------------|-------|------|
| Main Distribution Center (central) | 15 items | 4 zones | 12 bins |
| Medical Supplies Store (medical) | 0 | 0 | 0 |
| General Storage Area (general) | 0 | 0 | 0 |

All 15 inventory items and 4 vendors already exist in the system. The two non-central stores are completely empty.

## What Will Be Seeded

### Medical Supplies Store (`4a00c015-5150-4325-956a-6c9124b97682`)

**Zones (3):**
- `MED-GEN` - General Medical Storage (storage type)
- `MED-COLD` - Medical Cold Storage (cold type)
- `MED-SURG` - Surgical Supplies (storage type)

**Bins (9):** 3 bins per zone (e.g., `MG-A01`, `MG-A02`, `MG-A03`, etc.)

**Inventory Stock (10 records):** A subset of the 15 items relevant to a medical store:
- Medicines: Paracetamol, Amoxicillin, Omeprazole (with batch/expiry)
- Surgical: Gloves, Sutures, Masks, IV Cannula
- Equipment: Thermometer, Pulse Oximeter
- Consumables: Syringes

Some items will be below reorder level to trigger alerts.

### General Storage Area (`99ca171e-dadc-45d5-be1b-2d32a258829b`)

**Zones (2):**
- `GSA-GEN` - General Bulk Storage (storage type)
- `GSA-RECV` - Receiving Area (receiving type)

**Bins (6):** 3 bins per zone

**Inventory Stock (8 records):** Bulk consumables and non-medical items:
- Normal Saline, Bandage Rolls, Disposable Syringes, Surgical Masks
- Blood Glucose Test Strips, CBC Reagent, Urine Test Strips, Surgical Gloves

Some items at low stock levels.

## Data Summary

| Entity | Medical Supplies Store | General Storage Area | Total New |
|--------|----------------------|---------------------|-----------|
| Zones | 3 | 2 | 5 |
| Bins | 9 | 6 | 15 |
| Stock Records | 10 | 8 | 18 |

## Implementation

All data will be inserted directly via SQL INSERT statements (no migrations needed -- this is data, not schema). The inserts will use:
- Existing item IDs (`e0000001-...`)
- Existing vendor IDs (`d0000001-...`)
- Existing store IDs
- Different batch numbers from those in Main Distribution Center
- Realistic expiry dates (2027-2029)
- Varied stock levels (some below reorder for alert testing)

## No Code Changes Required

This is purely a data seeding operation using existing tables and schema.

