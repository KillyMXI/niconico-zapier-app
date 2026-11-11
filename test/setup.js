// zapier-platform-core detects a test run by looking for mocha or jest in
// process.argv, which misses node:test. NODE_ENV=test turns its test mode on:
// failed output checks (such as a search not returning an array) throw
// instead of only being logged, and the per-call memory log is silenced.
process.env.NODE_ENV ??= 'test';
