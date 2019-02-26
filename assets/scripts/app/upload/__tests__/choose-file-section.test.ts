import 'jsdom-global/register';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as FileApi from 'file-api';
import chooseFileSectionCreator from '../choose-file-section';
import { landingPageMarkup } from '../../../test/fixtures/markup';

const expect = chai.expect;
const changeFileCallback = sinon.spy();
const errorCallback = sinon.spy();
const file = new (window as any).FilePolyfill({ 
  name: 'test-file.txt',
  type: 'text/plain',
  buffer: new ArrayBuffer(2e+5).toString()
});

describe('upload/choose-file-section', () => {
  beforeEach(() => {
    (window as any).FileReader = FileApi.FileReader;
    (window as any).FilePolyfill = FileApi.File;
    document.body.innerHTML = landingPageMarkup;
  })

  it('creates an object and initializes' , async () => {
    const chooseFileSection = chooseFileSectionCreator(changeFileCallback, errorCallback);

    expect(typeof chooseFileSection).to.equal('object');
  });

  it('removeFile resets properties and removes file-selected class' , async () => {
    const chooseFileSection = chooseFileSectionCreator(changeFileCallback, errorCallback);
    chooseFileSection.init()
    chooseFileSection.removeFile()

    const hasClass = Object.keys(chooseFileSection.contentEl.classList).some((key) => {
      return chooseFileSection.contentEl.classList[key] === 'file-selected';
    });

    expect(changeFileCallback.called).to.equal(true)
    expect(changeFileCallback.args[0][0].encodedFile).to.equal(null)
    expect(changeFileCallback.args[0][0].name).to.equal(null)
    expect(chooseFileSection.selectedFileName).to.equal(null);
    expect(chooseFileSection.fileUploadNameEl.innerHTML).to.equal('');
    expect(hasClass).to.equal(false);
  });

  it('onFileSelected adds classes and fires callback' , async () => {
    const event = {
      target: {
        files: [file],
      },
    };
    const chooseFileSection = chooseFileSectionCreator(changeFileCallback, errorCallback);
    chooseFileSection.init()
    await chooseFileSection.onFileSelected(event);

    const hasClass = Object.keys(chooseFileSection.contentEl.classList).some((key) => {
      return chooseFileSection.contentEl.classList[key] === 'file-selected';
    });

    expect(changeFileCallback.called).to.equal(true)
    expect(changeFileCallback.args[1][0].encodedFile).to.equal('data:text/plain;charset=utf-8,[object ArrayBuffer]');
    expect(changeFileCallback.args[1][0].name).to.equal('test-file.txt');
    expect(chooseFileSection.selectedFileName).to.equal('test-file.txt');
    expect(chooseFileSection.fileUploadNameEl.innerHTML).to.equal('<strong>File:</strong> test-file.txt');
    expect(hasClass).to.equal(true);
  });
});
