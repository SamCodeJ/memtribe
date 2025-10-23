import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get all package features
 */
export const getPackageFeatures = asyncHandler(async (req, res) => {
  const packageFeatures = await prisma.packageFeature.findMany({
    include: {
      feature: true,
      package: true
    }
  });

  res.json(packageFeatures);
});

/**
 * Get package feature by ID
 */
export const getPackageFeatureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageFeature = await prisma.packageFeature.findUnique({
    where: { id },
    include: {
      feature: true,
      package: true
    }
  });

  if (!packageFeature) {
    return res.status(404).json({ error: 'Package feature not found' });
  }

  res.json(packageFeature);
});

/**
 * Create a new package feature
 */
export const createPackageFeature = asyncHandler(async (req, res) => {
  const {
    package_id,
    feature_id,
    feature_value,
    is_unlimited
  } = req.body;

  // Validate required fields
  if (!package_id || !feature_id || feature_value === undefined) {
    return res.status(400).json({ error: 'Package ID, feature ID, and feature value are required' });
  }

  // Check if package exists
  const pkg = await prisma.package.findUnique({
    where: { id: package_id }
  });

  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }

  // Check if feature exists
  const feature = await prisma.feature.findUnique({
    where: { id: feature_id }
  });

  if (!feature) {
    return res.status(404).json({ error: 'Feature not found' });
  }

  // Check if this package-feature combination already exists
  const existing = await prisma.packageFeature.findUnique({
    where: {
      package_id_feature_id: {
        package_id,
        feature_id
      }
    }
  });

  if (existing) {
    return res.status(400).json({ error: 'This feature is already assigned to this package' });
  }

  const packageFeature = await prisma.packageFeature.create({
    data: {
      package_id,
      feature_id,
      feature_value: String(feature_value),
      is_unlimited: is_unlimited || false
    },
    include: {
      feature: true,
      package: true
    }
  });

  res.status(201).json(packageFeature);
});

/**
 * Update a package feature
 */
export const updatePackageFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    feature_value,
    is_unlimited
  } = req.body;

  // Check if package feature exists
  const existingPackageFeature = await prisma.packageFeature.findUnique({
    where: { id }
  });

  if (!existingPackageFeature) {
    return res.status(404).json({ error: 'Package feature not found' });
  }

  const updateData = {};
  if (feature_value !== undefined) updateData.feature_value = String(feature_value);
  if (is_unlimited !== undefined) updateData.is_unlimited = is_unlimited;

  const packageFeature = await prisma.packageFeature.update({
    where: { id },
    data: updateData,
    include: {
      feature: true,
      package: true
    }
  });

  res.json(packageFeature);
});

/**
 * Delete a package feature
 */
export const deletePackageFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageFeature = await prisma.packageFeature.findUnique({
    where: { id }
  });

  if (!packageFeature) {
    return res.status(404).json({ error: 'Package feature not found' });
  }

  await prisma.packageFeature.delete({
    where: { id }
  });

  res.json({ message: 'Package feature deleted successfully' });
});

