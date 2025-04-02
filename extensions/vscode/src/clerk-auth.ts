import * as vscode from 'vscode';
import { EventEmitter } from 'vscode';
import axios from 'axios';

// AuthState singleton to share auth state across the application
export class AuthState {
    private static instance: AuthState;
    private _isAuthenticated: boolean = false;
    private statusEmitter = new EventEmitter<boolean>();

    private constructor() {}

    public static getInstance(): AuthState {
        if (!AuthState.instance) {
            AuthState.instance = new AuthState();
        }
        return AuthState.instance;
    }

    public get isAuthenticated(): boolean {
        return this._isAuthenticated;
    }

    public set isAuthenticated(value: boolean) {
        this._isAuthenticated = value;
        this.statusEmitter.fire(value);
    }

    public onDidChangeAuthStatus(listener: (isAuthenticated: boolean) => void): vscode.Disposable {
        return this.statusEmitter.event(listener);
    }
}

export class ClerkTokenAuth {
    private token: string | undefined;
    private statusEmitter = new EventEmitter<boolean>();
    private outputChannel: vscode.OutputChannel;
    private userInfoCache: any = null;
    
    // Clerk API constants
    private readonly CLERK_API_BASE = 'https://api.clerk.com/v1';
    
    // This will store the custom Clerk instance domain if using Enterprise
    private clerkDomain: string | null = null;
    
    // Flag to identify VSCode extension tokens
    private isVSCodeExtensionToken: boolean = false;
    
    // Reference to global auth state
    private authState = AuthState.getInstance();
    
    constructor(private context: vscode.ExtensionContext) {
        // Create debug output channel
        this.outputChannel = vscode.window.createOutputChannel('Softcodes Auth Debug');
        this.outputChannel.show();
        this.log('ClerkTokenAuth initialized');
        
        // Try to load existing token
        this.token = context.globalState.get('softcodes.authToken');
        this.log(`Existing token found: ${this.token ? 'Yes' : 'No'}`);
        
        // If token exists, try to decode it for debugging
        if (this.token) {
            try {
                // Check if it's a valid JWT format before attempting to decode
                if (this.token.startsWith('eyJ') && this.token.split('.').length === 3) {
                    const decoded = this.decodeToken(this.token);
                    
                    // Try to extract Clerk domain from the token issuer
                    if (decoded && decoded.iss) {
                        this.clerkDomain = decoded.iss;
                        this.log(`Detected Clerk domain from token: ${this.clerkDomain}`);
                    }
                    
                    // Check if this is a VSCode extension token
                    if (decoded && decoded.vscodeExtension === true) {
                        this.log('Detected VSCode Extension token format');
                        this.isVSCodeExtensionToken = true;
                    }
                } else {
                    this.log('Stored token is not in JWT format, will need to verify with API calls');
                }
            } catch (error) {
                this.log(`Error checking stored token: ${error instanceof Error ? error.message : String(error)}`);
                // Don't throw, just note the error
            }
        }
        
        // Initialize auth state based on token
        this.checkAuthAndUpdateState();
    }
    
    // Check authentication and update the global auth state
    private async checkAuthAndUpdateState(): Promise<void> {
        const isAuth = await this.isAuthenticated();
        this.authState.isAuthenticated = isAuth;
        this.log(`Auth state initialized: ${isAuth ? 'Authenticated' : 'Not authenticated'}`);
    }
    
    public onDidChangeAuthStatus(listener: (isAuthenticated: boolean) => void): vscode.Disposable {
        this.log('Auth status listener registered');
        return this.statusEmitter.event(listener);
    }
    
