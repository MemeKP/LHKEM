export enum EmailType {
  WORKSHOP_REGISTERED = 'WORKSHOP_REGISTERED',
  WORKSHOP_CANCELLED = 'WORKSHOP_CANCELLED',
  WORKSHOP_UPDATED = 'WORKSHOP_UPDATED',
  WORKSHOP_REMINDER = 'WORKSHOP_REMINDER',
  WORKSHOP_ANNOUNCEMENT = 'WORKSHOP_ANNOUNCEMENT',
}

export interface EmailPayload {
  [key: string]: any; 
  // workshop_title?: string;
  // user_name?: string;
  // date?: string;
}