const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Ensure upload directory exists
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
const createUploadDirs = () => {
  const dirs = [
    uploadDir,
    path.join(uploadDir, 'avatars'),
    path.join(uploadDir, 'documents'),
    path.join(uploadDir, 'products'),
    path.join(uploadDir, 'temp'),
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadDirs();

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'temp';
    
    if (file.fieldname === 'avatar' || file.fieldname === 'profilePhoto') {
      folder = 'avatars';
    } else if (file.fieldname === 'document') {
      folder = 'documents';
    } else if (file.fieldname === 'productImage') {
      folder = 'products';
    }
    
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = {
    image: /jpeg|jpg|png|gif|webp/,
    document: /pdf|doc|docx|xls|xlsx|txt/,
    csv: /csv/,
  };

  const ext = path.extname(file.originalname).toLowerCase().slice(1);
  
  // Check file type based on fieldname
  if (file.fieldname === 'avatar' || file.fieldname === 'profilePhoto' || file.fieldname === 'productImage') {
    if (allowedTypes.image.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  } else if (file.fieldname === 'csv') {
    if (allowedTypes.csv.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  } else if (file.fieldname === 'document') {
    if (allowedTypes.document.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only document files are allowed (pdf, doc, docx, xls, xlsx, txt)'));
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
  },
});

// Image processing middleware
const processImage = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const processedPath = filePath.replace(/\.[^.]+$/, '-processed.jpg');

    // Resize and optimize image
    await sharp(filePath)
      .resize(800, 800, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(filePath);

    // Update file info
    req.file.path = processedPath;
    req.file.filename = path.basename(processedPath);

    next();
  } catch (error) {
    console.error('Image processing error:', error);
    next(error);
  }
};

// Avatar processing (smaller size)
const processAvatar = async (req, res, next) => {
  if (!req.file || !req.file.mimetype.startsWith('image/')) {
    return next();
  }

  try {
    const filePath = req.file.path;
    const processedPath = filePath.replace(/\.[^.]+$/, '-processed.jpg');

    // Resize to square avatar
    await sharp(filePath)
      .resize(200, 200, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 90 })
      .toFile(processedPath);

    // Delete original file
    fs.unlinkSync(filePath);

    // Update file info
    req.file.path = processedPath;
    req.file.filename = path.basename(processedPath);

    next();
  } catch (error) {
    console.error('Avatar processing error:', error);
    next(error);
  }
};

// Delete file utility
const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Delete file error:', error);
    return false;
  }
};

// Get file URL
const getFileUrl = (filename, folder = 'temp') => {
  if (!filename) return null;
  return `/uploads/${folder}/${filename}`;
};

module.exports = {
  upload,
  processImage,
  processAvatar,
  deleteFile,
  getFileUrl,
  
  // Specific upload configurations
  uploadAvatar: upload.single('avatar'),
  uploadDocument: upload.single('document'),
  uploadProductImage: upload.single('productImage'),
  uploadCSV: upload.single('csv'),
  uploadMultiple: upload.array('files', 10),
};
