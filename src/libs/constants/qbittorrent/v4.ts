import { BASIC_STATES } from './basic';

export const QB_V4_ENDPOINTS = {
  stop: 'pause',
  start: 'resume',
} as const;

export const QB_V4_STATES = {
  ...BASIC_STATES,
  stoppedUP: 'pausedUP',
  stoppedDL: 'pausedDL',
} as const;
