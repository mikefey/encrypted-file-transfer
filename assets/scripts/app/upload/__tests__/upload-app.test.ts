import 'jsdom-global/register';
import * as fetch from 'isomorphic-fetch';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as WebCrypto from 'node-webcrypto-ossl';
import * as encoding from 'text-encoding';
import uploadAppCreator from '../upload-app';
import { landingPageMarkup } from '../../../test/fixtures/markup'

const expect = chai.expect;

describe('upload/upload-app', () => {
  beforeEach(() => {
    (window as any).TextEncoder = encoding.TextEncoder;
    (window as any).TextDecoder = encoding.TextDecoder;
    (window as any).crypto = new WebCrypto();
    (window as any).fetch = fetch;
    document.body.innerHTML = landingPageMarkup;
  })

  it('init creates an object and initilializes each section' , async () => {
    const uploadApp = uploadAppCreator();
    uploadApp.init()

    expect(typeof uploadApp).to.equal('object');
    expect(typeof uploadApp.chooseFileSection).to.equal('object');
    expect(typeof uploadApp.passwordSection).to.equal('object');
    expect(typeof uploadApp.uploadButtonSection).to.equal('object');
  });

  it('onFileSelected updates object properties and adds classes' , async () => {
    const uploadApp = uploadAppCreator();
    const fileData = {
      encodedFile: '1234567890abcdefg',
      name: 'myfile.jpeg',
    };

    uploadApp.init()
    uploadApp.onFileSelected(fileData);

    const hasClass = Object.keys(uploadApp.contentEl.classList).some((key) => {
      return uploadApp.contentEl.classList[key] === 'show-password-section';
    });

    expect(uploadApp.selectedFileName).to.equal(fileData.name);
    expect(uploadApp.encodedFile).to.equal(fileData.encodedFile);
    expect(hasClass).to.eq(true);
  });

  it('onFileSelectError adds classes' , async () => {
    const uploadApp = uploadAppCreator();

    uploadApp.init()
    uploadApp.onFileSelectError()

    const hasClass = Object.keys(uploadApp.contentEl.classList).some((key) => {
      return uploadApp.contentEl.classList[key] === 'show-error-message';
    });

    expect(hasClass).to.eq(true);
  });

  it(`onPasswordInputChange doesn't add classes to show the submit button if no password is given`, async () => {
    const uploadApp = uploadAppCreator();

    uploadApp.init()
    uploadApp.onPasswordInputChange();

    const hasClass = Object.keys(uploadApp.contentEl.classList).some((key) => {
      return uploadApp.contentEl.classList[key] === 'show-upload-button-section';
    });

    expect(hasClass).to.eq(false);
  });

  it(`onPasswordInputChange adds classes to show the submit button if a password is given`, async () => {
    const uploadApp = uploadAppCreator();

    uploadApp.init()
    uploadApp.onPasswordInputChange('password');

    const hasClass = Object.keys(uploadApp.contentEl.classList).some((key) => {
      return uploadApp.contentEl.classList[key] === 'show-upload-button-section';
    });

    expect(hasClass).to.eq(true);
  });

  it(`cancelUpload resets properties`, async () => {
    const uploadApp = uploadAppCreator();

    uploadApp.init()
    uploadApp.cancelUpload()

    expect(uploadApp.selectedFileName).to.equal(null);
    expect(uploadApp.encodedFile).to.equal(null);
  });

  it(`validData returns false if selectedFileName, encodedFile, or password are blank`, async () => {
    const uploadApp = uploadAppCreator();

    uploadApp.init()

    expect(Boolean(uploadApp.validData())).to.equal(false);
  });

  it(`validData returns true if selectedFileName, encodedFile, and password are not blank`, async () => {
    const uploadApp = uploadAppCreator();

    const fileData = {
      encodedFile: '1234567890abcdefg',
      name: 'myfile.jpeg',
    };

    uploadApp.init()
    uploadApp.onFileSelected(fileData);
    uploadApp.onPasswordInputChange('password');

    expect(Boolean(uploadApp.validData())).to.equal(true);
  });

  it(`onFormSubmit sends data to API`, async () => {
    const event = {
      preventDefault: () => {},
    };
    const uploadApp = uploadAppCreator();
    const fileData = {
      encodedFile: '1234567890abcdefg',
      name: 'myfile.jpeg',
    };
    const stub = sinon.stub(window, 'fetch').callsFake((url, options) => { 
      return {
        json() {
          return { id: '12345'}
        }
      }
    });

    uploadApp.init()
    uploadApp.onFileSelected(fileData);
    uploadApp.onPasswordInputChange('password');

    await uploadApp.onFormSubmit(event);

    expect(stub.called).to.equal(true);
    expect(stub.args[0][0]).to.equal(uploadApp.formAttributes.action);
    expect(stub.args[0][1].method).to.equal(uploadApp.formAttributes.method);
    expect(stub.args[0][1].headers['x-csrf-token']).to.equal(uploadApp.crsfToken);
    expect(stub.args[0][1].body.constructor.name).to.equal('FormData');
  });

  it ('onUploadComplete shows a link to the uploaded file', () => {
    const uploadApp = uploadAppCreator();
    const uploadCompleteUrl = '<a href="about:blank//undefined/12345">about:blank//undefined/12345</a>';

    uploadApp.init();
    uploadApp.onUploadComplete({ id: '12345' });

    const hasClass = Object.keys(uploadApp.contentEl.classList).some((key) => {
      return uploadApp.contentEl.classList[key] === 'show-complete-section';
    });

    expect(hasClass).to.eq(true);
    expect(document.getElementsByClassName('success-message')[0].innerHTML.indexOf(uploadCompleteUrl)).to.be.greaterThan(-1);
  })
});