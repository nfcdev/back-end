/* eslint-disable no-unused-vars */
/* eslint-disable global-require */
/* eslint-disable no-undef */
const { expect } = require('chai');
const request = require('supertest');
const mockdata = require('./mockdata');
const pool = require('../src/util/connect');
const { APISUFFIX } = require('../config');


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




  it('Should update the name of a branch (id:2). PUT function', (done) => {
    const p1 = new Promise((res, rej) => {
      request(app)
        .put('/branch/2')
        .send({
          name: 'Test Branch',
        })
        .end((err, resp) => {
          console.log('error', err);
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


describe('Testing branch endpoints', () => {
  let branchID;
  it('Should add a new branch, POST function', (done) => {
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


describe('Testing storage room ', () => {
  it('Should return all storage room (6 rooms), function GET', (done) => {
    request(app)
      .get('/storageroom')
      .end((err, resp) => {
        const rooms = resp.body.length;
        expect(err).to.equal(null);
        expect(rooms).to.equal(6);
        done();
      });
  });



  it('Making sure a room is added, function POST', (done) => {
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



  it('should update specified storageroom, function PUT', (done) => {
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


describe('Testing the Shelf functionality', () => {
  it('Testing Shelf/Storageroom/ID Get', (done) => {
    request(app)
      .get('/shelf/storageroom/1')
      .end((err, resp) => {
        const shelves = resp.body;
        expect(err).to.equal(null);
        expect(shelves.length).to.equal(9);
        done();
      });
  });

  it('Testing Shelf/Storageroom/ID Post', (done) => {
    const p1 = new Promise((res, rej) => {
    request(app)
      .post('/shelf/storageroom/1')
      .send({
        shelf_name: "Test Shelf"
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.shelf_name).to.be.equal("Test Shelf");
        res();
      });
    });

    p1.then(() => {
      request(app)
        .get('/shelf/storageroom/1')
        .end((err, resp) => {
          expect(err).to.be.equal(null);
          expect(resp.body.length).to.be.equal(10);
          done();
        });
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


// describe('Testing the article get functionality', () => {
//   it('Testing Article/ID Get', (done) => {
//     request(app)
//       .get('article/1')
//       .end((err,resp) => {
//         const article = resp.body;
//         expect(err).to.equal(null);
//         expect(article.description).to.equal('gun');
//         done();
//       });
//   });


//   it('Testing Article/Case/ID Get, #61', (done) => {
//     request(app)
//       .get('article/case/743996')
//       .end((err,resp) => {
//         const cases = resp.body;
//         expect(err).to.equal(null);
//         expect(cases.length).to.equal(2);
//         done();
//       });
//   });


//   it('Testing Article/Package/ID Get, #63', (done) => {
//     request(app)
//       .get('article/package/51')
//       .end((err,resp) => {
//         const packages = resp.body;
//         expect(err).to.equal(null);
//         expect(packages.length).to.equal(2);
//         done();
//       });
//   });


//   it('Testing Article/Storageroom/ID Get, #19', (done) => {
//     request(app)
//       .get('article/storageroom/1')
//       .end((err,resp) => {
//         const rooms = resp.body;
//         expect(err).to.equal(null);
//         expect(rooms.length).to.equal(14);
//         done();
//       });
//   });


//   it('Testing Article/Branch/ID Get, #31', (done) => {
//     request(app)
//       .get('article/branch/1')
//       .end((err, resp) => {
//         const branches = resp.body;
//         expect(err).to.equal(null);
//         expect(branches.length).to.equal(30);
//         done();
//       });
//   });
// });


// describe('Testing article post functionality', () => {
//   let articleID;
//   it('Testing article check-in post', (done) => {
//     const p1 = new Promise((res, rej) => {
//       request(app)
//       .post('/article/check-in')
//       .send({
//         material_number: "129274-90",
//         comment: "Return gun after lab examination",
//         storage_room: 3,
//         shelf: 6,
//       })
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         articleID = resp.body.article;
//         res();
//       });
//     });

//     p1.then(() => {
//       request(app)
//         .get('/article/${articleID}')
//         .end((err, resp) => {
//           expect(err).to.be.equal(null);
//           console.log(articleID);
//           done();
//         });
//     });
//   });
// });

// describe('Testing storage event functionality', () => {
//   it('Testing Storageevent Get, #16',(done) => {
//     request(app)
//       .get('/storageevent')
//       .end((err, resp) => {
//         const events = resp.body;
//         expect(err).to.equal(null);
//         expect(events.length).to.equal(50);
//         done();
//       });
//   });


//   it('Testing Storageevent/Storageroom/ID Get, #25',(done) => {
//     request(app)
//       .get('/storageevent/storageroom/1')
//       .end((err, resp) => {
//         const events = resp.body;
//         expect(err).to.equal(null);
//         expect(events.length).to.equal(50);
//         done();
//       });
//   });


//   it('Testing Storageevent/Article/ID Get, #26', (done) => {
//     request(app)
//       .get('/storageevent/article/99')
//       .end((err, resp) => {
//         const events = resp.body;
//         expect(err).to.equal(null);
//         expect(events.length).to.equal(5);
//         done();
//       });
//   });
// });