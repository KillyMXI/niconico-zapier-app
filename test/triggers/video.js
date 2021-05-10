
const should = require('should');
const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);
zapier.tools.env.inject();

describe('My App', function () {
  this.timeout(5000);

  it('should run triggers.video', done => {
    const bundle = { inputData: {
      q: 'StrikeVector OR "Strike Vector"',
      targets: 'title,description,tags',
      _sort: 'startTime',
      _limit: 10,
      _context: 'zapier.com integration test'
    }};

    appTester(App.triggers.video.operation.perform, bundle)
      .then(results => {
        should.exist(results);
        results.length.should.equal(10);
        results.forEach(result => {
          result.should.have.property('startTime');
          result.should.have.property('description');
          result.should.have.property('tags');
          result.should.have.property('viewCounter');
          result.should.have.property('contentId');
          result.should.have.property('title');
          result.should.have.property('commentCounter');
          result.should.have.property('thumbnailUrl');
          result.should.have.property('id');
          result.id.should.equal(result.contentId);
          result.should.have.property('url');
          result.should.have.property('descriptionMarkdown');
          result.descriptionMarkdown.includes('<br').should.be.false();
        });
        const date0 = new Date(results[0].startTime);
        const date3 = new Date(results[3].startTime);
        const date9 = new Date(results.slice(-1).pop().startTime);
        date0.should.be.above(date3);
        date3.should.be.above(date9);
        done();
      })
      .catch(done);
  });
});
