import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get all packages
 * Query params: ?includeInactive=true to get all packages (admin only)
 */
export const getPackages = asyncHandler(async (req, res) => {
  const { includeInactive } = req.query;
  
  // Build where clause
  const whereClause = {};
  
  // Only filter by is_active if not explicitly including inactive packages
  if (includeInactive !== 'true') {
    whereClause.is_active = true;
  }
  
  const packages = await prisma.package.findMany({
    where: whereClause,
    include: {
      package_features: {
        include: {
          feature: true
        }
      }
    },
    orderBy: {
      display_order: 'asc'
    }
  });

  res.json(packages);
});

/**
 * Get package by ID
 */
export const getPackageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pkg = await prisma.package.findUnique({
    where: { id },
    include: {
      package_features: {
        include: {
          feature: true
        }
      }
    }
  });

  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }

  res.json(pkg);
});

/**
 * Get package by slug
 */
export const getPackageBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const pkg = await prisma.package.findUnique({
    where: { package_slug: slug },
    include: {
      package_features: {
        include: {
          feature: true
        }
      }
    }
  });

  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }

  res.json(pkg);
});

/**
 * Get package features
 */
export const getPackageFeatures = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const packageFeatures = await prisma.packageFeature.findMany({
    where: {
      package_id: id
    },
    include: {
      feature: true,
      package: true
    }
  });

  res.json(packageFeatures);
});

/**
 * Create a new package
 */
export const createPackage = asyncHandler(async (req, res) => {
  const {
    package_name,
    package_slug,
    description,
    monthly_price,
    yearly_price,
    is_popular,
    display_order,
    color_scheme,
    is_active
  } = req.body;

  // Validate required fields
  if (!package_name || !package_slug) {
    return res.status(400).json({ error: 'Package name and slug are required' });
  }

  // Check if slug already exists
  const existingPackage = await prisma.package.findUnique({
    where: { package_slug }
  });

  if (existingPackage) {
    return res.status(400).json({ error: 'Package slug already exists' });
  }

  const pkg = await prisma.package.create({
    data: {
      package_name,
      package_slug,
      description,
      price: monthly_price || 0,
      monthly_price: monthly_price || 0,
      yearly_price: yearly_price || 0,
      is_popular: is_popular || false,
      display_order: display_order || 0,
      color_scheme: color_scheme || 'blue',
      is_active: is_active !== undefined ? is_active : true
    }
  });

  res.status(201).json(pkg);
});

/**
 * Update a package
 */
export const updatePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    package_name,
    package_slug,
    description,
    monthly_price,
    yearly_price,
    is_popular,
    display_order,
    color_scheme,
    is_active
  } = req.body;

  // Check if package exists
  const existingPackage = await prisma.package.findUnique({
    where: { id }
  });

  if (!existingPackage) {
    return res.status(404).json({ error: 'Package not found' });
  }

  // If slug is being changed, check if new slug already exists
  if (package_slug && package_slug !== existingPackage.package_slug) {
    const slugExists = await prisma.package.findUnique({
      where: { package_slug }
    });

    if (slugExists) {
      return res.status(400).json({ error: 'Package slug already exists' });
    }
  }

  const updateData = {};
  if (package_name !== undefined) updateData.package_name = package_name;
  if (package_slug !== undefined) updateData.package_slug = package_slug;
  if (description !== undefined) updateData.description = description;
  if (monthly_price !== undefined) {
    updateData.monthly_price = monthly_price;
    updateData.price = monthly_price; // Keep price in sync
  }
  if (yearly_price !== undefined) updateData.yearly_price = yearly_price;
  if (is_popular !== undefined) updateData.is_popular = is_popular;
  if (display_order !== undefined) updateData.display_order = display_order;
  if (color_scheme !== undefined) updateData.color_scheme = color_scheme;
  if (is_active !== undefined) updateData.is_active = is_active;

  const pkg = await prisma.package.update({
    where: { id },
    data: updateData
  });

  res.json(pkg);
});

/**
 * Delete a package
 */
export const deletePackage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const pkg = await prisma.package.findUnique({
    where: { id }
  });

  if (!pkg) {
    return res.status(404).json({ error: 'Package not found' });
  }

  await prisma.package.delete({
    where: { id }
  });

  res.json({ message: 'Package deleted successfully' });
});

/**
 * Filter packages with criteria
 */
export const filterPackages = asyncHandler(async (req, res) => {
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
  
  const packages = await prisma.package.findMany({
    where,
    orderBy: Object.keys(orderBy).length > 0 ? orderBy : { display_order: 'asc' },
    include: {
      package_features: {
        include: {
          feature: true
        }
      }
    }
  });
  
  res.json(packages);
});
