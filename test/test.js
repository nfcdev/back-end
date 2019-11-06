/* eslint-disable global-require */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const pool = require('../connect');

let app;

before((done) => {
  app = require('../server');
  app.on('APP_STARTED', () => {
    done();
  });
});

describe('Test Database connection', () => {
  it('Application should login to database', (done) => {
    pool.getConnection((err, resp) => {
      expect(err).equal(null);
      done();
    });
  });
});

describe('Testing route cases', () => {
  it('Should return all cases (100 cases)', (done) => {
    request(app)
      .get('/case')
      .end((err, resp) => {
        const cases = resp.body.length;
        expect(err).to.equal(null);
        expect(cases).to.equal(100);
        done();
      });
  });



  it('Should return specific case (id: 5)', (done) => {
    request(app)
      .get('/case/5')
      .end((err, resp) => {
        const reqCase = resp.body;
        expect(err).to.equal(null);
        expect(reqCase.length).to.equal(1);
        expect(reqCase[0].id).to.equal(5);
        done();
      });
  });
});


//post
 
//delete

describe('Test route branches', () => {
    it('Should reurn all branches (5 branches)', (done) => {
        request(app)
            .get('/branch')
            .end((err, resp) => {
                const branches = resp.body.length;
                expect(err).to.equal(null);
                expect(branches).to.equal(5);
                done();
            });
    });

    it('Should return specific branch (id: 3)', (done) => {
        request(app)
            .get('/branch/3')
            .end((err, resp) => {
                const reqBranch = resp.body;
                expect(err).to.equal(null);
                expect(reqBranch.length).to.equal(1);
                expect(reqBranch[0].id).to.equal(3);
                done();
            });
    });
});
