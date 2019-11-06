/* eslint-disable no-undef */
const mocha = require('mocha');
const { expect, assert } = require('chai');
const request = require('supertest');
const pool = require('../connect');

let app;

before(function (done) {
    app = require('../server');
    app.on('APP_STARTED', () => {
        done();
    })
});

describe('Test Database connection',function() {
    it('Application should login to database', function(done) {
        pool.getConnection(function(err, resp) {
            expect(err).equal(null);
            done();
        });
    });
});

describe('Testing route cases', function(){
    
    it('Should return all cases (100 cases)', function(done) {
        request(app)
            .get('/case')
            .end(function(err, resp){
            const cases = resp.body.length;
            expect(err).equal(null);
            expect(cases).equal(100);
            done();
        });
    });


    it('Should return specific case (id: 5)', function(done) {
        request(app)
            .get('/case/5')
            .end(function(err, resp){
                const reqCase = resp.body;
                expect(err).equal(null);
                expect(reqCase.length).equal(1);
                expect(reqCase[0].id).equal(5);
                done();
            })
    })
})

//post
//get 
//delete