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


describe('Test route branches', () => {
  it('Should return all branches(GET) (5 branches)', (done) => {
    request(app)
      .get('/branch')
      .end((err, resp) => {
        const branches = resp.body.length;
        expect(err).to.equal(null);
        expect(branches).to.equal(5);
        done();
      });
  }
  );

  // it('Should return specific branch (id: 3)', (done) => {
  //   request(app)
  //     .get('/branch/3')
  //     .end((err, resp) => {
  //       const reqBranch = resp.body;
  //       expect(err).to.equal(null);
  //       expect(reqBranch.length).to.equal(1);
  //       expect(reqBranch[0].id).to.equal(3);
  //       done();
  //     });
  // });
});

let p1;
let updated;
describe('Testing PUT funtionality on branch', () => {
  it('Should update the name of a branch'), (done) => {
    p1 = new Promise(request(app)
      .put('/branch/3')
      .send({
        name: 'Test_Branch',
      })
      .end((err, resp) => {
        expect(err).to.be.equal(null);
      }));
    p1.then(request(app)
      .get('/branch')
      .end((err, resp) => {
        const branches = resp.body;
        branches.forEach(name => {
          if (name === 'Test_Branch') {
            updated = name;
          }
        });
        expect(updated).to.be.equal('Test_Branch');
      }));
  }
});


// describe('Testing branch function post', () => {
//   it('Should add a new branch', (done) => {
//     request(app)
//       .post('/branch/Testing facility')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//       });
//   });
// });
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
    let p1 = new Promise(request(app)
      .post('/storageroom')
      .send({
        name: 'test room',
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
      }));

      p1.then(request(app).get('/storageroom/7')
        .end((err, resp) => {
          const testroom = resp.body.name;
          expect(testroom).to.equal('test room');
          done();
        }));
  });
});


describe('Testing storage room put', () => {
  it('should update specified storageroom', (done) => {
    let p1 = new Promise(request(app)
      .put('/storageroom/1')
      .send({
        name: 'Testing room'
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
      }));
      p1.then(request(app).get('/storageroom/1')
        .end((err, resp) => {
          const testingroom = resp.body.name;
          expect(testingroom).to.equal('Testing room')
          done();
        }));
  });
});


describe('Testing storage room delete', () => {
  it('Should test removing a storage room', (done) => {
    let p1 = new Promise(request(app)
       .delete('/storageroom/')
       .send({
         name: 'Vapen materialrum 1'
       })
       .end((err, resp) => {
          expect(err).to.equal(null);
        }));
      p1.then(request(app).get('/storageroom/1')
        .end((err, resp) => {
          expect(err).to.not.equal(null);
          done();
        }));
  });
}); 


describe('Testing storage room branch', () => {
  it('Should test to printing every storage room on a branch', (done) => {
    request(app)
      .get('/storageroom/branch/1')
      .end((err, resp) => {
        const rooms = resp.body.length;
        expect(err).to.equal(null)
        expect(rooms).to.equal(2);
        done();
      });
  });
});