// Shared upload rules shown on the talent upload screens.
// The admin rejects submissions that violate these, sending the reason back to the uploader.

export const TALENT_CATEGORIES = [
  'Actor',
  'Actress',
  'Singer',
  'Dancer',
  'Musician',
  'Comedian',
  'Model',
  'Other',
] as const;

export const UPLOAD_GUIDELINES: string[] = [
  'Clear face and good lighting — keep the video 15 seconds to 2 minutes long.',
  'Show your own original performance only (acting, singing, dancing, etc.).',
  'No nudity, violence, hate speech, or copyrighted music/movie clips.',
  'No phone numbers, watermarks, ads, or other contact info inside the video.',
  'Our team reviews every video within 24 hours. Rule violations are rejected with a reason.',
];
