export interface QualityVariant {
  label: string;
  url: string;
}

const CLOUDINARY_UPLOAD_MARKER = '/upload/';

// Cloudinary video URLs look like:
//   https://res.cloudinary.com/<cloud>/video/upload/v<version>/<folder>/<public_id>.<ext>
// Inserting a transformation string right after "/upload/" asks Cloudinary to serve
// (and lazily generate/cache) a re-encoded rendition at that quality/height on the fly.
const withTransform = (url: string, transform: string): string => {
  const idx = url.indexOf(CLOUDINARY_UPLOAD_MARKER);
  if (idx === -1) return url;
  const insertAt = idx + CLOUDINARY_UPLOAD_MARKER.length;
  return `${url.slice(0, insertAt)}${transform}/${url.slice(insertAt)}`;
};

// Returns the quality options to show in the player's "Quality" picker.
// Falls back to a single "Auto" (source) option for non-Cloudinary URLs so
// nothing crashes for e.g. the admin dashboard's plain sample video fallback.
export const getQualityVariants = (url: string): QualityVariant[] => {
  if (!url || !url.includes('res.cloudinary.com') || !url.includes(CLOUDINARY_UPLOAD_MARKER)) {
    return [{ label: 'Auto', url }];
  }

  return [
    { label: 'Auto', url },
    { label: '1080p', url: withTransform(url, 'q_auto,h_1080,c_limit') },
    { label: '720p', url: withTransform(url, 'q_auto,h_720,c_limit') },
    { label: '480p', url: withTransform(url, 'q_auto,h_480,c_limit') },
  ];
};
