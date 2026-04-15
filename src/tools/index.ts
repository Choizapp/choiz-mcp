import { changeDeliveryDateTool } from './change-delivery-date.js';
import { changeEmailTool } from './change-email.js';
import { disableSubscriptionTool } from './disable-subscription.js';
import { enableSubscriptionTool } from './enable-subscription.js';
import { getOrderTool } from './get-order.js';
import { getTreatmentsTool } from './get-treatments.js';
import { listOrdersTool } from './list-orders.js';
import { lookupAccountTool } from './lookup-account.js';
import { mergeAccountsTool } from './merge-accounts.js';
import { resetPasswordTool } from './reset-password.js';

export const allTools = [
  lookupAccountTool,
  getTreatmentsTool,
  listOrdersTool,
  getOrderTool,
  changeEmailTool,
  resetPasswordTool,
  enableSubscriptionTool,
  disableSubscriptionTool,
  changeDeliveryDateTool,
  mergeAccountsTool,
] as const;
