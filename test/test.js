/* const mocha = require('mocha');
const {expect, assert} = require('chai');
const filename = require('../test');



it('Database should not login with wrong credentials', (done) => {
    expect(filename.test()).to.equal(4);
    done();
});

it('asd', (done) => {
    done();
})

 */
// Require the built in 'assertion' library
let convert = require('../app.js');
let assert = require('assert');
// Create a group of tests about Arrays
describe('temperature conversion', function() {
  // Within our Array group, Create a group of tests for indexOf
  describe('cToF', function() {
    // A string explanation of what we're testing
    it('should convert -40 celsius to -40 fahrenheit', function() {
        assert.equal(-40, convert.cToF(-40));
     });
     it('should return undefined if no temperature is input', function(){
        assert.equal(undefined, convert.cToF(''));
      });
      it('should convert 0 celsius to 32 fahrenheit', function() {
        assert.equal(32, convert.cToF(0));




  });
});
  describe('fToC',function(){
        
    it('should convert -40 fahrenheit to -40 celsius', function() {
        assert.equal(-40, convert.fToC(-40));
      });
      it('should convert 32 fahrenheit to 0 celsius', function() {
        assert.equal(0, convert.fToC(32));
      });
      it('should return undefined if no temperature is input', function(){
        assert.equal(undefined, convert.fToC(''));
      });

     
  });
});