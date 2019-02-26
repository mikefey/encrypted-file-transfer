import 'jsdom-global/register';
import * as fetch from 'isomorphic-fetch';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as WebCrypto from 'node-webcrypto-ossl';
import * as encoding from 'text-encoding';
import downloadAppCreator from '../download-app';
import { downloadPageMarkup } from '../../../test/fixtures/markup'
import * as FileApi from 'file-api';
import { encrypt } from '../../../util/crypto';

const expect = chai.expect;

describe('download/download-app', () => {
  beforeEach(() => {
    sinon.restore();
    (window as any).TextEncoder = encoding.TextEncoder;
    (window as any).TextDecoder = encoding.TextDecoder;
    (window as any).crypto = new WebCrypto();
    (window as any).fetch = fetch;
    (window as any).FileReader = FileApi.FileReader;
    (window as any).FilePolyfill = FileApi.File;
    document.body.innerHTML = downloadPageMarkup;
  })

  it('init creates an object and initilializes each section' , async () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();

    expect(typeof downloadApp).to.equal('object');
    expect(typeof downloadApp.passwordSection).to.equal('object');
  });

  it ('onPasswordInputChange updates the password property', () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    downloadApp.onPasswordInputChange('password');

    expect(downloadApp.password).to.equal('password');
  })

  it ('showCryptoNotSupportedError shows the correct error', () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    downloadApp.showCryptoNotSupportedError();

    const hasClass = Object.keys(downloadApp.contentEl.classList).some((key) => {
      return downloadApp.contentEl.classList[key] === 'show-error-message';
    });

    expect(hasClass).to.equal(true)
    expect(document.getElementsByClassName('error-message')[0].innerHTML.indexOf('is not supported')).to.be.greaterThan(-1);
  })

  it ('showDownloadError shows the correct error', () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    downloadApp.showDownloadError();

    const hasClass = Object.keys(downloadApp.contentEl.classList).some((key) => {
      return downloadApp.contentEl.classList[key] === 'show-error-message';
    });

    expect(hasClass).to.equal(true)
    expect(document.getElementsByClassName('error-message')[0].innerHTML.indexOf('Sorry, there was an error downloading the file.')).to.be.greaterThan(-1);
  });

  it ('showDecryptError shows the correct error', () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    downloadApp.showDecryptError();

    const hasClass = Object.keys(downloadApp.contentEl.classList).some((key) => {
      return downloadApp.contentEl.classList[key] === 'show-error-message';
    });

    expect(hasClass).to.equal(true)
    expect(document.getElementsByClassName('error-message')[0].innerHTML.indexOf('Sorry, there was an error decrypting the file.')).to.be.greaterThan(-1);
  });

  it ('hideLoader removes classes', () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    downloadApp.hideLoader();

    const hasClass = Object.keys(downloadApp.loaderEl.classList).some((key) => {
      return downloadApp.loaderEl.classList[key] === 'show';
    });

    expect(hasClass).to.equal(false)
  });

  it ('openFile loads a file then calls decryptFile with the contents', async () => {
    const downloadApp = downloadAppCreator();
    const file = new (window as any).FilePolyfill({ 
      name: 'test-file.txt',
      type: 'text/plain',
      buffer: new ArrayBuffer(2e+5).toString(),
      arrayBuffer: () => {
        return new Promise((resolve) => {
          resolve(new ArrayBuffer(2e+5).toString())
        })
      },
    });
    const encryptedFileMock = {
      id: '12345678-1234-1234-1234-123456789012',
      initialization_vector: '208,68,134,253,255,193,93,54,222,47,204,229',
    };

    sinon.replace((window as any), 'fetch', sinon.fake.returns(new Promise((resolve) => {
      resolve(file)
    })));
    downloadApp.init();
    downloadApp.decryptFile = sinon.spy();
    await downloadApp.openFile(encryptedFileMock);

    expect((window.fetch as any).args[0][0]).to.equal(`downloads/${encryptedFileMock.id}`);
    expect(typeof (window.fetch as any).args[0][1].headers).to.equal('object')
    expect((window.fetch as any).args[0][1].method).to.equal('GET')
    expect(downloadApp.decryptFile.args[0][0]).to.equal('[object ArrayBuffer]');
    expect(downloadApp.decryptFile.args[0][1]).to.equal(encryptedFileMock);
  });

  it ('decryptFile decrypts the file then calls destroyFile', async () => {
    const downloadApp = downloadAppCreator();
    const encrypted = await encrypt('lorem ipsum', 'password')
    const encryptedFileMock = {
      id: '12345678-1234-1234-1234-123456789012',
      initialization_vector: encrypted.iv.toString(),
    };

    downloadApp.init();
    downloadApp.destroyFile = sinon.spy();
    downloadApp.password = 'password'
    await downloadApp.decryptFile(encrypted.encBuffer, encryptedFileMock);

    expect(downloadApp.destroyFile.args[0][0]).to.equal('lorem ipsum')
    expect(downloadApp.destroyFile.args[0][1]).to.equal(encryptedFileMock)
  });

  it ('destroyFile calls the destroy API endpoint and then calls showDownloadLink', async () => {
    const downloadApp = downloadAppCreator();
    const encrypted = await encrypt('lorem ipsum', 'password')
    const encryptedFileMock = {
      id: '12345678-1234-1234-1234-123456789012',
      initialization_vector: encrypted.iv.toString(),
    };

    downloadApp.init();
    sinon.replace((window as any), 'fetch', sinon.fake.returns({ ok: true }));
    downloadApp.showDownloadLink = sinon.spy();
    await downloadApp.destroyFile('lorem ipsum', encryptedFileMock);

    expect((window.fetch as any).args[0][0]).to.equal(`/${encryptedFileMock.id}`)
    expect(typeof (window.fetch as any).args[0][1].headers).to.equal('object')
    expect((window.fetch as any).args[0][1].method).to.equal('DELETE')
    expect(downloadApp.showDownloadLink.called).to.equal(true)
  });

  it('showDownloadLink adds the proper classes and displays the link', () => {
    const downloadApp = downloadAppCreator();
    const encryptedFileMock = {
      id: '12345678-1234-1234-1234-123456789012',
      initialization_vector: '208,68,134,253,255,193,93,54,222,47,204,229',
      extension: 'jpeg',
    };
    const base64String = 'base64String';
    const expectedSuccessInnerHTML = `<a href="${base64String}" download="${encryptedFileMock.id}.${encryptedFileMock.extension}">Download File</a>`

    downloadApp.init();
    downloadApp.showDownloadLink(base64String, encryptedFileMock);

    const hasClass = Object.keys(downloadApp.contentEl.classList).some((key) => {
      return downloadApp.contentEl.classList[key] === 'show-download-link';
    });

    expect(downloadApp.successMessageEl.innerHTML).to.equal(expectedSuccessInnerHTML);
    expect(hasClass).to.equal(true);
  });

  it('onFormSubmit adds classes and makes an API call', async () => {
    const downloadApp = downloadAppCreator();
    downloadApp.init();
    sinon.replace((window as any), 'fetch', sinon.fake.returns({ ok: true }));

    // await downloadApp.onFormSubmit({ preventDefault: () => { } })
  })
});
