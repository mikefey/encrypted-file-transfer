import 'jsdom-global/register';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as FileApi from 'file-api';
import uploadButtonSectionCreator from '../upload-button-section';
import { landingPageMarkup } from '../../../test/fixtures/markup';

const expect = chai.expect;
const cancelUploadCallback = sinon.spy();

describe('upload/password-section', () => {
  beforeEach(() => {
    (window as any).FileReader = FileApi.FileReader;
    (window as any).FilePolyfill = FileApi.File;
    document.body.innerHTML = landingPageMarkup;
  })

  it('creates an object and initilializes' , async () => {
    const uploadButtonSection = uploadButtonSectionCreator(cancelUploadCallback);

    expect(typeof uploadButtonSection).to.equal('object');
  });

  it('init adds the correct properties and even listeners' , async () => {
    const uploadButtonSection = uploadButtonSectionCreator(cancelUploadCallback);
    uploadButtonSection.init();

    expect(uploadButtonSection.cancelUploadButton.constructor.name).to.equal('HTMLButtonElement');
    expect(uploadButtonSection.contentEl.constructor.name).to.equal('HTMLLIElement');
  });
});
