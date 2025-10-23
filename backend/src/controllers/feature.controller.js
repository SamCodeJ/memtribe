import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get all features
 * Query params: ?includeInactive=true to get all features (admin only)
 */
export const getFeatures = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  
  // Build where clause
  const whereClause = {};
  
  // Only filter by is_active if not explicitly including inactive features
  if (includeInactive !== 'true') {
    whereClause.is_active = true;
  }
  
  const features = await prisma.feature.findMany({
    where: whereClause,
    orderBy: {
      created_at: 'desc'
    }
  });

  res.json(features);
});

/**
 * Get feature by ID
 */
export const getFeatureById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feature = await prisma.feature.findUnique({
    where: { id },
    include: {
      package_features: {
        include: {
          package: true
        }
      }
    }
  });

  if (!feature) {
    return res.status(404).json({ error: 'Feature not found' });
  }

  res.json(feature);
});

/**
 * Create a new feature
 */
export const createFeature = asyncHandler(async (req, res) => {
  const {
    feature_key,
    display_name,
    feature_type,
    description,
    default_value,
    category,
    is_active
  } = req.body;

  // Validate required fields
  if (!feature_key || !display_name || !feature_type) {
    return res.status(400).json({ error: 'Feature key, display name, and type are required' });
  }

  // Check if feature key already exists
  const existingFeature = await prisma.feature.findUnique({
    where: { feature_key }
  });

  if (existingFeature) {
    return res.status(400).json({ error: 'Feature key already exists' });
  }

  const feature = await prisma.feature.create({
    data: {
      feature_key,
      feature_name: display_name, // Keep feature_name for backwards compatibility
      display_name,
      feature_type,
      description,
      default_value,
      category: category || 'events',
      is_active: is_active !== undefined ? is_active : true
    }
  });

  res.status(201).json(feature);
});

/**
 * Update a feature
 */
export const updateFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    feature_key,
    display_name,
    feature_type,
    description,
    default_value,
    category,
    is_active
  } = req.body;

  // Check if feature exists
  const existingFeature = await prisma.feature.findUnique({
    where: { id }
  });

  if (!existingFeature) {
    return res.status(404).json({ error: 'Feature not found' });
  }

  // If key is being changed, check if new key already exists
  if (feature_key && feature_key !== existingFeature.feature_key) {
    const keyExists = await prisma.feature.findUnique({
      where: { feature_key }
    });

    if (keyExists) {
      return res.status(400).json({ error: 'Feature key already exists' });
    }
  }

  const updateData = {};
  if (feature_key !== undefined) updateData.feature_key = feature_key;
  if (display_name !== undefined) {
    updateData.display_name = display_name;
    updateData.feature_name = display_name; // Keep feature_name in sync
  }
  if (feature_type !== undefined) updateData.feature_type = feature_type;
  if (description !== undefined) updateData.description = description;
  if (default_value !== undefined) updateData.default_value = default_value;
  if (category !== undefined) updateData.category = category;
  if (is_active !== undefined) updateData.is_active = is_active;

  const feature = await prisma.feature.update({
    where: { id },
    data: updateData
  });

  res.json(feature);
});

/**
 * Delete a feature
 */
export const deleteFeature = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const feature = await prisma.feature.findUnique({
    where: { id }
  });

  if (!feature) {
    return res.status(404).json({ error: 'Feature not found' });
  }

  await prisma.feature.delete({
    where: { id }
  });

  res.json({ message: 'Feature deleted successfully' });
});

/**
 * Filter features with criteria
 */
export const filterFeatures = asyncHandler(async (req, res) => {
  const { filters, sort } = req.body;
  
  // Build where clause from filters
  const where = {};
  if (filters) {
    Object.keys(filters).forEach(key => {
      where[key] = filters[key];
    });
  }
  
  // Build orderBy from sort
  const orderBy = {};
  if (sort) {
    const isDesc = sort.startsWith('-');
    const field = isDesc ? sort.substring(1) : sort;
    orderBy[field] = isDesc ? 'desc' : 'asc';
  }
  
  const features = await prisma.feature.findMany({
    where,
    orderBy: Object.keys(orderBy).length > 0 ? orderBy : { created_at: 'desc' }
  });
  
  res.json(features);
});
