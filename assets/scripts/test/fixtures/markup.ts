export const landingPageMarkup = `
  <header class="header">
    <h1>
      <a href="/" class="logo">Encrypted File Transfer</a>
    </h1>
  </header>
  <main role="main" class="container">
    <p class="alert alert-info" role="alert"></p>
    <p class="alert alert-danger" role="alert"></p>
    <section class="content">
      <form accept-charset="UTF-8" action="http://localhost:3000" class="create-file-form" method="post">
        <input name="_csrf_token" type="hidden" value="12345678910">
        <input name="_utf8" type="hidden" value="✓">
        <div class="error-message"></div>
        <ol class="steps">
          <li class="step choose-file-section">
            <strong class="step-order">1.</strong>
            <div class="step-content">
              <div class="choose-file-content">
                <div class="choose-file-wrapper">
                  <div class="choose-file-button">
                    <span class="description">Click to choose a file from your device or drag a file here</span>
                    <input class="choose-file-input" type="file" name="file" />
                  </div>
                </div>
                <div class="file-name-wrapper">
                  <div class="choose-file-name"></div>
                  <button class="choose-file-remove-button" type="button"><span class="icon"></span></button>
                </div>
              </div>
            </div>
          </li>
          <li class="step password-section">
            <strong class="step-order">2.</strong>
            <div class="step-content">
              <label class="password-input-label">Enter a password for your file:</label>
              <input class="password-input" type="password" name="password" placeholder="Password">
              <div class="password-hint">Must be at least 8 characters</div>
            </div>
          </li>
          <li class="step upload-button-section">
            <strong class="step-order">3.</strong>
            <div class="step-content">
              <label class="password-input-label">Upload your file:</label>
              <button class="upload-file-button" type="submit">Upload file</button>
              <button class="cancel-upload-button" type="button">Cancel</button>
            </div>
          </li>
          <li class="step upload-complete-section">
            <div class="success-message"></div>
          </li>
        </ol>
      </form>
    </section>
    <div class="loader"></div>
  </main>
`;

export const downloadPageMarkup = `
  <header class="header">
    <h1>
      <a href="/" class="logo">Encrypted File Transfer</a>
    </h1>
  </header>
  <main role="main" class="container">
    <p class="alert alert-info" role="alert"></p>
    <p class="alert alert-danger" role="alert"></p>
    <section class="content download">
      <form accept-charset="UTF-8" action="/download/12345678-1234-1234-1234-123456789012" class="download-file-form" method="post">
        <input name="_csrf_token" type="hidden" value="1234567890">
        <input name="_utf8" type="hidden" value="✓">
        <div class="error-message"></div>
        <div class="section password">
          <label class="password-input-label">Enter password:</label>
          <input class="password-input" type="password" name="password" placeholder="Password">
          <button class="download-file-button" type="submit">Download file</button>
        </div>
        <div class="section download-link">
          <div class="success-message"></div>
        </div>
      </form>
    </section>
    <div class="loader"></div>
  </main>
`
