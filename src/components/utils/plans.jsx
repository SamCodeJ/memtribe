import { Package, PackageFeature, Feature } from "@/api/index";

// Fallback default plan in case of any issues.
const defaultPlan = {
  name: "Starter",
  events_per_month: 2,
  guests_per_event: 50,
  media_per_event: 100,
  ai_image_generation: false,
  custom_branding: false,
  slideshow_speed: 5000,
  slideshow_refresh: 30000,
};

/**
 * Fetches the details for a user's subscription plan dynamically from the database.
 * @param {object} user - The user object from User.me().
 * @returns {Promise<object>} An object containing the perks and limits of the user's plan.
 */
export const getPlanDetails = async (user) => {
  try {
    const planSlug = user?.subscription_plan || 'starter';

    // 1. Fetch all features once
    const allFeatures = await Feature.list();
    if (!allFeatures || allFeatures.length === 0) return defaultPlan;
    
    // 2. Fetch the specific package by slug
    const pkg = await Package.getBySlug(planSlug);
    if (!pkg) return defaultPlan;
    
    // 3. Package already includes features from backend
    const pkgFeatures = pkg.package_features || [];

    // 4. Build the plan details object
    const planDetails = {
      name: pkg.package_name,
    };
    
    const featureMap = new Map(allFeatures.map(f => [f.id, f]));

    pkgFeatures.forEach(pf => {
      const feature = featureMap.get(pf.feature_id);
      if (feature) {
        let value = pf.feature_value;
        if (pf.is_unlimited) {
          value = Infinity;
        } else if (feature.feature_type === 'limit') {
          value = parseInt(value, 10);
        } else if (feature.feature_type === 'boolean') {
          value = value === 'true';
        }
        planDetails[feature.feature_key] = value;
      }
    });

    return planDetails;

  } catch (error) {
    console.error("Error fetching plan details:", error);
    return defaultPlan; // Return default plan on error
  }
};