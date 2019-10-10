const mocha = require('mocha');
const {expect, assert} = require('chai');
const filename = require('../test');



it('Database should not login with wrong credentials', (done) => {
    expect(filename.test()).to.equal(4);
    done();
});

it('asd', (done) => {
    done();
})

