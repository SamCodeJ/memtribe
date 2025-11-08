import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';
import QRCode from 'qrcode';

const prisma = new PrismaClient();

/**
 * Create new event
 */
export const createEvent = asyncHandler(async (req, res) => {
  console.log('=== CREATE EVENT: Starting ===');
  console.log('User ID:', req.user.id);
  
  // Get user with subscription plan
  const user = await prisma.user.findUnique({
    where: { id: req.user.id }
  });

  console.log('User found:', user ? `${user.email} - Plan: ${user.subscription_plan}` : 'NOT FOUND');

  if (!user) {
    console.log('ERROR: User not found');
    return res.status(404).json({ error: 'User not found' });
  }

  // Get the user's subscription plan
  const planSlug = user.subscription_plan || 'starter';
  console.log('Looking for package:', planSlug);
  
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

  console.log('Package found:', pkg ? `${pkg.package_name} (${pkg.package_features.length} features)` : 'NOT FOUND');

  // Find events_per_month limit
  let eventsLimit = 2; // Default Starter limit
  if (pkg && pkg.package_features) {
    const eventsLimitFeature = pkg.package_features.find(
      pf => pf.feature.feature_key === 'events_per_month'
    );
    console.log('Events limit feature:', eventsLimitFeature ? `Value: ${eventsLimitFeature.feature_value}, Unlimited: ${eventsLimitFeature.is_unlimited}` : 'NOT FOUND');
    
    if (eventsLimitFeature) {
      eventsLimit = eventsLimitFeature.is_unlimited 
        ? Infinity 
        : parseInt(eventsLimitFeature.feature_value, 10);
    }
  }

  console.log('Events limit calculated:', eventsLimit);

  // Check if limit is unlimited
  if (eventsLimit !== Infinity) {
    // Calculate events created in the current month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    console.log('Checking events created since:', oneMonthAgo.toISOString());
    
    const eventCount = await prisma.event.count({
      where: {
        organizer_id: req.user.id,
        created_date: {
          gte: oneMonthAgo
        }
      }
    });

    console.log('Current event count:', eventCount);
    console.log('Limit check:', `${eventCount} >= ${eventsLimit} ?`, eventCount >= eventsLimit);

    // Check if limit is reached
    if (eventCount >= eventsLimit) {
      console.log('BLOCKING: Event limit reached');
      return res.status(403).json({ 
        error: `Event creation limit reached. You have created ${eventCount} of ${eventsLimit} events allowed on the ${pkg?.package_name || 'current'} plan this month. Please upgrade your plan to create more events.`,
        limit: eventsLimit,
        current: eventCount
      });
    }
    
    console.log('PASSED: Limit check passed, creating event...');
  } else {
    console.log('UNLIMITED: User has unlimited events');
  }

  // Convert datetime-local format to ISO-8601
  const eventData = {
    ...req.body,
    organizer_id: req.user.id,
    start_date: req.body.start_date ? new Date(req.body.start_date).toISOString() : undefined,
    end_date: req.body.end_date ? new Date(req.body.end_date).toISOString() : undefined
  };

  const event = await prisma.event.create({
    data: eventData,
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true
        }
      }
    }
  });

  // Generate QR code if not provided
  if (!event.qr_code) {
    const eventUrl = `${process.env.CLIENT_URL}/EventView?id=${event.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(eventUrl);
    
    await prisma.event.update({
      where: { id: event.id },
      data: { qr_code: qrCodeDataUrl }
    });
    
    event.qr_code = qrCodeDataUrl;
  }

  res.status(201).json(event);
});

/**
 * Get all events with optional query params
 */
export const getEvents = asyncHandler(async (req, res) => {
  const { sort, status, event_type, organizer_id } = req.query;

  const where = {};
  
  // Build filter conditions
  if (status) where.status = status;
  if (event_type) where.event_type = event_type;
  if (organizer_id) where.organizer_id = organizer_id;

  // If user is authenticated but not admin, only show their events for private queries
  if (req.user && req.user.role !== 'admin' && organizer_id === req.user.id) {
    where.organizer_id = req.user.id;
  }

  // Determine sort order
  let orderBy = { created_date: 'desc' }; // default
  if (sort) {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = sort.replace(/^-/, '');
    orderBy = { [field]: direction };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy,
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true
        }
      },
      _count: {
        select: {
          rsvps: true,
          media: true
        }
      }
    }
  });

  res.json(events);
});

/**
 * Filter events with complex queries
 */
export const filterEvents = asyncHandler(async (req, res) => {
  const { filters, sort } = req.body;

  const where = {};

  // Handle various filter types
  if (filters) {
    Object.keys(filters).forEach(key => {
      const value = filters[key];
      
      // Handle operators like $gte, $in, etc.
      if (typeof value === 'object' && !Array.isArray(value)) {
        if (value.$gte) where[key] = { gte: new Date(value.$gte) };
        if (value.$lte) where[key] = { lte: new Date(value.$lte) };
        if (value.$in) where[key] = { in: value.$in };
        if (value.$ne) where[key] = { not: value.$ne };
      } else {
        where[key] = value;
      }
    });
  }

  // Determine sort order
  let orderBy = { created_date: 'desc' };
  if (sort) {
    const direction = sort.startsWith('-') ? 'desc' : 'asc';
    const field = sort.replace(/^-/, '');
    orderBy = { [field]: direction };
  }

  const events = await prisma.event.findMany({
    where,
    orderBy,
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true
        }
      }
    }
  });

  res.json(events);
});

/**
 * Get event by ID
 */
export const getEventById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true
        }
      },
      rsvps: true,
      media: {
        where: {
          moderation_status: 'approved'
        }
      }
    }
  });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  res.json(event);
});

/**
 * Update event
 */
export const updateEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if event exists and user has permission
  const existingEvent = await prisma.event.findUnique({
    where: { id }
  });

  if (!existingEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check ownership or admin
  if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to update this event' });
  }

  // Convert datetime-local format to ISO-8601
  const updateData = {
    ...req.body,
    start_date: req.body.start_date ? new Date(req.body.start_date).toISOString() : undefined,
    end_date: req.body.end_date ? new Date(req.body.end_date).toISOString() : undefined
  };

  const event = await prisma.event.update({
    where: { id },
    data: updateData,
    include: {
      organizer: {
        select: {
          id: true,
          full_name: true,
          email: true
        }
      }
    }
  });

  res.json(event);
});

/**
 * Delete event
 */
export const deleteEvent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if event exists and user has permission
  const existingEvent = await prisma.event.findUnique({
    where: { id }
  });

  if (!existingEvent) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check ownership or admin
  if (existingEvent.organizer_id !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Not authorized to delete this event' });
  }

  await prisma.event.delete({
    where: { id }
  });

  res.json({ message: 'Event deleted successfully' });
});