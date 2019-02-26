import 'jsdom-global/register';
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as FileApi from 'file-api';
import passwordSectionCreator from '../password-section';
import { landingPageMarkup } from '../../../test/fixtures/markup';

(window as any).FileReader = FileApi.FileReader;
(window as any).FilePolyfill = FileApi.File;

const expect = chai.expect;
const callback = sinon.spy();

document.body.innerHTML = landingPageMarkup;

describe('download/password-section', () => {
  it('creates an object and initilializes' , async () => {
    const passwordSection = passwordSectionCreator(callback);

    expect(typeof passwordSection).to.equal('object');
  });

  it('onInputChange fires callback' , async () => {
    const passwordSection = passwordSectionCreator(callback);
    const input = 'password';

    passwordSection.init();
    passwordSection.onInputChange({ target: { value: input }});

    expect(callback.args[0][0]).to.equal(input);
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
