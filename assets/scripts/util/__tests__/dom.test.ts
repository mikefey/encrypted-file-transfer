import 'jsdom-global/register';
import * as chai from 'chai';
import { getElementByClassName } from '../dom';

const expect = chai.expect;

describe('getElementByClassName', () => {
  it('should return a single correct element' , () => {
    const testEl1 = document.createElement('div')
    testEl1.className = 'div-1'
    document.body.appendChild(testEl1)

    expect(typeof getElementByClassName(testEl1.className)).not.to.equal('undefined');
    expect(typeof getElementByClassName(testEl1.className)).to.equal('object');
    expect(getElementByClassName(testEl1.className)).to.equal(testEl1);
  });
});
