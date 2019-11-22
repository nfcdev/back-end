/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const mockdata = require('./mockdata');
const pool = require('../src/util/connect');


// TODO:
// Request /login, body { name: admon }

let app;
let TOKEN;
let cookie;


before((done) => {
  app = require('../server');
  app.on('APP_STARTED', () => {
    request(app)
      .post('/login')
      .send({
        name: 'admun',
      })
      .end((err, resp) => {
        TOKEN = resp.body.token;
        cookie = resp.headers['set-cookie'];
        console.log('========================');
        console.log('TOKEN:', TOKEN);
        console.log('========================');
        done();
      });
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
      .set('Authorization', `JWT ${TOKEN}`)
      .end((err, resp) => {
        const cases = resp.body;
        expect(err).to.equal(null);
        expect(cases.length).to.equal(100);
        done();
      });
  });


  it('Should return specific case (id: 5)', (done) => {
    request(app)
      .get('/case/5')
      .set('Authorization', `JWT ${TOKEN}`)
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
  });
});


describe('Testing PUT funtionality on branch', () => {
  it('Should update the name of a branch (id:2)', (done) => {
    const p1 = new Promise((res, rej) => {
      request(app)
        .put('/branch/2')
        .send({
          name: 'Test Branch',
        })
        .end((err, resp) => {
          expect(err).to.be.equal(null);
          expect(resp.body.name).to.be.equal('Test Branch');
          res(resp.body);
        });
    });

    p1.then((branchUpdateResult) => {
      request(app)
        .get('/branch')
        .end((err, resp) => {
          let updatedBranch;
          resp.body.forEach((branch) => {
            if (branch.id.toString() === branchUpdateResult.id) {
              updatedBranch = branch;
            }
          });
          expect(updatedBranch.name).to.be.equal('Test Branch');
          done();
        });
    });
  });
});


describe('Testing branch function post', () => {
  let branchID;
  it('Should add a new branch', (done) => {
    const p1 = new Promise((res, rej) => {
      request(app)
        .post('/branch')
        .send({
          name: 'post test branch',
        })
        .end((err, resp) => {
          expect(err).to.be.equal(null);
          expect(resp.body.name).to.be.equal('post test branch');
          branchID = resp.body.id;
          res();
        });
    });

    p1.then(() => {
      request(app)
        .get('/branch')
        .end((err, resp) => {
          expect(err).to.be.equal(null);
          expect(resp.body.length).to.be.equal(6);
          done();
        });
    });
  });

  it('Should delete the branch with id: 6 (Post Branch)', (done) => {
    request(app)
      .delete(`/branch/${branchID}`)
      .end((err, resp) => {
        expect(err).to.be.equal(null);
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
    const p1 = new Promise((res, rej) => {
      request(app)
        .post('/storageroom')
        .send({
          name: 'test room',
          branch: 2,
        })
        .end((err, resp) => {
          const storage = resp.body;
          expect(err).to.equal(null);
          expect(storage.name).to.equal('test room');
          expect(storage.branch).to.equal(2);
          res();
        });
    });

    p1.then(() => {
      request(app)
        .get('/storageroom')
        .end((err, resp) => {
          const storageroom = resp.body.length;
          expect(err).to.equal(null);
          expect(storageroom).to.equal(7);
          done();
        });
    });
  });
});


describe('Testing storage room put', () => {
  it('should update specified storageroom', (done) => {
    const p1 = new Promise((res, rej) => {
      request(app)
        .put('/storageroom/1')
        .send({
          name: 'Testing room',
          branch: 1,
        })
        .end((err, resp) => {
          const { name, branch } = resp.body;
          expect(err).to.equal(null);
          expect(name).to.equal('Testing room');
          expect(branch).to.equal(1);
          res();
        });
    });

    p1.then(() => {
      request(app).get('/storageroom/branch/1')
        .end((err, resp) => {
          const storagerooms = resp.body;
          const updatedStorageroom = storagerooms.find((room) => room.id === 1);

          expect(updatedStorageroom.name).to.equal('Testing room');
          expect(updatedStorageroom.branch).to.be.equal(1);
          done();
        });
    });
  });
});


// Måste se till att man försöker ta bort ett storage room som inte används av något fält

// describe('Testing storage room delete', () => {
//   it('Should test removing a storage room', (done) => {
//     const p1 = new Promise((res, rej) => {
//       request(app)
//         .delete('/storageroom/1')
//         .end((err, resp) => {
//           expect(err).to.equal(null);
//         });
//     });
//     p1.then(() => {
//       request(app).get('/storageroom/branch/3')
//         .end((err, resp) => {
//           const rooms = resp.body.length;
//           expect(err).to.equal(null);
//           expect(rooms).to.equal(1);
//           done();
//         });
//     });
//   });
// });


describe('Testing storage room branch', () => {
  it('Should test to printing every storage room on a branch', (done) => {
    request(app)
      .get('/storageroom/branch/1')
      .end((err, resp) => {
        const rooms = resp.body;
        expect(err).to.equal(null);
        expect(rooms.length).to.equal(2);
        done();
      });
  });
});


describe('Testing package get', () => {
  it('Should test printing all packages from a specific branch', (done) => {
    request(app)
      .get('/package/branch/2')
      .end((err, resp) => {
        const packages = resp.body.length;
        expect(err).to.equal(null);
        expect(packages).to.equal(10);
        done();
      });
  });
});


describe('Testing Package/Storageroom/ID Get', () => {
  it('Should test printing all packages in a specific storageroom', (done) => {
    request(app)
      .get('/package/storageroom/1')
      .end((err, resp) => {
        const shelves = resp.body;
        expect(err).to.equal(null);
        expect(shelves.length).to.equal(8);
        done();
      });
  });
});


describe('Testing Shelf/Storageroom/ID Get', () => {
  it('Should test printing all shelves in a specific storageroom', (done) => {
    request(app)
      .get('/shelf/storageroom/1')
      .end((err, resp) => {
        const shelves = resp.body;
        expect(err).to.equal(null);
        expect(shelves.length).to.equal(9);
        done();
      });
  });
});


describe('Testing Package/Branch/ID Get', () => {
  it('Should test printing all packages in a specific branch', (done) => {
    request(app)
      .get('/package/branch/1')
      .end((err, resp) => {
        const packages = resp.body;
        expect(err).to.equal(null);
        expect(packages.length).to.equal(18);
        done();
      });
  });
});
