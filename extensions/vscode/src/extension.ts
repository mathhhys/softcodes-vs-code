/**
 * This is the entry point for the extension.
 */

import { setupCa } from "core/util/ca";
import { Telemetry } from "core/util/posthog";
import * as vscode from "vscode";
import { getExtensionVersion } from "./util/util";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";
import { ClerkTokenAuth } from './clerk-auth';

/**
 * Sets up Softcodes authentication with Clerk
 */
function setupSoftcodesAuthentication(context: vscode.ExtensionContext) {
    // Create Clerk auth provider
    const clerkAuth = new ClerkTokenAuth(context);
    context.subscriptions.push({ dispose: () => clerkAuth.dispose() });
    
    // Status Bar Item
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
    statusBarItem.command = 'softcodes.login';
    statusBarItem.tooltip = 'Click to manage Softcodes authentication';
    context.subscriptions.push(statusBarItem);
    
    // Update status bar based on authentication state
    async function updateStatusBar() {
        const isAuthenticated = await clerkAuth.isAuthenticated();
        if (isAuthenticated) {
            try {
                const userInfo = await clerkAuth.getUserInfo();
                statusBarItem.text = `$(check) Softcodes: ${userInfo?.email || 'Authenticated'}`;
            } catch (error) {
                // If we can't get profile, still show as authenticated
                statusBarItem.text = '$(check) Softcodes: Authenticated';
            }
        } else {
            statusBarItem.text = '$(account) Softcodes: Sign In';
        }
        statusBarItem.show();
    }
    
    // Update status bar initially and when auth status changes
    updateStatusBar();
    clerkAuth.onDidChangeAuthStatus(() => updateStatusBar());
    
    // Check token expiration
    clerkAuth.checkTokenExpiration();
    
    // Register login command
    context.subscriptions.push(
        vscode.commands.registerCommand('softcodes.login', async () => {
            try {
                const isAuthenticated = await clerkAuth.isAuthenticated();
                
                if (isAuthenticated) {
                    // Show logout option if already logged in
                    const action = await vscode.window.showQuickPick([
                        'View Profile',
                        'Check Subscription',
                        'Sign Out',
                        'Cancel'
                    ], {
                        placeHolder: 'Manage your Softcodes account'
                    });
                    
                    if (action === 'Sign Out') {
                        await clerkAuth.logout();
                        vscode.window.showInformationMessage('Successfully signed out from Softcodes');
                        updateStatusBar();
                    } else if (action === 'View Profile') {
                        vscode.commands.executeCommand('softcodes.getUserProfile');
                    } else if (action === 'Check Subscription') {
                        vscode.commands.executeCommand('softcodes.checkSubscription');
                    }
                } else {
                    // Show login prompt
                    const success = await clerkAuth.login();
                    if (success) {
                        const userInfo = await clerkAuth.getUserInfo();
                        vscode.window.showInformationMessage(`You're now signed in !`);
                        updateStatusBar();
                    } else {
                        vscode.window.showErrorMessage('Failed to authenticate. Please check your token and try again.');
                    }
                }
            } catch (err) {
                vscode.window.showErrorMessage(`Authentication error: ${err instanceof Error ? err.message : String(err)}`);
            }
        })
    );
    
    // Register commands
    registerSoftcodesCommands(context, clerkAuth);
    
    return {
        clerkAuth
    };
}

/**
 * Registers Softcodes commands
 */
