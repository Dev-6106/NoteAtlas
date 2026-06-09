

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
export const apiUrl = rawApiUrl.trim().replace(/\/$/, '');


export const googleClientId=import.meta.env.VITE_GOOGLE_CLIENT_ID
export const developerKey=import.meta.env.VITE_DEVELOPPER_KEY