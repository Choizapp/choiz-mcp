import { changeEmailTool } from './change-email.js';
import { disableSubscriptionTool } from './disable-subscription.js';
import { enableSubscriptionTool } from './enable-subscription.js';
import { getTreatmentsTool } from './get-treatments.js';
import { lookupAccountTool } from './lookup-account.js';
import { resetPasswordTool } from './reset-password.js';

export const allTools = [
  lookupAccountTool,
  getTreatmentsTool,
  changeEmailTool,
  resetPasswordTool,
  enableSubscriptionTool,
  disableSubscriptionTool,
] as const;
