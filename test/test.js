/* eslint-disable global-require */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const pool = require('../src/util/connect');

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


// // post


// describe('Test route branches', () => {
//   it('Should return all branches(GET) (5 branches)', (done) => {
//     request(app)
//       .get('/branch')
//       .end((err, resp) => {
//         const branches = resp.body.length;
//         expect(err).to.equal(null);
//         expect(branches).to.equal(5);
//         done();
//       });
//   });

//   it('Should return specific branch (id: 3)', (done) => {
//         request(app)
//             .get('/branch/3')
//             .end((err, resp) => {
//                 const reqBranch = resp.body;
//                 expect(err).to.equal(null);
//                 expect(reqBranch.length).to.equal(1);
//                 expect(reqBranch[0].id).to.equal(3);
//                 done();
//             });
//     }); 
// });

// describe('Testing PUT funtionality on branch', () => {
//   it('Should ')
// })
// 

//describe('Testing branch function post', () => {
//  it('Should add a new branch', (done) => {
//    request(app)
//      .post('/branch')
//      .send({
//        name: 'test branch',
//      })
//      .end((err, resp) => {
//        expect(err).to.equal(null);
//      });
//    request(app).get('/branch/')
//      .end((err, resp) => {
//        const branchName = resp.body.el => el.id === 'test branch';
//        expect(branchName).to.not.equal(undefined);
//      });
//  });
//});


// delete
// API - /storageroom Written Simon
describe('Testing storage room get', () => {
  it('Should return all storage room (6 rooms)', (done) => {
    request(app)
      .get('/storageroom/')
      .end((err, resp) => {
        const rooms = resp.body.length;
        expect(err).to.equal(null);
         expect(rooms).to.equal(6);
         done();
      });
  });
});


describe('Testing storage room post', () => {
  it('Making sure a room is added, testing post', (done) => {
    request(app)
      .post('/storageroom')
      .send({
        name: 'test room',
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
      });
      request(app).get('/storageroom/')
        .end((err, resp) => {
          const testroom = resp.body.el => el.id === 'test room';
          expect(testroom).to.not.equal(undefined);
          done();
        });
  });
});


describe('Testing storage room put', () => {
  it('should update specified storageroom', (done) => {
    request(app)
      .put('/storageroom/1')
      .send({
        name: 'Testing room'
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
      });
      request(app).get('/storageroom/')
        .end((err, resp) => {
          const testingroom = resp.body.el => el.id === 'Testing room';
          expect(testroom).to.not.equal(undefined);
          done();
        })
  });
});


//   it('Should return stooragerooms in a branch (branch id: 2)', (done) => {
//     request(app)
//       .get('/storageroom/branch/2')
//       .end((err, resp) => {
//         const reqroom = resp.body;
//         expect(err).to.equal(null);
//         expect(reqroom.length).to.equal(1);
//         expect(reqroom[0].id).to.equal(3);
//         done();
//       });
//   });
// });
