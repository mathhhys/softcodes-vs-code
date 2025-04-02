import * as vscode from 'vscode';

export class TokenAuthProvider {
    private static readonly TOKEN_KEY = 'softcodes.apiToken';
    private _token: string | undefined;
    private _onDidChangeToken = new vscode.EventEmitter<boolean>();
    readonly onDidChangeToken = this._onDidChangeToken.event;

    constructor(private readonly context: vscode.ExtensionContext) {
        // Try to load token on startup
        this.loadToken();
    }

    private async loadToken(): Promise<void> {
        this._token = await this.context.secrets.get(TokenAuthProvider.TOKEN_KEY);
    }

    public async getToken(): Promise<string | undefined> {
        if (!this._token) {
            await this.loadToken();
        }
        return this._token;
    }

    public async setToken(token: string): Promise<void> {
        await this.context.secrets.store(TokenAuthProvider.TOKEN_KEY, token);
        this._token = token;
        this._onDidChangeToken.fire(true);
    }

    public async clearToken(): Promise<void> {
        await this.context.secrets.delete(TokenAuthProvider.TOKEN_KEY);
        this._token = undefined;
        this._onDidChangeToken.fire(false);
    }

    public async isAuthenticated(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    }

    public async promptForToken(): Promise<string | undefined> {
        const token = await vscode.window.showInputBox({
            prompt: 'Enter your Softcodes API token from enterprise-softcodes.io',
            password: true,
            ignoreFocusOut: true,
            placeHolder: 'API Token'
        });

        if (token) {
            await this.setToken(token);
            return token;
        }
        
        return undefined;
    }

    // Validate token with a simple API call to your server
    public async validateToken(token: string): Promise<boolean> {
        try {
            const response = await fetch('https://enterprise-softcodes.io/api/validate-token', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            return response.ok;
        } catch (error) {
            console.error('Token validation error:', error);
            return false;
        }
    }
}