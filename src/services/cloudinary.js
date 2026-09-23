/**
 * Cloudinary Upload & CDN Management Service
 * Supports direct unsigned browser uploads and automatic WebP/AVIF auto-formatting
 */

// Configuration with fallback to environment variables or localStorage for in-browser editing
export const getCloudinaryConfig = () => {
  const customCloudName = localStorage.getItem('custom_cloudinary_name');
  const customPreset = localStorage.getItem('custom_cloudinary_preset');

  return {
    cloudName: (customCloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "p41acwzz").trim(),
    uploadPreset: (customPreset || import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "alaa_portfolio").trim(),
    folder: "alaa_khedr_portfolio"
  };
};

export const saveCustomCloudinaryConfig = (cloudName, uploadPreset) => {
  if (cloudName !== undefined) localStorage.setItem('custom_cloudinary_name', cloudName.trim());
  if (uploadPreset !== undefined) localStorage.setItem('custom_cloudinary_preset', uploadPreset.trim());
};

/**
 * Checks if a string is a base64 Data URL
 */
export const isBase64Image = (str) => {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:image/') || str.includes(';base64,');
};

/**
 * Applies Cloudinary auto-optimization transformations (f_auto, q_auto)
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('cloudinary.com')) return url;

  const { width, quality = 'auto', format = 'auto' } = options;
  const transformations = [`f_${format}`, `q_${quality}`];
  if (width) transformations.push(`w_${width}`);

  const transformString = transformations.join(',');

  // Insert transformations after /upload/
  if (url.includes('/upload/') && !url.includes('/upload/f_auto') && !url.includes('/upload/q_auto')) {
    return url.replace('/upload/', `/upload/${transformString}/`);
  }

  return url;
};

/**
 * Uploads a single file (File/Blob) or a Base64 string directly to Cloudinary
 * @param {File|Blob|string} fileOrBase64 - File object, Blob, or base64 Data URL
 * @param {Object} options - { folder, onProgress, cloudName, uploadPreset }
 * @returns {Promise<string>} - Returns the secure CDN URL
 */
export const uploadToCloudinary = async (fileOrBase64, options = {}) => {
  const config = getCloudinaryConfig();
  const cloudName = options.cloudName || config.cloudName;
  const uploadPreset = options.uploadPreset || config.uploadPreset;
  const folder = options.folder || config.folder;

  if (!cloudName) {
    throw new Error("يرجى إدخال Cloud Name الخاص بـ Cloudinary في لوحة الإعدادات أو في ملف .env");
  }

  if (!uploadPreset) {
    throw new Error("يرجى إدخال Upload Preset (نوع Unsigned) في لوحة الإعدادات أو في ملف .env");
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", fileOrBase64);
  formData.append("upload_preset", uploadPreset);
  if (folder) {
    formData.append("folder", folder);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoint);

    if (options.onProgress && xhr.upload) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded * 100) / e.total);
          options.onProgress(percent);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          const secureUrl = data.secure_url || data.url;
          const optimized = getOptimizedImageUrl(secureUrl);
          resolve(optimized);
        } catch (err) {
          reject(new Error("فشل قراءة استجابة Cloudinary"));
        }
      } else {
        try {
          const errData = JSON.parse(xhr.responseText);
          reject(new Error(errData?.error?.message || `خطأ في الرفع (${xhr.status})`));
        } catch {
          reject(new Error(`خطأ في الرفع إلى Cloudinary (${xhr.status})`));
        }
      }
    };

    xhr.onerror = () => {
      reject(new Error("تعذر الاتصال بخدمة Cloudinary. تحقق من اتصال الإنترنت."));
    };

    xhr.send(formData);
  });
};
