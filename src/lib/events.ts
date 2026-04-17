import { EventEmitter } from 'events';

class ClinicEmitter extends EventEmitter {}

export const eventEmitter = new ClinicEmitter();
