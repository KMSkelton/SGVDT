const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const request = chai.request;

const mongoose = require('mongoose');
const mongooseConnect = process.env.MONGO_URI = 'mongodb://localhost/user_test_db';

const port = process.env.PORT = 5557;
var app = require(__dirname + '/../server/_server');
var server;

const User = require(__dirname + '/../model/user');

describe('signup and signin user routes', function() {
  this.timeout(4000);
  before((done) => {
    server = app(port, mongooseConnect, () => {
      console.log('server up on ' + port);
      var newUser = new User({ username: 'one', password: 'one' });
      newUser.generateHash('one');
      newUser.save((err, data) => {
        if (err) throw err;
        this.user = data;
        this.token = data.generateToken();
        done();
      });
    });
  });
  after((done) => {
    mongoose.connection.db.dropDatabase( () => {
      mongoose.disconnect( () => {
        server.close( () => {
          done();
        });
      });
    });
  });

  it('should generate a new user and token with signup', (done) => {
    request('localhost:' + port)
    .post('/signup')
    .send({ username: 'two', password: 'two' })
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.status).to.eql(200);
      User.findOne({ username: 'two' }, (err, data) => {
        expect(err).to.eql(null);
        expect(data.username).to.eql('two');
        expect(res.body.token).to.not.eql(null);
        done();
      });
    });
  });
  it('should log in user and generate a token at signin', (done) => {
    request('localhost:' + port)
    .get('/signin')
    .auth('one', 'one')
    .end((err, res) => {
      expect(err).to.eql(null);
      expect(res.status).to.eql(200);
      expect(res.body).to.not.eql(null);
      expect(res.body.token).to.not.eql(null);
      done();
    });
  });
});
