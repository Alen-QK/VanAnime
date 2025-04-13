import { BASIC_STATES } from './basic';

export const QB_V5_ENDPOINTS = {
  stop: 'stop',
  start: 'start',
} as const;

export const QB_V5_STATES = {
  ...BASIC_STATES,
  stoppedUP: 'stoppedUP',
  stoppedDL: 'stoppedDL',
} as const;
