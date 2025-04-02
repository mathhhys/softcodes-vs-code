import { getSoftcodesRcPath, getTsConfigPath, migrate } from "core/util/paths";
import { Telemetry } from "core/util/posthog";
import path from "node:path";
import * as vscode from "vscode";
import { VsCodeExtension } from "../extension/VsCodeExtension";
import registerQuickFixProvider from "../lang-server/codeActions";
import { getExtensionVersion } from "../util/util";
import { getExtensionUri } from "../util/vscode";
import { VsCodeSoftcodesApi } from "./api";
import { setupInlineTips } from "./inlineTips";

export async function activateExtension(context: vscode.ExtensionContext) {
  // Add necessary files
  getTsConfigPath();
  getSoftcodesRcPath();

  // Register commands and providers
  registerQuickFixProvider();
  setupInlineTips(context);

  const vscodeExtension = new VsCodeExtension(context);

  migrate("showWelcome_1", () => {
    vscode.commands.executeCommand(
      "markdown.showPreview",
      vscode.Uri.file(
        path.join(getExtensionUri().fsPath, "media", "welcome.md"),
      ),
    );

    vscode.commands.executeCommand("softcodes.focusSoftcodesInput");
  });

  // Load Softcodes configuration
  if (!context.globalState.get("hasBeenInstalled")) {
    context.globalState.update("hasBeenInstalled", true);
    Telemetry.capture(
      "install",
      {
        extensionVersion: getExtensionVersion(),
      },
      true,
    );
  }

  const api = new VsCodeSoftcodesApi(vscodeExtension);
  const softcodesPublicApi = {
    registerCustomContextProvider: api.registerCustomContextProvider.bind(api),
  };

  // Command to open the authentication webview
  const startAuthDisposable = vscode.commands.registerCommand('softcodes.authenticate', () => {
    const panel = vscode.window.createWebviewPanel(
      'clerkAuth',                // Internal identifier
      'Softcodes Authentication',     // Panel title shown to the user
      vscode.ViewColumn.One,      // Editor column to show the panel in
      {
        enableScripts: true,      // Allow scripts in the webview
      }
    );

    // Set the HTML content for the webview
    panel.webview.html = getWebviewContent();

    // Listen for messages from the webview
    panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'tokenReceived':
            // Store the session token in VS Code's global storage
            await context.globalState.update('clerkSessionToken', message.token);
            vscode.window.showInformationMessage('Authentication successful!');
            panel.dispose();
            return;
          case 'error':
            vscode.window.showErrorMessage(`Authentication error: ${message.error}`);
            return;
        }
      },
      undefined,
      context.subscriptions
    );
  });

  // Command to simulate an API request that verifies the session token
  const apiCallDisposable = vscode.commands.registerCommand('softcodes.apiauth', async () => {
    const token = context.globalState.get<string>('clerkSessionToken');
    if (!token) {
      vscode.window.showErrorMessage('No session token found. Please sign in.');
      return;
    }
    try {
      // Simulate quick verification of the token.
      const verified = await verifySessionToken(token);
      if (!verified) {
        vscode.window.showErrorMessage('Session token verification failed.');
        return;
      }
      // Proceed with the API request (here we simply display a message)
      vscode.window.showInformationMessage('Session token verified. API request can proceed.');
    } catch (err: any) {
      vscode.window.showErrorMessage(`Error verifying session token: ${err.message}`);
    }
  });

  context.subscriptions.push(startAuthDisposable, apiCallDisposable);

  // 'export' public api-surface
  // or entire extension for testing
  return process.env.NODE_ENV === "test"
    ? {
        ...softcodesPublicApi,
        extension: vscodeExtension,
      }
    : softcodesPublicApi;
}

// Simulated token verification function. Replace this with a real Clerk verification call.
async function verifySessionToken(token: string): Promise<boolean> {
  return new Promise((resolve) => {
    setTimeout(() => {
      // For demonstration, valid tokens start with "clerk_"
      resolve(token.startsWith('clerk_'));
    }, 500);
  });
}

// Returns the HTML content for the authentication webview.
function getWebviewContent(): string {
  // Replace 'YOUR_FRONTEND_API' and the publishable key with your actual values.
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <!-- Content Security Policy: allow resources only from our extension, HTTPS, and the Clerk domain -->
  <meta http-equiv="Content-Security-Policy" content="
    default-src 'none';
    img-src https: data:;
    script-src 'unsafe-inline' https://clerk.enterprise-softcodes.io;
    style-src 'unsafe-inline' https:;
  ">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Clerk Authentication</title>
  <style>
    body { font-family: sans-serif; margin: 20px; }
  </style>
</head>
<body>
  <!-- Container for Clerk's UI -->
  <div id="app"></div>

  <!-- Initialize Clerk with your Clerk Publishable Key and Frontend API URL -->
  <script
    async
    crossorigin="anonymous"
    data-clerk-publishable-key="pk_live_Y2xlcmsuZW50ZXJwcmlzZS1zb2Z0Y29kZXMuaW8k"
    src="https://clerk.enterprise-softcodes.io"
    type="text/javascript"
  ></script>

  <!-- Listen for the load event to initialize Clerk -->
  <script>
    window.addEventListener('load', async function () {
      await Clerk.load()
      const appDiv = document.getElementById('app')
      // Render the appropriate component based on authentication status.
      if (Clerk.user) {
        appDiv.innerHTML = '<div id="user-button"></div>'
        Clerk.mountUserButton(document.getElementById('user-button'))
      } else {
        appDiv.innerHTML = '<div id="sign-in"></div>'
        Clerk.mountSignIn(document.getElementById('sign-in'))
      }
      
      // For demonstration purposes, wait 5 seconds then send a token to the extension.
      // In a real-world scenario, you'd retrieve the session token from Clerk's API.
      setTimeout(() => {
        const vscode = acquireVsCodeApi();
        if (Clerk.user) {
          const token = 'clerk_example_token_' + Date.now();
          vscode.postMessage({ command: 'tokenReceived', token });
        } else {
          vscode.postMessage({ command: 'error', error: 'User not signed in' });
        }
      }, 5000);
    });
  </script>
</body>
</html>`;
}
