const { getProblemsList } = require('../index');
const expect = require('chai').expect;

describe('Unit Test', function() {
    describe('#getProblemsList', function() {
        it('should all the files present in the problems directory', function(){
            expect(getProblemsList()).to.eql(['bundle.js','data.svg','post.js','socket.js','styles.css']);
        });
    });
});