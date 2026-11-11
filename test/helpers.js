import assert from 'node:assert/strict';
import { after, afterEach, before } from 'node:test';
import nock from 'nock';
import zapier from 'zapier-platform-core';
import App from '../index.js';

export { App };
export const appTester = zapier.createAppTester(App);

// Blocks real network access, so an unmocked request fails instead of
// reaching Niconico, and fails any test that leaves a mock unused.
export const useMockedNetwork = () => {
  before(() => nock.disableNetConnect());
  afterEach(() => {
    const unused = nock.pendingMocks();
    nock.cleanAll();
    assert.deepEqual(unused, []);
  });
  after(() => nock.enableNetConnect());
};
