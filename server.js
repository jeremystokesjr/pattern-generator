import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Enable CORS for frontend
app.use(cors());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ExifTool metadata extraction endpoint
app.post('/api/extract-metadata', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file provided' });
  }

  const imagePath = req.file.path;
  console.log('Processing image:', imagePath);

  // Use ExifTool to extract metadata
  const exifCommand = `exiftool -json "${imagePath}"`;
  
  exec(exifCommand, (error, stdout, stderr) => {
    // Clean up uploaded file
    fs.unlink(imagePath, (unlinkError) => {
      if (unlinkError) console.error('Error deleting file:', unlinkError);
    });

    if (error) {
      console.error('ExifTool error:', error);
      return res.status(500).json({ error: 'Failed to extract metadata' });
    }

    try {
      const metadata = JSON.parse(stdout)[0];
      console.log('Extracted metadata:', metadata);

      // Process and format the metadata
      const processedMetadata = {
        phoneType: detectPhoneType(metadata.Make, metadata.Model),
        lensType: detectLensType(metadata),
        lens: metadata.Make && metadata.Model ? `${metadata.Make} ${metadata.Model}` : null,
        iso: metadata.ISO || metadata.ISOSpeedRatings,
        aperture: metadata.FNumber,
        flash: detectFlash(metadata.Flash),
        orientation: metadata.Orientation,
        date: metadata.DateTimeOriginal ? metadata.DateTimeOriginal.split(' ')[0].replace(/:/g, '-') : null,
        time: metadata.DateTimeOriginal ? metadata.DateTimeOriginal.split(' ')[1] : null,
        timeOfDay: getTimeOfDay(metadata.DateTimeOriginal),
        gps: parseGPS(metadata.GPSLatitude, metadata.GPSLongitude),
        width: metadata.ImageWidth,
        height: metadata.ImageHeight,
        rawMetadata: metadata // Include raw metadata for debugging
      };

      res.json(processedMetadata);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      res.status(500).json({ error: 'Failed to parse metadata' });
    }
  });
});

// Helper function to detect phone type
function detectPhoneType(make, model) {
  if (!make || !model) return 'Unknown';
  
  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();
  
  if (makeLower.includes('apple') || modelLower.includes('iphone')) {
    if (modelLower.includes('15') && modelLower.includes('pro')) {
      return 'iPhone 15 Pro';
    } else if (modelLower.includes('15')) {
      return 'iPhone 15';
    } else if (modelLower.includes('14') && modelLower.includes('pro')) {
      return 'iPhone 14 Pro';
    } else if (modelLower.includes('14')) {
      return 'iPhone 14';
    } else {
      return 'iPhone';
    }
  }
  
  if (makeLower.includes('samsung') || modelLower.includes('galaxy')) {
    return 'Samsung Galaxy';
  }
  
  if (makeLower.includes('google') || modelLower.includes('pixel')) {
    return 'Google Pixel';
  }
  
  return `${make} ${model}`;
}

// Helper function to detect lens type
function detectLensType(metadata) {
  // Check for lens information in EXIF
  if (metadata.LensModel) {
    const lensModel = metadata.LensModel.toLowerCase();
    if (lensModel.includes('ultra wide') || lensModel.includes('ultrawide')) {
      return 'Ultra Wide';
    } else if (lensModel.includes('telephoto')) {
      return 'Telephoto';
    } else if (lensModel.includes('wide')) {
      return 'Wide';
    }
  }
  
  // Check focal length for lens type estimation
  if (metadata.FocalLength) {
    // Parse focal length (e.g., "2.2 mm" -> 2.2)
    const focalLengthMatch = metadata.FocalLength.match(/(\d+\.?\d*)/);
    if (focalLengthMatch) {
      const focalLength = parseFloat(focalLengthMatch[1]);
      if (focalLength < 3) {
        return 'Ultra Wide';
      } else if (focalLength > 6) {
        return 'Telephoto';
      } else {
        return 'Wide';
      }
    }
  }
  
  // Check 35mm equivalent focal length
  if (metadata.FocalLengthIn35mmFormat) {
    const focal35Match = metadata.FocalLengthIn35mmFormat.match(/(\d+\.?\d*)/);
    if (focal35Match) {
      const focal35 = parseFloat(focal35Match[1]);
      if (focal35 < 20) {
        return 'Ultra Wide';
      } else if (focal35 > 50) {
        return 'Telephoto';
      } else {
        return 'Wide';
      }
    }
  }
  
  return 'Wide'; // Default
}

// Helper function to detect flash
function detectFlash(flashValue) {
  if (!flashValue) return false;
  
  const flashStr = flashValue.toString().toLowerCase();
  if (flashStr.includes('on') || flashStr.includes('fired')) {
    return true;
  } else if (flashStr.includes('off') || flashStr.includes('did not fire')) {
    return false;
  }
  
  return false; // Default to no flash
}

// Helper function to parse GPS coordinates
function parseGPS(latStr, lonStr) {
  if (!latStr || !lonStr) return null;
  
  try {
    // Parse GPS coordinates (e.g., "40 deg 40' 39.25" N" -> 40.677569)
    const latMatch = latStr.match(/(\d+) deg (\d+)' ([\d.]+)" ([NS])/);
    const lonMatch = lonStr.match(/(\d+) deg (\d+)' ([\d.]+)" ([EW])/);
    
    if (latMatch && lonMatch) {
      const latDeg = parseFloat(latMatch[1]);
      const latMin = parseFloat(latMatch[2]);
      const latSec = parseFloat(latMatch[3]);
      const latDir = latMatch[4];
      
      const lonDeg = parseFloat(lonMatch[1]);
      const lonMin = parseFloat(lonMatch[2]);
      const lonSec = parseFloat(lonMatch[3]);
      const lonDir = lonMatch[4];
      
      let latitude = latDeg + latMin/60 + latSec/3600;
      let longitude = lonDeg + lonMin/60 + lonSec/3600;
      
      if (latDir === 'S') latitude = -latitude;
      if (lonDir === 'W') longitude = -longitude;
      
      return { latitude, longitude };
    }
  } catch (error) {
    console.error('GPS parsing error:', error);
  }
  
  return null;
}

// Helper function to determine time of day
function getTimeOfDay(dateTimeString) {
  if (!dateTimeString) return null;
  
  try {
    const date = new Date(dateTimeString);
    const hour = date.getHours();
    return (hour >= 6 && hour < 18) ? 'day' : 'night';
  } catch (error) {
    return null;
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'ExifTool API is running' });
});

app.listen(PORT, () => {
  console.log(`ExifTool API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