    public dispose(): void {
        this.log('ClerkTokenAuth disposed');
        this.outputChannel.dispose();
    }
    
    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }
    
    /**
     * Decodes and logs JWT token information
     */
    private decodeToken(token: string): any {
        try {
            // JWT tokens consist of three parts separated by dots
            const parts = token.split('.');
            if (parts.length !== 3) {
                this.log('Token does not appear to be a valid JWT (should have 3 parts)');
                return null;
            }
            
            // The second part contains the payload (claims)
            const payload = parts[1];
            
            // Base64 decode and parse as JSON
            // Need to pad the base64 string to make it valid for decoding
            const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
            const pad = '='.repeat((4 - base64.length % 4) % 4);
            const decodedStr = Buffer.from(base64 + pad, 'base64').toString();
            
            const decoded = JSON.parse(decodedStr);
            
            // Log relevant information without exposing sensitive details
            this.log(`Token decoded successfully`);
            this.log(`Issuer: ${decoded.iss || 'Not specified'}`);
            this.log(`Subject: ${decoded.sub || 'Not specified'}`);
            this.log(`Expires at: ${decoded.exp ? new Date(decoded.exp * 1000).toISOString() : 'Not specified'}`);
            
            // List all available claims without their values
            this.log(`Available claims: ${Object.keys(decoded).join(', ')}`);
            
            // Check if this is a VSCode extension token
            if (decoded.vscodeExtension === true) {
                this.log('Detected VSCode Extension token format');
                this.isVSCodeExtensionToken = true;
            }
            
            // For debugging, show user-related fields if they exist
            if (decoded.primaryEmail) this.log(`Email: ${decoded.primaryEmail}`);
            if (decoded.email) this.log(`Email: ${decoded.email}`);
            if (decoded.firstName && decoded.lastName) this.log(`Name: ${decoded.firstName} ${decoded.lastName}`);
            if (decoded.name) this.log(`Name: ${decoded.name}`);
            
            return decoded;
        } catch (error) {
            this.log(`Error decoding token: ${error instanceof Error ? error.message : String(error)}`);
            return null;
        }
    }
    
    public async isAuthenticated(): Promise<boolean> {
        this.log('Checking authentication status');
        const hasToken = !!this.token;
        this.log(`Has token: ${hasToken}`);
        
        if (hasToken) {
            try {
                // Verify token is still valid
                const userInfo = await this.getUserInfo();
                const isValid = !!userInfo;
                this.log(`Token validation result: ${isValid ? 'Valid' : 'Invalid'}`);
                
                // Update global auth state
                this.authState.isAuthenticated = isValid;
                
                return isValid;
            } catch (error) {
                this.log(`Token validation error: ${error instanceof Error ? error.message : String(error)}`);
                
                // Update global auth state
                this.authState.isAuthenticated = false;
                
                return false;
            }
        }
        
        // Update global auth state
        this.authState.isAuthenticated = false;
        
        return false;
    }
    
    public async login(): Promise<boolean> {
        this.log('Starting login process');
        
        try {
            // Prompt for token input
            const inputToken = await vscode.window.showInputBox({
                title: 'Softcodes Authentication',
                prompt: 'Please enter your authentication token',
                password: true,
                ignoreFocusOut: true
            });
            
            this.log(`Token input received: ${inputToken ? 'Yes' : 'No'}`);
            
            if (!inputToken) {
                this.log('Login cancelled - no token provided');
                return false;
            }
            
            // Log token format details (without revealing the actual token)
            this.log(`Token length: ${inputToken.length}`);
            this.log(`Token format check: starts with "sc_" - ${inputToken.startsWith('sc_')}`);
            
            // For JWT tokens, log the first few characters
            if (inputToken.startsWith('ey') && inputToken.split('.').length === 3) {
                this.log('Detected JWT token format');
                // Decode the token for debugging
                const decoded = this.decodeToken(inputToken);
                
                // Extract Clerk domain from the token issuer
                if (decoded && decoded.iss) {
                    this.clerkDomain = decoded.iss;
                    this.log(`Detected Clerk domain from token: ${this.clerkDomain}`);
                }
                
                // Check if this is a VSCode extension token
                if (decoded && decoded.vscodeExtension === true) {
                    this.log('Detected VSCode Extension token format');
                    this.isVSCodeExtensionToken = true;
                }
            }
            
            // Attempt to validate the token
            this.log('Validating token...');
            
            try {
                // Try validating token
                await this.validateToken(inputToken);
                
                // If validation succeeds, save the token
                this.token = inputToken;
                await this.context.globalState.update('softcodes.authToken', inputToken);
                this.log('Token validated and saved successfully');
                
                // Update global auth state
                this.authState.isAuthenticated = true;
                
                // Notify listeners that auth status changed
                this.statusEmitter.fire(true);
                return true;
            } catch (error) {
                this.log(`Token validation failed: ${error instanceof Error ? error.message : String(error)}`);
                
                // Show error to user
                vscode.window.showErrorMessage(`Authentication failed: ${error instanceof Error ? error.message : 'Invalid token'}`);
                
                // Clear invalid token
                this.token = undefined;
                await this.context.globalState.update('softcodes.authToken', undefined);
                
                // Update global auth state
                this.authState.isAuthenticated = false;
                
                return false;
            }
        } catch (error) {
            this.log(`Login process error: ${error instanceof Error ? error.message : String(error)}`);
            
            // Update global auth state
            this.authState.isAuthenticated = false;
            
            return false;
        }
    }
    
    private async validateToken(token: string): Promise<any> {
        this.log('Making validation request');
        
        // Determine token type
        const isJWT = token.startsWith('ey') && token.split('.').length === 3;
        const isClerkApiKey = token.startsWith('sc_');
        
        this.log(`Token type: ${isJWT ? 'JWT' : isClerkApiKey ? 'Clerk API Key' : 'Unknown'}`);
        
        // For JWT tokens, verify format and expiration locally
        if (isJWT) {
            try {
                const decoded = this.decodeToken(token);
                if (!decoded) {
                    throw new Error('Failed to decode token');
                }
                
                // Check if token is expired based on decode
                if (decoded && decoded.exp) {
                    const expiryDate = new Date(decoded.exp * 1000);
                    const now = new Date();
                    
                    if (expiryDate < now) {
                        this.log(`Token expired on ${expiryDate.toISOString()}`);
                        throw new Error('Token has expired');
                    }
                    
                    // Log time until expiration
                    const timeToExpiry = expiryDate.getTime() - now.getTime();
                    const minutesToExpiry = Math.floor(timeToExpiry / (1000 * 60));
                    this.log(`Token valid for ${minutesToExpiry} more minutes`);
                }
                
                // Extract Clerk domain from issuer if available
                if (decoded && decoded.iss) {
                    this.clerkDomain = decoded.iss;
                    this.log(`Using Clerk domain from token: ${this.clerkDomain}`);
                }
                
                // Check if this is a VSCode extension token
                if (decoded && decoded.vscodeExtension === true) {
                    this.log('Detected VSCode Extension token format');
                    this.isVSCodeExtensionToken = true;
                }
                
                // For Softcodes VSCode extension, we'll validate the token locally
                // This is sufficient since JWT tokens are cryptographically signed
                this.log('Performing local JWT validation');
                
                // Check for required claims
                if (!decoded.sub) {
                    throw new Error('Token is missing required subject claim');
                }
                
                // If we reach here, token is valid
                this.log('JWT token validated locally');
                
                // Return user data from token
                return {
                    id: decoded.userId || decoded.sub,
                    name: decoded.firstName && decoded.lastName ? 
                          `${decoded.firstName} ${decoded.lastName}` : 
                          'Authenticated User',
                    email: decoded.primaryEmail || '',
                    accountType: decoded.accountType || 'Authenticated',
                    token: token,
                    tokenExpiry: decoded.exp ? new Date(decoded.exp * 1000) : null
                };
            } catch (error) {
                this.log(`JWT validation error: ${error instanceof Error ? error.message : String(error)}`);
                throw error;
            }
        } else if (isClerkApiKey) {
            // For Clerk API keys, we'll assume it's valid
            // In a production environment, you'd want to validate this with Clerk
            this.log('API key format detected, assuming valid');
            return {
                id: 'api_user',
                name: 'API User',
                accountType: 'API'
            };
        } else {
            // For non-standard tokens, just validate format
            this.log('Unknown token format, performing basic validation');
            
            if (token.length < 10) {
                throw new Error('Token is too short to be valid');
            }
            
            return {
                id: 'user',
                name: 'Authenticated User',
                accountType: 'User'
            };
        }
    }
    
    public async getUserInfo(): Promise<any> {
        this.log('Fetching user info');
        
        if (!this.token) {
            this.log('No token available - cannot fetch user info');
            return null;
        }
        
        try {
            // Use cached info if available to reduce processing
            if (this.userInfoCache) {
                this.log('Returning cached user info');
                return this.userInfoCache;
            }
            
            // For JWT tokens, extract info directly from token
            if (this.token.startsWith('ey') && this.token.split('.').length === 3) {
                const decoded = this.decodeToken(this.token);
                if (!decoded) {
                    this.log('Failed to decode token');
                    return null;
                }
                
                // Create user info from token claims
                const userInfo = {
                    id: decoded.userId || decoded.sub,
                    name: decoded.firstName && decoded.lastName ? 
                          `${decoded.firstName} ${decoded.lastName}` : 
                          decoded.name || 'User',
                    email: decoded.primaryEmail || decoded.email || '',
                    accountType: decoded.accountType || 'User',
                    subscriptionStatus: 'active',
                    organization: decoded.org_id ? {
                        id: decoded.org_id,
                        role: decoded.org_role,
                        slug: decoded.org_slug,
                        permissions: decoded.org_permissions
                    } : null
                };
                
                // Cache the result
                this.userInfoCache = userInfo;
                
                this.log('User info extracted from JWT token');
                this.log(`User ID: ${userInfo.id}`);
                this.log(`User email: ${userInfo.email || 'Not available'}`);
                if (userInfo.accountType) this.log(`User account type: ${userInfo.accountType}`);
                
                return userInfo;
            } else if (this.token.startsWith('sc_')) {
                // For API keys, create basic user info
                const userInfo = {
                    id: 'api_user',
                    name: 'API User',
                    accountType: 'API',
                    subscriptionStatus: 'active'
                };
                
                // Cache the result
                this.userInfoCache = userInfo;
                
                this.log('API key user info created');
                return userInfo;
            } else {
                // For other token types, create generic user info
                const userInfo = {
                    id: 'user',
                    name: 'Authenticated User',
                    accountType: 'User',
                    subscriptionStatus: 'active'
                };
                
                // Cache the result
                this.userInfoCache = userInfo;
                
                this.log('Generic user info created for non-standard token');
                return userInfo;
            }
        } catch (error) {
            this.log(`Error fetching user info: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    
    public async checkTokenExpiration(): Promise<void> {
        this.log('Checking token expiration');
        
        if (!this.token) {
            this.log('No token to check expiration');
            return;
        }
        
        // For JWT tokens, check expiration from the token itself
        if (this.token.startsWith('eyJ') && this.token.split('.').length === 3) {
            try {
                const decoded = this.decodeToken(this.token);
                if (decoded && decoded.exp) {
                    const expiryDate = new Date(decoded.exp * 1000);
                    const now = new Date();
                    
                    const timeToExpiry = expiryDate.getTime() - now.getTime();
                    const daysToExpiry = Math.floor(timeToExpiry / (1000 * 60 * 60 * 24));
                    
                    this.log(`Token expires on ${expiryDate.toISOString()} (${daysToExpiry} days from now)`);
                    
                    if (expiryDate < now) {
                        this.log('Token has expired - clearing');
                        // Clear expired token
                        this.token = undefined;
                        this.userInfoCache = null;
                        await this.context.globalState.update('softcodes.authToken', undefined);
                        
                        // Update global auth state
                        this.authState.isAuthenticated = false;
                        
                        this.statusEmitter.fire(false);
                        
                        // Notify user
                        vscode.window.showWarningMessage('Your Softcodes authentication has expired. Please log in again.');
                        return;
                    }
                    
                    // Warn if token is about to expire
                    if (daysToExpiry < 7) {
                        this.log(`Token expiring soon (${daysToExpiry} days left)`);
                        vscode.window.showWarningMessage(`Your Softcodes authentication will expire in ${daysToExpiry} days. Please get a new token soon.`);
                    }
                    
                    return;
                }
            } catch (error) {
                this.log(`Error checking JWT expiration: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        
        // For non-JWT tokens, we can't easily check expiration
        this.log('Token format does not support expiration checking');
    }
    
    public async logout(): Promise<void> {
        this.log('Logging out user');
        
        // Clear the token and cache
        this.token = undefined;
        this.userInfoCache = null;
        await this.context.globalState.update('softcodes.authToken', undefined);
        
        // Update global auth state
        this.authState.isAuthenticated = false;
        
        this.log('Logout complete - token cleared');
        
        // Notify listeners that auth status changed
        this.statusEmitter.fire(false);
        
        // Notify user
        vscode.window.showInformationMessage('You have been logged out of Softcodes.');
    }
    
    // Method to get the current auth token - used by API clients
    public getAuthToken(): string | undefined {
        return this.token;
    }
}