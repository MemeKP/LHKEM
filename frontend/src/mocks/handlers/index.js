import { authHandlers } from './auth';
import { usersHandlers } from './users';
import { shopHandlers } from './shops';
import { workshopHandlers } from './workshops';
import { eventHandlers } from './events';
import { communityHandlers } from './communities';

export const handlers = [
  ...authHandlers,
  ...usersHandlers,
  ...shopHandlers,
  ...workshopHandlers,
  ...eventHandlers,
  ...communityHandlers
];
