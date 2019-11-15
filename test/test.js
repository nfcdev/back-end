
/* eslint-disable global-require */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const mockdata = require('./mockdata')
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
describe('Testing PUT funtionality on branch', () => {
  it('Should update the name of a branch (id:3)'), (done) => {
    const p1 = new Promise ((res, rej) => {
      request(app)
      .put('/branch/3')
      .send({
        name: 'Test Branch',
      })
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.name).to.be.equal('Test Branch');
        res(res.body);
      });
    });

    p1.then(res => {
      request(app)
      .get('/branch')
      .end((err, resp) => {
        let updatedBranch;
        resp.body.forEach((branch) => {
          if (branch.id === res.id){
            updatedBranch = branch;
          }
        })

        updatedBranch.expect.to.be.equal()

        done();
      })
    }).catch(err => {

    })

    
  }
});

describe('Testing branch function post', () => {
  it('Should add a new branch', (done) => {
    request(app)
      .post('/branch')
      .send({
        name: 'Post Branch',
      })
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.name).to.be.equal('Post Branch');
      });
    request(app)
      .get('/branch')
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.length).to.be.equal(6);
      });
    done();
  });
});


describe('Testing branch function DELETE', () => {
  it('Should delete the branch with id: 6 (Post Branch)', (done) => {
    request(app)
      .delete('/branch/1')
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        //expect(resp.body.result).to.be.equal('ok');
        done();
      });
  });
  it('Should now be 5 branches', (done) => {
    request(app)
      .get('/branch')
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.length).to.be.equal(5);
        done();
      });
  });
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

// let p1;
// let updated;

// describe('Testing storage room post', () => {
//   it('Making sure a room is added, testing post', (done) => {
//     let p1 = new Promise(request(app)
//       .post('/storageroom')
//       .send({
//         name: 'test room',
//       })
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//       }));

//     p1.then(request(app).get('/storageroom/7')
//       .end((err, resp) => {
//         const testroom = resp.body.name;
//         expect(testroom).to.equal('test room');
//         done();
//       }));
//   });
// });


// describe('Testing storage room put', () => {
//   it('should update specified storageroom', (done) => {
//     let p1 = new Promise(request(app)
//       .put('/storageroom/1')
//       .send({
//         name: 'Testing room',
//         branch: 1
//       })
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//       }));
//     p1.then(request(app).get('/storageroom/')
//       .end((err, resp) => {
//         const testingroom = resp.body(el) => el(id) === 1;
//         expect(testingroom).to.equal('Testing room')
//         done();
//       }));
//     p1.then(request(app).get('/storageroom/1')
//       .end((err, resp) => {
//         const testingroom = resp.body.name;
//         expect(testingroom).to.equal('Testing room')
//         done();
//       }));
//   });
// });


// describe('Testing storage room delete', () => {
//   it('Should test removing a storage room', (done) => {
//     let p1 = new Promise(request(app)
//       .delete('/storageroom/1')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//       }));
//     p1.then(request(app).get('/storageroom/branch/3')
//       .end((err, resp) => {
//         const rooms = resp.body.length;
//         expect(err).to.equal(null);
//         expect(rooms).to.equal(1);
//         done();
//       }));
//       .delete ('/storageroom/')
//       .send({
//         name: 'Vapen materialrum 1'
//       })
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//       }));
//   p1.then(request(app).get('/storageroom/1')
//     .end((err, resp) => {
//       expect(err).to.not.equal(null);
//       done();
//     }));
// });
// });



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


// describe('Testing package get', () => {
//   it('Should test printing all packages from a specific branch', (done) => {
//     request(app)
//       .get('/package/branch/6')
//       .end((err, resp) => {
//         const packages = resp.body.length;
//         expect(err).to.equal(null);
//         expect(packages).to.equal(2);
//         done();
//       });
//   });
// });