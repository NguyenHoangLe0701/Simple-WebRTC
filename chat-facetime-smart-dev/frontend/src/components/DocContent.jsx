import React, { useEffect } from "react";
import TutorialStep1 from "./docs/TutorialStep1";
import TutorialStep2 from "./docs/TutorialStep2";
import TutorialStep3 from "./docs/TutorialStep3";
import TutorialStep4 from "./docs/TutorialStep4";
import TutorialStep5 from "./docs/TutorialStep5";
import TutorialStep6 from "./docs/TutorialStep6";
import TutorialComplete from "./docs/TutorialComplete";
import UserDataIntegration from "./docs/UserDataIntegration";
import ServerSideAPI from "./docs/ServerSideAPI";
import ReduxActions from "./docs/ReduxActions";
import ReduxStore from "./docs/ReduxStore";
import Components from "./docs/Components";
import ReactReduxVersions from "./docs/ReactReduxVersions";
import Upgrading from "./docs/Upgrading";
import ErrorCodes from "./docs/ErrorCodes";
import SDKReleaseNotes from "./docs/SDKReleaseNotes";
import CreatingApp from "./docs/CreatingApp";

function DocsContent({ currentSection }) {
  // User Data Integration sections - scroll to specific step
  useEffect(() => {
    if (currentSection === "userData-1") {
      setTimeout(() => {
        const element = document.getElementById("step-1");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (currentSection === "userData-2") {
      setTimeout(() => {
        const element = document.getElementById("step-2");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } else if (currentSection === "userData-3") {
      setTimeout(() => {
        const element = document.getElementById("step-3");
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  }, [currentSection]);

  // Debug: Log current section
  useEffect(() => {
    console.log("Current section:", currentSection);
  }, [currentSection]);

  // Render tutorial components based on currentSection
  if (currentSection === "tutorial-1") {
    return <TutorialStep1 />;
  }
  if (currentSection === "tutorial-2") {
    return <TutorialStep2 />;
  }
  if (currentSection === "tutorial-3") {
    return <TutorialStep3 />;
  }
  if (currentSection === "tutorial-4") {
    return <TutorialStep4 />;
  }
  if (currentSection === "tutorial-5") {
    return <TutorialStep5 />;
  }
  if (currentSection === "tutorial-6") {
    try {
      return <TutorialStep6 />;
    } catch (error) {
      console.error("Error rendering TutorialStep6:", error);
      return (
        <section className="content p-6 ml-64 pt-[104px]">
          <article className="markdown-section max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Lỗi khi tải nội dung</h1>
            <p>Vui lòng thử lại sau.</p>
          </article>
        </section>
      );
    }
  }
  if (currentSection === "tutorial-complete") {
    try {
      return <TutorialComplete />;
    } catch (error) {
      console.error("Error rendering TutorialComplete:", error);
      return (
        <section className="content p-6 ml-64 pt-[104px]">
          <article className="markdown-section max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Lỗi khi tải nội dung</h1>
            <p>Vui lòng thử lại sau.</p>
          </article>
        </section>
      );
    }
  }
  
  if (currentSection === "userData" || currentSection === "userData-1" || currentSection === "userData-2" || currentSection === "userData-3") {
    return <UserDataIntegration />;
  }
  
  // Other sections
  if (currentSection === "httpApi") {
    return <ServerSideAPI />;
  }
  if (currentSection === "reduxActions") {
    console.log("Rendering ReduxActions");
    return <ReduxActions />;
  }
  if (currentSection === "reduxStore") {
    console.log("Rendering ReduxStore");
    return <ReduxStore />;
  }
  if (currentSection === "components") {
    return <Components />;
  }
  if (currentSection === "versions") {
    return <ReactReduxVersions />;
  }
  if (currentSection === "upgrading") {
    return <Upgrading />;
  }
  if (currentSection === "errors") {
    return <ErrorCodes />;
  }
  if (currentSection === "release") {
    return <SDKReleaseNotes />;
  }
  
  if (currentSection === "creating-app") {
    return <CreatingApp />;
  }

  // Default content (overview)
  return (
    <section className="content p-6 ml-64 pt-[104px]">
      <article className="markdown-section max-w-3xl mx-auto">
        {/* Tiêu đề */}
        <h1 className="text-3xl font-bold mb-6">SimpleWebRTC Documentation</h1>

        {/* Getting Started */}
        <h2 className="text-2xl font-semibold mb-4">Getting Started</h2>
        <pre className="bg-gray-100 p-3 rounded-md text-sm mb-4 overflow-x-auto">
          <code>npm install @andyet/simplewebrtc</code>
        </pre>
        <p className="mb-2">
          Check out{" "}
          <a
            href="https://github.com/andyet/simplewebrtc-talky-sample-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            the sample app
          </a>
          , which is based on the widely used video chat app{" "}
          <a
            href="https://talky.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Talky
          </a>
          .
        </p>
        <p className="mb-6">
          <a
            href="https://www.simplewebrtc.com/#contact"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Reach out to us
          </a>{" "}
          if you have any questions or need help!
        </p>

        {/* Creating a new app */}
        <h2 className="text-2xl font-semibold mb-4">
          Creating a new SimpleWebRTC app
        </h2>

        <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto mb-6">
          <code className="language-js">
{`import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';
import * as SWRTC from '@andyet/simplewebrtc';

// ====================================================================
// IMPORTANT SETUP
// ====================================================================
// Replace \`YOUR_PUBLISHABLE_API_KEY\` here with the Publishable API Key
// you received when signing up for SimpleWebRTC
// --------------------------------------------------------------------
const API_KEY = 'YOUR_PUBLISHABLE_API_KEY';
// ====================================================================

const ROOM_NAME = 'YOUR_ROOM_NAME';
const ROOM_PASSWORD = 'YOUR_ROOM_PASSWORD';
const CONFIG_URL = \`https://api.simplewebrtc.com/config/guest/\${API_KEY}\`;

const store = SWRTC.createStore();

ReactDOM.render(
  <Provider store={store}>
    <SWRTC.Provider configUrl={CONFIG_URL}>
      {/* Render based on the connection state */}
      <SWRTC.Connecting>
        <h1>Connecting...</h1>
      </SWRTC.Connecting>

      <SWRTC.Connected>
        <h1>Connected!</h1>
        {/* Request the user's media */}
        <SWRTC.RequestUserMedia audio video auto />

        {/* Enable playing remote audio */}
        <SWRTC.RemoteAudioPlayer />

        {/* Connect to a room with a name and optional password */}
        <SWRTC.Room name={ROOM_NAME} password={ROOM_PASSWORD}>
          {props => {
            // Use the rest of the SWRTC React Components to render your UI
          }}
        </SWRTC.Room>
      </SWRTC.Connected>
    </SWRTC.Provider>
  </Provider>,
  document.getElementById('app')
);`}
          </code>
        </pre>

        <p>
          See the{" "}
          <a
            href="https://github.com/andyet/simplewebrtc-talky-sample-app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            SimpleWebRTC Demo App
          </a>{" "}
          for more examples.
        </p>
      </article>
    </section>
  );
}

export default DocsContent;
