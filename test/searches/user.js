
const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('My App', () => {
  it('should run searches.user', done => {
    const bundle = { inputData: { user_id: 383484 } };

    appTester(App.searches.user.operation.perform, bundle)
      .then(result => {
        should.exist(result);
        result.should.have.property('id');
        result.should.have.property('nickname');
        result.should.have.property('thumbnail_url');
        result.id.should.be.equal('383484');
        done();
      })
      .catch(done);
  });
});
