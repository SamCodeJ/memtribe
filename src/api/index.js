/**
 * API Switcher
 * 
 * Toggle between Base44 and Custom Backend by changing USE_CUSTOM_BACKEND
 * 
 * To migrate:
 * 1. Set USE_CUSTOM_BACKEND = true
 * 2. Ensure backend is running on http://localhost:5000
 * 3. Set VITE_API_URL in .env file
 */

const USE_CUSTOM_BACKEND = true; // Change to true to use custom backend

// Entities
export const Event = USE_CUSTOM_BACKEND 
  ? (await import('./newEntities.js')).Event 
  : (await import('./entities.js')).Event;

export const RSVP = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).RSVP
  : (await import('./entities.js')).RSVP;

export const Media = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).Media
  : (await import('./entities.js')).Media;

export const User = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).User
  : (await import('./entities.js')).User;

export const Package = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).Package
  : (await import('./entities.js')).Package;

export const Feature = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).Feature
  : (await import('./entities.js')).Feature;

export const PackageFeature = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).PackageFeature
  : (await import('./entities.js')).PackageFeature;

export const SystemSettings = USE_CUSTOM_BACKEND
  ? (await import('./newEntities.js')).SystemSettings
  : (await import('./entities.js')).SystemSettings;

// Integrations
export const UploadFile = USE_CUSTOM_BACKEND
  ? (await import('./newIntegrations.js')).UploadFile
  : (await import('./integrations.js')).UploadFile;

export const GenerateImage = USE_CUSTOM_BACKEND
  ? (await import('./newIntegrations.js')).GenerateImage
  : (await import('./integrations.js')).GenerateImage;

export const SendEmail = USE_CUSTOM_BACKEND
  ? (await import('./newIntegrations.js')).SendEmail
  : (await import('./integrations.js')).SendEmail;

export const Core = USE_CUSTOM_BACKEND
  ? (await import('./newIntegrations.js')).Core
  : (await import('./integrations.js')).Core;

