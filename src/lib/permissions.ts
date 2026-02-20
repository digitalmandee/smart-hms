/**
 * Permission utilities for role-based access control
 */

import { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Roles that can view financial data (invoices, revenue, billing)
 */
export const FINANCE_ROLES: AppRole[] = [
  "super_admin",
  "org_admin", 
  "branch_admin",
  "accountant",
  "finance_manager",
  "receptionist",
  "warehouse_admin",
];

/**
 * Clinical roles that should NOT see financial data
 */
export const CLINICAL_ROLES: AppRole[] = [
  "doctor",
  "surgeon",
  "anesthetist",
  "nurse",
  "opd_nurse",
  "ipd_nurse",
  "ot_nurse",
];

/**
 * Check if the user can view financial data (invoices, revenue, billing stats)
 * @param roles - User's roles array
 * @returns boolean - true if user can view financials
 */
export const canViewFinancials = (roles: AppRole[]): boolean => {
  return roles.some(role => FINANCE_ROLES.includes(role));
};

/**
 * Check if the user is a clinical staff member (doctor, nurse, etc.)
 * @param roles - User's roles array
 * @returns boolean - true if user is clinical staff
 */
export const isClinicalStaff = (roles: AppRole[]): boolean => {
  return roles.some(role => CLINICAL_ROLES.includes(role)) && 
         !roles.some(role => ["super_admin", "org_admin", "branch_admin"].includes(role));
};

/**
 * Check if the user can view their own wallet/earnings
 * @param roles - User's roles array
 * @returns boolean - true if user has a wallet (doctors, surgeons, anesthetists)
 */
export const canViewOwnWallet = (roles: AppRole[]): boolean => {
  const walletRoles: AppRole[] = ["doctor", "surgeon", "anesthetist"];
  return roles.some(role => walletRoles.includes(role));
};
