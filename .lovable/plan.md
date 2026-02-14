

# Seed Data Plan: Warehouse, Rack & Inventory for Both Hospital and Pharmacy

## Current State Summary

**Organization:** `b1111111-...` (your main org) has warehouses in BOTH contexts but inventory only lives in the hospital side.

| Context | Warehouses | Racks | Inventory Items | Rack Assignments |
|---|---|---|---|---|
| **Hospital** | 5 (Central, Equipment, Medical, Pharmacy Store, Surgical) | 0 | 10 items (all in Central Warehouse) | 0 |
| **Pharmacy** | 1 (Main Pharmacy Store) | 1 (R-01 Cardiovascular) | 0 | 0 |

**Problem:** All 10 medicine inventory records sit in the hospital `Central Warehouse`. The pharmacy warehouse has zero inventory and only 1 rack. The hospital warehouses have zero racks. No rack assignments exist anywhere.

---

## What Will Be Done

### Part A: Hospital Side

**A1. Create racks in hospital warehouses**

| Store | Rack Code | Rack Name | Section |
|---|---|---|---|
| Central Warehouse | H-R01 | General Medicines | A |
| Central Warehouse | H-R02 | Antibiotics | A |
| Central Warehouse | H-R03 | Cardiovascular & Metabolic | B |
| Central Warehouse | H-R04 | GI & Pain Relief | B |
| Central Warehouse | H-R05 | Pediatric | C |
| Pharmacy Store | H-P01 | Dispensing Rack | A |

**A2. Create rack assignments for existing hospital inventory**

The 10 items already in Central Warehouse (`b2b3d49f-...`) get mapped:

| Medicine | Rack | Shelf | Position |
|---|---|---|---|
| Panadol 500mg | H-R01 (General) | 1 | Left |
| Brufen 400mg | H-R04 (GI & Pain) | 1 | Left |
| Ponstan 500mg | H-R04 (GI & Pain) | 1 | Right |
| Augmentin 625mg | H-R02 (Antibiotics) | 1 | Left |
| Flagyl 400mg | H-R02 (Antibiotics) | 2 | Left |
| Glucophage 500mg | H-R03 (Cardio & Metabolic) | 1 | Left |
| Norvasc 5mg | H-R03 (Cardio & Metabolic) | 2 | Left |
| Risek 20mg | H-R04 (GI & Pain) | 2 | Left |
| Nexium 40mg | H-R04 (GI & Pain) | 2 | Right |
| Calpol Syrup | H-R05 (Pediatric) | 1 | Left |

### Part B: Pharmacy Side

**B1. Create additional racks in Main Pharmacy Store**

| Rack Code | Rack Name | Section |
|---|---|---|
| R-01 | Cardiovascular (already exists) | Aisle A |
| R-02 | Pain & Anti-inflammatory | Aisle A |
| R-03 | Antibiotics | Aisle B |
| R-04 | GI & Metabolic | Aisle B |
| R-05 | Pediatric & Syrups | Aisle C |

**B2. Create pharmacy inventory records**

Insert 10 new inventory rows into `medicine_inventory` pointing to `Main Pharmacy Store` (`7eff9e8c-...`). These are separate stock records from hospital -- the pharmacy has its own independent stock.

| Medicine | Qty | Batch | Reorder Level |
|---|---|---|---|
| Panadol 500mg | 300 | PH-2602-001 | 30 |
| Brufen 400mg | 200 | PH-2602-002 | 20 |
| Augmentin 625mg | 150 | PH-2602-003 | 15 |
| Norvasc 5mg | 100 | PH-2602-004 | 10 |
| Glucophage 500mg | 180 | PH-2602-005 | 18 |
| Calpol Syrup | 80 | PH-2602-006 | 8 |
| Flagyl 400mg | 250 | PH-2602-007 | 25 |
| Risek 20mg | 150 | PH-2602-008 | 15 |
| Ponstan 500mg | 200 | PH-2602-009 | 20 |
| Nexium 40mg | 120 | PH-2602-010 | 12 |

**B3. Create pharmacy rack assignments**

| Medicine | Rack | Shelf | Position |
|---|---|---|---|
| Norvasc 5mg | R-01 (Cardiovascular) | 1 | Left |
| Brufen 400mg | R-02 (Pain) | 1 | Left |
| Ponstan 500mg | R-02 (Pain) | 1 | Right |
| Augmentin 625mg | R-03 (Antibiotics) | 1 | Left |
| Flagyl 400mg | R-03 (Antibiotics) | 2 | Left |
| Glucophage 500mg | R-04 (GI & Metabolic) | 1 | Left |
| Risek 20mg | R-04 (GI & Metabolic) | 2 | Left |
| Nexium 40mg | R-04 (GI & Metabolic) | 2 | Right |
| Panadol 500mg | R-04 (GI & Metabolic) | 3 | Left |
| Calpol Syrup | R-05 (Pediatric) | 1 | Left |

---

## Technical Details

All operations are pure data INSERTs/UPDATEs -- no schema or code changes needed.

### Execution Order

1. **Insert hospital racks** (6 racks into `store_racks` for Central Warehouse + Pharmacy Store)
2. **Insert pharmacy racks** (4 new racks into `store_racks` for Main Pharmacy Store)
3. **Insert pharmacy inventory** (10 rows into `medicine_inventory` with `store_id` = Main Pharmacy Store)
4. **Insert hospital rack assignments** (10 rows into `medicine_rack_assignments` using hospital rack IDs)
5. **Insert pharmacy rack assignments** (10 rows into `medicine_rack_assignments` using pharmacy rack IDs)

### Key IDs Reference

| Entity | ID |
|---|---|
| Organization | `b1111111-1111-1111-1111-111111111111` |
| Hospital Branch | `c1111111-1111-1111-1111-111111111111` |
| Hospital Central Warehouse | `b2b3d49f-5c32-4eb0-a525-ed1331786421` |
| Hospital Pharmacy Store | `1eba7f1c-9237-4e7a-901c-a6b668197cf5` |
| Pharmacy Main Store | `7eff9e8c-79d4-4c8c-8769-c543fd645b53` |
| Existing Pharmacy Rack R-01 | `57792c49-7d59-44e8-863f-d32b97dcfbf9` |

### What This Achieves

After seeding, both modules will show:
- **Hospital Inventory page** -- 10 items in Central Warehouse with rack locations (H-R01 to H-R05)
- **Pharmacy Inventory page** -- 10 items in Main Pharmacy Store with rack locations (R-01 to R-05)
- **Warehouse Detail pages** -- stock summary cards showing item counts and values
- **Rack Assignments page** -- all 20 assignments visible, filterable by warehouse
- **POS terminal** -- pharmacy inventory searchable with rack location badges

