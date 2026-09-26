import exifr from 'exifr';
import path from 'path';

/**
 * Extract available EXIF/TIFF/GPS metadata from an evidence file.
 * Returns null for missing fields. NEVER fabricates missing information.
 *
 * @param {string} filePath - Absolute path to the file
 * @param {string} mimeType - File MIME type
 * @returns {Promise<Object>} Structured metadata
 */
export const extractEvidenceMetadata = async (filePath, mimeType) => {
  const result = {
    dateTimeOriginal: null,
    createDate: null,
    gpsLatitude: null,
    gpsLongitude: null,
    make: null,
    model: null,
    orientation: null,
    imageWidth: null,
    imageHeight: null,
    hasGps: false,
    hasExif: false,
    rawFieldsFound: [],
  };

  const isImage = mimeType && (mimeType.startsWith('image/') || /\.(jpg|jpeg|png|heic|webp|tiff)$/i.test(filePath));

  if (!isImage) {
    // Documents or non-images don't have camera EXIF
    return result;
  }

  try {
    // Parse EXIF, GPS, TIFF, and dimensions using exifr
    const data = await exifr.parse(filePath, {
      tiff: true,
      exif: true,
      gps: true,
      xmp: true,
      translateKeys: true,
      reviveValues: true,
    });

    if (!data) {
      return result;
    }

    result.hasExif = true;
    result.rawFieldsFound = Object.keys(data);

    // DateTimeOriginal extraction
    if (data.DateTimeOriginal) {
      result.dateTimeOriginal = data.DateTimeOriginal instanceof Date 
        ? data.DateTimeOriginal.toISOString() 
        : String(data.DateTimeOriginal);
    }

    // CreateDate extraction
    if (data.CreateDate) {
      result.createDate = data.CreateDate instanceof Date 
        ? data.CreateDate.toISOString() 
        : String(data.CreateDate);
    } else if (data.ModifyDate) {
      result.createDate = data.ModifyDate instanceof Date
        ? data.ModifyDate.toISOString()
        : String(data.ModifyDate);
    }

    // GPS coordinates extraction
    if (typeof data.latitude === 'number' && !isNaN(data.latitude)) {
      result.gpsLatitude = Number(data.latitude.toFixed(6));
    } else if (typeof data.GPSLatitude === 'number' && !isNaN(data.GPSLatitude)) {
      result.gpsLatitude = Number(data.GPSLatitude.toFixed(6));
    }

    if (typeof data.longitude === 'number' && !isNaN(data.longitude)) {
      result.gpsLongitude = Number(data.longitude.toFixed(6));
    } else if (typeof data.GPSLongitude === 'number' && !isNaN(data.GPSLongitude)) {
      result.gpsLongitude = Number(data.GPSLongitude.toFixed(6));
    }

    if (result.gpsLatitude !== null && result.gpsLongitude !== null) {
      result.hasGps = true;
    }

    // Device information
    if (data.Make) {
      result.make = String(data.Make).trim();
    }
    if (data.Model) {
      result.model = String(data.Model).trim();
    }

    // Dimensions
    if (data.ImageWidth || data.ExifImageWidth) {
      result.imageWidth = Number(data.ImageWidth || data.ExifImageWidth);
    }
    if (data.ImageHeight || data.ExifImageHeight) {
      result.imageHeight = Number(data.ImageHeight || data.ExifImageHeight);
    }

    // Orientation
    if (data.Orientation) {
      result.orientation = data.Orientation;
    }

    return result;
  } catch (err) {
    // If extraction fails on corrupted or non-standard format, log and safely return empty metadata
    console.warn(`[metadataService] Metadata extraction skipped or failed for ${path.basename(filePath)}: ${err.message}`);
    return result;
  }
};
