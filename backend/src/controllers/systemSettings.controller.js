import { PrismaClient } from '@prisma/client';
import { asyncHandler } from '../middleware/errorHandler.js';

const prisma = new PrismaClient();

/**
 * Get all system settings
 */
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await prisma.systemSettings.findMany();
  res.json(settings);
});

/**
 * Get setting by key
 */
export const getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const setting = await prisma.systemSettings.findUnique({
    where: { key }
  });

  if (!setting) {
    return res.status(404).json({ error: 'Setting not found' });
  }

  res.json(setting);
});

/**
 * Update or create setting
 */
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const setting = await prisma.systemSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value }
  });

  res.json(setting);
});

/**
 * Create settings object (stores all settings as JSON in one record)
 */
export const createSettings = asyncHandler(async (req, res) => {
  const settingsData = req.body;
  
  // Store as JSON string in a single record with key 'platform_settings'
  const setting = await prisma.systemSettings.create({
    data: {
      key: 'platform_settings',
      value: JSON.stringify(settingsData)
    }
  });

  res.status(201).json({
    id: setting.id,
    ...settingsData
  });
});

/**
 * Update settings object by ID
 */
export const updateSettingsById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const settingsData = req.body;

  // Check if settings exist
  const existing = await prisma.systemSettings.findUnique({
    where: { id }
  });

  if (!existing) {
    return res.status(404).json({ error: 'Settings not found' });
  }

  // Update the JSON value
  const updated = await prisma.systemSettings.update({
    where: { id },
    data: {
      value: JSON.stringify(settingsData)
    }
  });

  res.json({
    id: updated.id,
    ...settingsData
  });
});

/**
 * Get settings by ID
 */
export const getSettingsById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const setting = await prisma.systemSettings.findUnique({
    where: { id }
  });

  if (!setting) {
    return res.status(404).json({ error: 'Settings not found' });
  }

  // Parse JSON and return
  const parsed = JSON.parse(setting.value);
  res.json({
    id: setting.id,
    ...parsed
  });
});
