import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Create new RSVP
 */
export const createRSVP = asyncHandler(async (req, res) => {
  const { event_id, guest_email } = req.body;

  // Check if event exists
  const event = await prisma.event.findUnique({
    where: { id: event_id }
  });

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  // Check if event is invite-only and email is allowed
  if (event.event_type === 'invite_only') {
    const normalizedEmail = guest_email.toLowerCase();
    const allowedEmails = event.allowed_emails.map(e => e.toLowerCase());
    
    if (!allowedEmails.includes(normalizedEmail)) {
      return res.status(403).json({ 
        error: 'Email not authorized',
        message: 'Your email is not on the guest list for this invite-only event'
      });
    }
  }

  // Check if RSVP already exists for this email
  const existingRSVP = await prisma.rSVP.findFirst({
    where: {
      event_id,
      guest_email
    }
  });

  if (existingRSVP) {
    return res.status(400).json({ 
      error: 'RSVP already exists',
      message: 'You have already RSVP\'d for this event'
    });
  }

  const rsvp = await prisma.rSVP.create({
    data: req.body,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          start_date: true,
          location: true
        }
      }
    }
  });

  res.status(201).json(rsvp);
});

/**
 * Get all RSVPs
 */
export const getRSVPs = asyncHandler(async (req, res) => {
  const { event_id, status } = req.query;

  const where = {};
  if (event_id) where.event_id = event_id;
  if (status) where.status = status;

  const rsvps = await prisma.rSVP.findMany({
    where,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          start_date: true
        }
      }
    },
    orderBy: {
      created_at: 'desc'
    }
  });

  res.json(rsvps);
});

/**
 * Filter RSVPs with complex queries
 */
export const filterRSVPs = asyncHandler(async (req, res) => {
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

  const rsvps = await prisma.rSVP.findMany({
    where,
    orderBy,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          start_date: true
        }
      }
    }
  });

  res.json(rsvps);
});

/**
 * Get RSVP by ID
 */
export const getRSVPById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rsvp = await prisma.rSVP.findUnique({
    where: { id },
    include: {
      event: true
    }
  });

  if (!rsvp) {
    return res.status(404).json({ error: 'RSVP not found' });
  }

  res.json(rsvp);
});

/**
 * Update RSVP
 */
export const updateRSVP = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const rsvp = await prisma.rSVP.update({
    where: { id },
    data: req.body,
    include: {
      event: {
        select: {
          id: true,
          title: true,
          start_date: true
        }
      }
    }
  });

  res.json(rsvp);
});

/**
 * Delete RSVP
 */
export const deleteRSVP = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await prisma.rSVP.delete({
    where: { id }
  });

  res.json({ message: 'RSVP deleted successfully' });
});

