import React from "react";

function HeaderComponent(): JSX.Element {
  return (
    <div className="navWrap">
      <div className="wrapper" style={{ padding: 0 }}>
        <section id="branding" />
        <div id="menu" className="menuWrap" role="navigation">
          <ul>
            <li>
              <a
                href="https://nyris.io/imprint/#privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </a>
            </li>
            <li>
              <a
                href="https://nyris.io/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit our Website
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default HeaderComponent;
