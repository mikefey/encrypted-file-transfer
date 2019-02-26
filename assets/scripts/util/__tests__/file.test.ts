import 'jsdom-global/register';
import * as chai from 'chai';
import { getBase64 } from '../file';

const expect = chai.expect;

const file = new (window as any).FilePolyfill({ 
  name: 'test-file.txt',
  type: 'text/plain',
  buffer: new ArrayBuffer(2e+5).toString()
});

describe('getBase64', () => {
  it('getBase64 returns a base64 string' , async () => {
    const base64File = await getBase64(file);

    expect(base64File).to.equal('data:text/plain;charset=utf-8,[object ArrayBuffer]');
  });
});