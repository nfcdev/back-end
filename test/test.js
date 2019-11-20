
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
  it('Should update the name of a branch (id:2)', (done) => {
    request(app)
      .put('/branch/2')
      .send({
        name: 'Test Branch',
      })
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.name).to.be.equal('Test Branch');
        done();
      });
  });
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
        expect(resp.body.id).to.be.equal(6);
        done();
      });
  });
});


describe('Testing branch function DELETE', () => {
  it('Should delete the branch with id: 6 (Post Branch)', (done) => {
    request(app)
      .delete('/branch/6')
      .end((err, resp) => {
        expect(err).to.be.equal(null);
      });
    request(app)
      .get('/branch')
      .end((err, resp) => {
        expect(err).to.be.equal(null);
        expect(resp.body.length).to.be.equal(5);
        done();
      });
  });
});


// // describe('Testing branch function post', () => {
// //   it('Should add a new branch', (done) => {
// //     request(app)
// //       .post('/branch')
// //       .end((err, resp) => {
// //         expect(err).to.equal(null);
// //       });
// //   });
// // });
// //   it('Should return specific branch (id: 3)', (done) => {
// //         request(app)
// //             .get('/branch/3')
// //             .end((err, resp) => {
// //                 const reqBranch = resp.body;
// //                 expect(err).to.equal(null);
// //                 expect(reqBranch.length).to.equal(1);
// //                 expect(reqBranch[0].id).to.equal(3);
// //                 done();
// //             });
// //     }); 
// // });


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
        branch: 2
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.name).to.equal('test room');
        expect(resp.body.id).to.equal(7);
        done();
      });
  });
});


describe('Testing storage room put', () => {
  it('should update specified storageroom', (done) => {
    request(app)
      .put('/storageroom/1')
      .send({
        name: 'Testing room',
        branch: 1
      })
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.name).to.equal('Testing room');
        done();
      });
  });
});


describe('Testing storage room delete', () => {
  it('Should test removing a storage room', (done) => {
    request(app)
      .delete('/storageroom/7')
      .end((err, resp) => {
        expect(err).to.equal(null);
      });
    request(app).get('/storageroom/branch/2')
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.length).to.equal(1);
        done();
      });
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


describe('Testing Package/Storageroom/ID Get', () => {
  it('Should test printing all packages in a specific storageroom', (done) => {
    request(app)
      .get('/package/storageroom/1')
      .end((err, resp) => {
        const shelves = resp.body.length;
        expect(err).to.equal(null);
        expect(shelves).to.equal(8);
        done();
      });
  });
});


describe('Testing Shelf/Storageroom/ID Get', () => {
  it('Should test printing all shelves in a specific storageroom', (done) => {
    request(app)
      .get('/shelf/storageroom/1')
      .end((err, resp) => {
        const shelves = resp.body.length;
        expect(err).to.equal(null);
        expect(shelves).to.equal(9);
        done();
      });
  });
});


// describe('Testing Shelf/ID Put', () => {
//   it('Should test updating a shelf', (done) => {
//     request(app)
//       .put('/shelf/2')
//       .send({
//         shelf_name: "Nice shelf"
//       })
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         expect(resp.id).to.equal(2);
//       })
//   });
// });


describe('Testing Shelf/Storageroom/ID Post', () => {
  it('Should test creating a new shelf', (done) => {
    request(app)
      .post(shelf/storageroom/1)
      .send({
        shelf_name: "Cool shelf"
      })
      .end((err, resp) => {
        expect(err).to.be.equal(null);
      });
      request(app)
      .get('/shelf/storageroom/1')
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.length).to.equal(10);
        done();
      });
  });
});


describe('Testing Package/Branch/ID Get', () => {
  it('Should test printing all packages in a specific branch', (done) => {
    request(app)
      .get('/package/branch/1')
      .end((err, resp) => {
        expect(err).to.equal(null);
        expect(resp.body.length).to.equal(18);
        done();
      });
  });
});


describe('Testing Package Get', () => {
  it('Should test printing all packages', (done) => {
    request(app)
      .get('/package')
      .end((err, resp) => {
        const packages = resp.body.length;
        expect(err).to.equal(null);
        expect(packages).to.equal(50);
        done();
      });
  });
});


// describe('Testing Package/ID Delete', () => {
//   it('Should test deleting a package', (done) => {
//     request(app)
//       .delete('/package/51')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         done();
//       });
//   });
// });

// describe('Testing Article/Package/ID Get', () => {
//   it('Should test printing all articles in a package', (done) => {
//     request(app)
//       .get('/article/package/56')
//       .end((err, resp) => {
//         const articles = resp.body.length;
//         expect(err).to.equal(null);
//         expect(packages).to.equal(2);
//         done();
//       });
//   });
// });


// describe('Testing Article/Case/ID Get', () => {
//   it('Should test printing all articles in a case', (done) => {
//     request(app)
//       .get('/article/case/55')
//       .end((err, resp) => {
//         const articles = resp.body.length;
//         expect(err).to.equal(null);
//         expect(packages).to.equal(1);
//         done();
//       });
//   });
// });


// describe('Testing Article/Storageroom/ID Get', () => {
//   it('Should test printing all articles in a storageroom', (done) => {
//     request(app)
//       .get('/article/storageroom/5')
//       .end((err, resp) => {
//         const articles = resp.body.length;
//         expect(err).to.equal(null);
//         expect(packages).to.equal(7);
//         done();
//       });
//   });
// });


// describe('Testing Storageevent/Storageroom/ID Get', () => {
//   it('Should test fetching all storageevents from a storageroom', (done) => {
//     request(app)
//       .get('/storageevent/storageroom/5')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         expect(resp.body.length).to.equal();
//         done();
//       });
//   });
// });


// describe('Testing Storageevent Get', () => {
//   it('Should test fetching all storageevents', (done) => {
//     request(app)
//       .get('/storageevent')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         expect(resp.body.length).to.equal();
//         done();
//       });
//   });
// });


// describe('Testing Storageevent/article/ID Get', () => {
//   it('Should test fetching all storageevents for a specific article', (done) => {
//     request(app)
//       .get('/storageevent/article/5')
//       .end((err, resp) => {
//         expect(err).to.equal(null);
//         expect(resp.body.length).to.equal();
//         done();
//       });
//   });
// });