function registerSoftcodesCommands(context: vscode.ExtensionContext, clerkAuth: ClerkTokenAuth) {
    // Command to get user profile
    context.subscriptions.push(
        vscode.commands.registerCommand('softcodes.getUserProfile', async () => {
            try {
                const isAuth = await clerkAuth.isAuthenticated();
                if (!isAuth) {
                    const choice = await vscode.window.showInformationMessage(
                        "Please log in first to view your profile",
                        "Login",
                        "Cancel"
                    );
                    if (choice === "Login") {
                        vscode.commands.executeCommand("softcodes.login");
                    }
                    return;
                }
                
                const userInfo = await clerkAuth.getUserInfo();
                if (!userInfo) {
                    vscode.window.showErrorMessage("Failed to fetch user profile");
                    return;
                }
                
                // Display profile in webview
                const panel = vscode.window.createWebviewPanel(
                    'softcodesProfile',
                    'Softcodes User Profile',
                    vscode.ViewColumn.One,
                    {}
                );
                
                panel.webview.html = `
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>User Profile</title>
                        <style>
                            body {
                                padding: 20px;
                                font-family: var(--vscode-font-family);
                                color: var(--vscode-foreground);
                            }
                            h1 {
                                font-size: 1.5em;
                                margin-bottom: 20px;
                            }
                            .profile-card {
                                background-color: var(--vscode-editor-background);
                                border: 1px solid var(--vscode-panel-border);
                                border-radius: 4px;
                                padding: 15px;
                            }
                            .field {
                                margin-bottom: 10px;
                            }
                            .field-name {
                                font-weight: bold;
                                margin-right: 5px;
                            }
                        </style>
                    </head>
                    <body>
                        <h1>User Profile</h1>
                        <div class="profile-card">
                            <div class="field">
                                <span class="field-name">Name:</span>
                                <span>${userInfo.name || 'N/A'}</span>
                            </div>
                            <div class="field">
                                <span class="field-name">Email:</span>
                                <span>${userInfo.email || 'N/A'}</span>
                            </div>
                            <div class="field">
                                <span class="field-name">Account Type:</span>
                                <span>${userInfo.accountType || 'N/A'}</span>
                            </div>
                            <div class="field">
                                <span class="field-name">Subscription Status:</span>
                                <span>${userInfo.subscriptionStatus || 'N/A'}</span>
                            </div>
                        </div>
                    </body>
                    </html>
                `;
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to get user profile: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );

    // Command to check subscription status
    context.subscriptions.push(
        vscode.commands.registerCommand('softcodes.checkSubscription', async () => {
            try {
                const userInfo = await clerkAuth.getUserInfo();
                
                if (userInfo && userInfo.subscriptionStatus === 'active') {
                    // Use subscription info directly from userInfo instead of a separate call
                    vscode.window.showInformationMessage(
                        `Your subscription is active. Plan: ${userInfo.accountType || 'Standard'}. ${
                            userInfo.renewalDate ? 
                            `Renewal: ${new Date(userInfo.renewalDate).toLocaleDateString()}` : 
                            ''
                        }`
                    );
                } else {
                    vscode.window.showWarningMessage(`Your subscription is not active. Visit enterprise-softcodes.io to subscribe.`);
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to check subscription: ${error instanceof Error ? error.message : String(error)}`);
            }
        })
    );
}

async function dynamicImportAndActivate(context: vscode.ExtensionContext) {
  const { activateExtension } = await import("./activation/activate");
  try {
    // Setup Softcodes authentication with Clerk
    setupSoftcodesAuthentication(context);
    
    // Then continue with normal activation
    return activateExtension(context);
  } catch (e) {
    console.log("Error activating extension: ", e);
    vscode.window
      .showInformationMessage(
        "Error activating the Softcodes extension.",
        "View Logs",
        "Retry",
      )
      .then((selection) => {
        if (selection === "View Logs") {
          vscode.commands.executeCommand("softcodes.viewLogs");
        } else if (selection === "Retry") {
          // Reload VS Code window
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('Softcodes extension is now active');
  setupCa();
  return dynamicImportAndActivate(context);
}

export function deactivate() {
  console.log('Softcodes extension is now deactivated');
  
  Telemetry.capture(
    "deactivate",
    {
      extensionVersion: getExtensionVersion(),
    },
    true,
  );

  Telemetry.shutdownPosthogClient();
}