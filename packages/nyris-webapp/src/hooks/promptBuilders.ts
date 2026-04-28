/**
 * Prompt Builders
 *
 * Factory functions that generate organization-specific regex patterns
 * for brand and product type extraction.
 */

import { OrganizationProfile } from 'stores/smartFilters/organizationProfile';

// ---------------------------------------------------------------------------
// Regex Builders
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Regex Builders
// ---------------------------------------------------------------------------

/**
 * Build a RegExp for extracting brand names from product titles.
 * Returns null if no brand terms are configured (skip extraction).
 */
export function buildBrandRegex(profile: OrganizationProfile): RegExp | null {
  const terms = profile.brandRegexTerms.trim();
  if (!terms) return null;
  try {
    return new RegExp(`\\b(${terms})\\b`, 'i');
  } catch {
    console.warn('[promptBuilders] Invalid brandRegexTerms:', terms);
    return null;
  }
}

/**
 * Build a RegExp for extracting product type keywords from product titles.
 * Returns null if no product type terms are configured (skip extraction).
 */
export function buildProductTypeRegex(
  profile: OrganizationProfile,
): RegExp | null {
  const terms = profile.productTypeRegexTerms.trim();
  if (!terms) return null;
  try {
    return new RegExp(`\\b(${terms})\\b`, 'i');
  } catch {
    console.warn('[promptBuilders] Invalid productTypeRegexTerms:', terms);
    return null;
  }
}
