import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Create new media
 */
export const createMedia = asyncHandler(async (req, res) => {
  const { event_id } = req.body;

  // Check if event exists and get organizer info
  const event = await prisma.event.findUnique({
    where: { id: event_id },
    include: {
      organizer: {
        select: {
          id: true,
          subscription_plan: true
        }
      }
    }
  });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check media count for this event
  const existingMediaCount = await prisma.media.count({
    where: { event_id }
  });

  // Get the organizer's plan limits
  const planSlug = event.organizer?.subscription_plan || 'starter';
  const pkg = await prisma.package.findUnique({
    where: { package_slug: planSlug },
    include: {
      package_features: {
        include: {
          feature: true
        }
      }
    }
  });

  // Find media_per_event limit
  let mediaLimit = 100; // Default limit
  if (pkg && pkg.package_features) {
    const mediaLimitFeature = pkg.package_features.find(
      pf => pf.feature.feature_key === 'media_per_event'
    );
    if (mediaLimitFeature) {
      mediaLimit = mediaLimitFeature.is_unlimited 
        ? Infinity 
        : parseInt(mediaLimitFeature.feature_value, 10);
    }
  }

  // Check if limit is reached
  if (existingMediaCount >= mediaLimit) {
    return res.status(403).json({ 
      error: `Media upload limit reached. This event can have a maximum of ${mediaLimit} media uploads on the ${pkg?.package_name || 'current'} plan.` 
    });
  }

  const media = await prisma.media.create({
    data: {
      ...req.body,
      moderation_status: 'pending' // Default to pending for moderation
    },
    include: {
      event: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  res.status(201).json(media);
});

/**
 * Get all media
 */
export const getMedia = asyncHandler(async (req, res) => {
  const { event_id, moderation_status, file_type } = req.query;

  const where = {};
  if (event_id) where.event_id = event_id;
  if (moderation_status) where.moderation_status = moderation_status;
  if (file_type) where.file_type = file_type;

  const media = await prisma.media.findMany({
    where,
    include: {
      event: {
        select: {
          id: true,
          title: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  res.json(media);
});

/**
 * Filter media with complex queries
 */
export const filterMedia = asyncHandler(async (req, res) => {
  const { filters, sort } = req.body;

  const where = {};

  if (filters) {
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      if (typeof value === 'object' && !Array.isArray(value)) {
        if (value.$in) where[key] = { in: value.$in };
        if (value.$ne) where[key] = { not: value.$ne };
      } else {
        where[key] = value;
      }
    });
  }

  let orderBy = { created_at: 'desc' };
  if (sort) {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = sort.replace(/^-/, '');
    orderBy = { [field]: direction };
  }

  const media = await prisma.media.findMany({
    where,
    orderBy,
    include: {
      event: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  res.json(media);
});

/**
 * Get media by ID
 */
export const getMediaById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await prisma.media.findUnique({
    where: { id },
    include: {
      event: true
    }
  });

  if (!media) {
    return res.status(404).json({ error: 'Media not found' });
  }

  res.json(media);
});

/**
 * Update media (for moderation, etc.)
 */
export const updateMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const media = await prisma.media.update({
    where: { id },
    data: req.body,
    include: {
      event: {
        select: {
          id: true,
          title: true
        }
      }
    }
  });

  res.json(media);
});

/**
 * Delete media
 */
export const deleteMedia = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.media.delete({
    where: { id }
  });

  res.json({ message: 'Media deleted successfully' });
});

