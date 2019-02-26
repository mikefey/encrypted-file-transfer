import 'jsdom-global/register';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as FileApi from 'file-api';
import passwordSectionCreator from '../password-section';
import { landingPageMarkup } from '../../../test/fixtures/markup';

const expect = chai.expect;
const callback = sinon.spy();

describe('upload/password-section', () => {
  beforeEach(() => {
    (window as any).FileReader = FileApi.FileReader;
    (window as any).FilePolyfill = FileApi.File;
    document.body.innerHTML = landingPageMarkup;
  })

  it('creates an object and initilializes' , async () => {
    const passwordSection = passwordSectionCreator(callback);

    expect(typeof passwordSection).to.equal('object');
  });

  it('onInputChange removes hide-hint class and fires callback with null when input length is < 8' , async () => {
    const passwordSection = passwordSectionCreator(callback);
    const input = 'passwo';

    passwordSection.init();
    passwordSection.onInputChange({ target: { value: input }});

    const hasClass = Object.keys(passwordSection.contentEl.classList).some((key) => {
      return passwordSection.contentEl.classList[key] === 'hide-hint';
    });

    expect(hasClass).to.equal(false);
    expect(callback.args[0][0]).to.equal(null);
    expect(callback.called).to.equal(true);
  });

  it('onInputChange removes hide-hint class and fires callback with value when input length is > 7' , async () => {
    const passwordSection = passwordSectionCreator(callback);
    const input = 'password';

    passwordSection.init();
    passwordSection.onInputChange({ target: { value: input }});

    const hasClass = Object.keys(passwordSection.contentEl.classList).some((key) => {
      return passwordSection.contentEl.classList[key] === 'hide-hint';
    });

    expect(hasClass).to.equal(true);
    expect(callback.args[1][0]).to.equal(input);
    expect(callback.called).to.equal(true);
  });

  it('reset clears input value' , async () => {
    const passwordSection = passwordSectionCreator(callback);
    const input = 'password';

    passwordSection.init();
    passwordSection.onInputChange({ target: { value: input }});
    passwordSection.reset();

    expect(passwordSection.passwordInput.value).to.equal('');
  });
});
