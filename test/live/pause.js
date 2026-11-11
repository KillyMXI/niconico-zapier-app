import { setTimeout as delay } from 'node:timers/promises';
import { afterEach } from 'node:test';

// The search API asks clients to wait between requests.
export const pauseBetweenTests = () => afterEach(() => delay(1000));
