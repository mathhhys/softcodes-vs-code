import * as vscode from 'vscode';
import { TokenAuthProvider } from './auth-provider';

export class ApiClient implements vscode.Disposable {
    private _onDidChangeAuthStatus = new vscode.EventEmitter<boolean>();
    readonly onDidChangeAuthStatus = this._onDidChangeAuthStatus.event;

    constructor(private readonly authProvider: TokenAuthProvider) {
        // Listen for token changes
        this.authProvider.onDidChangeToken(isAuthenticated => {
            this._onDidChangeAuthStatus.fire(isAuthenticated);
        });
    }

    dispose() {
        this._onDidChangeAuthStatus.dispose();
    }

    // Get the current token or prompt if not available
    private async getTokenOrPrompt(): Promise<string> {
        const token = await this.authProvider.getToken();
        if (!token) {
            const newToken = await this.authProvider.promptForToken();
            if (!newToken) {
                throw new Error('Authentication required. Please provide your API token.');
            }
            return newToken;
        }
        return token;
    }

    // General purpose API request method
    public async request(endpoint: string, method: string = 'GET', body?: any): Promise<any> {
        try {
            const token = await this.getTokenOrPrompt();
            
            const response = await fetch(`https://enterprise-softcodes.io/api/${endpoint}`, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: body ? JSON.stringify(body) : undefined
            });
            
            if (response.status === 401) {
                // Token is invalid, clear it and prompt again
                await this.authProvider.clearToken();
                vscode.window.showErrorMessage('Your API token has expired. Please enter a new token.');
                throw new Error('Authentication failed');
            }
            
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }
            
            return await response.json();
        } catch (error) {
            vscode.window.showErrorMessage(`API Error: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    
    // Method to get user profile
    public async getUserProfile(): Promise<any> {
        return this.request('user/profile');
    }
    
    // Method to check subscription status
    public async checkSubscription(): Promise<any> {
        return this.request('user/subscription');
    }
}