const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const request = chai.request;

const mongoose = require('mongoose');
var mongooseConnect = process.env.MONGO_URI = 'mongodb://localhost/offense_test_db';

const port = process.env.PORT = 5556;
var app = require(__dirname + '/../server/_server');
var server;

const Offense = require(__dirname + '/../model/offense');

describe('the GET method on /api/offenses route', function() {
  this.timeout(4000);
  before((done) => {
    server = app(port, mongooseConnect, () => {
      console.log('server up on' + port);
      var newOffense = new Offense({ offense: 'gunIncident' });
      newOffense.save((err, data) => {
        if (err) throw err;
        this.offense = data;
        done();
      });
    });
  });
  after((done) => {
    mongoose.connection.db.dropDatabase( () => {
      mongoose.disconnect(() => {
        server.close(() => {
          done();
        });
      });
    });
  });
  it('should GET all the offenses', (done) => {
    request('localhost:' + port)
      .get('/api/offenses')
      .end((err, res) => {
        expect(err).to.eql(null);
        expect(Array.isArray(res.body)).to.eql(true);
        expect(res.body[0].offense).to.eql(this.offense.offense);
        done();
      });
  });
});
