import apiService from './ApiService';
import {jwtDecode} from 'jwt-decode';

// User interfaces
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    Email: string;
    FirstName: string;
    LastName: string;
    Username: string;
    Password: string;
    confirmPassword: string;
    FavoriteTeamId?: number | null;
    Image?: File | null;
    Age: number | null;
    Gender: string;
    PhoneNumber?: string | null;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface ResetPasswordRequest {
    email: string;
    token: string;
    password: string;
    confirmPassword: string;
}

export interface UpdateUserRequest {
    Id: string;
    username?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
    favoriteTeamId?: number | null;
    age?: number;
    PhoneNumber?: number | null;
    Image?: File
}

export interface AuthResponse {
    accessToken: string;
    expiresAt: string;
    userId: string;
    email: string;
    username?: string;
    roles?: string[];
}

export interface RegisterResponse {
    succeeded: boolean;
    userId: string;
    error: string;
}

export interface DecodedToken {
    sub: string;  // subject (user id)
    email: string;
    role?: string | string[];
    name?: string;
    exp: number;  // expiration timestamp
    iat: number;  // issued at timestamp
    iss?: string; // issuer
    aud?: string; // audience
    jti?: string; // JWT ID
    favoriteTeamId?: string | null; // custom claim
    claimNameId?: string; // original long-form claim name identifier
    claimEmail?: string; // original long-form claim email address
    claimName?: string; // original long-form claim name
    claimRole?: string | string[]; // original long-form claim role
    // Add the long-form claims as optional indexable properties
    [key: string]: any;
}

export interface UserProfile {
    userId: string;
    email: string;
    username: string;
    roles: string[];
    favoriteTeamName: string;
    emailConfirmed: boolean;
    imageUrl: string;
    age: number;
    gender: string;
    favoriteTeamId: number | null;
}

class AuthenticationService {
    private readonly TOKEN_KEY = 'accessToken';
    private readonly USER_KEY = 'user';

    /**
     * Login user and store token
     */
    public async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            const response = await apiService.post<AuthResponse>('/auth/login', credentials);
            this.storeToken(response.accessToken);
            this.storeUser(response);
            return response;
        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    }

    /**
     * Register a new user
     */
    public async register(userData: RegisterRequest): Promise<RegisterResponse> {
        try {
            // Create a FormData object to handle file uploads
            const formData = new FormData();
            formData.append('FirstName', userData.FirstName);
            formData.append('LastName', userData.LastName);
            formData.append('Username', userData.Username);
            formData.append('Gender', userData.Gender);
            formData.append('email', userData.Email);
            formData.append('password', userData.Password);
            formData.append('confirmPassword', userData.confirmPassword);
            formData.append('favoriteTeamId', userData.FavoriteTeamId?.toString() || '');
            if (userData.Image) {
                formData.append('Image', userData.Image);
            }
            formData.append('Age', userData.Age?.toString() || '');
            formData.append('PhoneNumber', userData.PhoneNumber || '');

            return await apiService.post<RegisterResponse>('/auth/register', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    /**
     * Logout the user by removing stored tokens and data
     */
    public logout(): void {
        // Call the API to revoke the token if the user is authenticated
        if (this.isAuthenticated()) {
            try {
                apiService.post('/auth/revoke-token', {}).then();
            } catch (error) {
                console.error('Token revocation failed:', error);
            }
        }

        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    }

    /**
     * Check if the user is logged in
     */
    public isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired
        try {
            const decoded = this.decodeToken(token);
            const currentTime = Date.now() / 1000;
            return decoded.exp > currentTime;
        } catch (error) {
            this.clearTokens();
            return false;
        }
    }

    /**
     * Get the current user from stored token
     */
    public getCurrentUser(): DecodedToken | null {
        try {
            const token = this.getToken();
            if (!token) return null;

            const decoded = this.decodeToken(token);

            // Create a standardized user object with properly mapped claims
            return {
                // Core standard claims
                sub: decoded.sub || '',
                email: decoded.email || '',
                name: decoded.name,
                role: decoded.role,
                exp: decoded.exp,
                iat: decoded.iat || Math.floor(Date.now() / 1000),

                // Additional custom claims
                favoriteTeamId: decoded.favoriteTeamId,

                // Include original JWT standard claims that we haven't explicitly mapped
                iss: decoded.iss,
                aud: decoded.aud,
                jti: decoded.jti,

                // Add direct accessors for the original long-form claim names
                claimNameId: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
                claimEmail: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
                claimName: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
                claimRole: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
            };
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Get user profile from the API
     */
    public async getUserProfile(id: string): Promise<UserProfile> {
        try {
            return await apiService.get<UserProfile>(`/auth/profile/${id}`);
        } catch (error) {
            console.error('Error fetching user profile:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    public async updateProfile(updateData: UpdateUserRequest): Promise<UserProfile> {
        try {
            // Create a FormData object to handle file uploads
            return await apiService.put<UserProfile>('/auth/update', updateData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
        } catch (error) {
            console.error('Profile update failed:', error);
            throw error;
        }
    }

    /**
     * Check if the current user has the required role
     */
    public hasRole(role: string | string[]): boolean {
        try {
            const user = this.getCurrentUser();
            if (!user) return false;

            // Get user roles from the token
            // @ts-ignore
            const userRole = user.role || user['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];

            if (!userRole) return false;

            // Convert to array for consistent handling
            const userRoles = Array.isArray(userRole) ? userRole : [userRole];

            if (Array.isArray(role)) {
                return role.some(r => userRoles.includes(r));
            }

            return userRoles.includes(role);
        } catch (error) {
            console.error('Error checking user role:', error);
            return false;
        }
    }

    /**
     * Refresh the user's token
     */
    public async refreshToken(): Promise<boolean> {
        try {
            const response = await apiService.post<AuthResponse>('/auth/refresh-token', {});
            this.storeToken(response.accessToken);
            this.storeUser(response);
            return true;
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.clearTokens();
            return false;
        }
    }

    /**
     * Manual refresh token (for Swagger testing)
     */
    public async manualRefreshToken(token: string): Promise<AuthResponse> {
        try {
            const response = await apiService.post<AuthResponse>('/auth/manual-refresh', token);
            this.storeToken(response.accessToken);
            this.storeUser(response);
            return response;
        } catch (error) {
            console.error('Manual token refresh failed:', error);
            throw error;
        }
    }

    /**
     * Check if token needs refreshing (e.g., if it's about to expire)
     */
    public async checkAndRefreshToken(): Promise<boolean> {
        const token = this.getToken();
        if (!token) return false;

        try {
            const decoded = this.decodeToken(token);
            const currentTime = Date.now() / 1000;

            // If token will expire in less than 5 minutes (300 seconds), refresh it
            if (decoded.exp - currentTime < 300) {
                return await this.refreshToken();
            }

            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            this.clearTokens();
            return false;
        }
    }

    /**
     * Request password reset
     */
    public async forgotPassword(email: string): Promise<boolean> {
        try {
            await apiService.post('/auth/forgot-password', {email});
            return true;
        } catch (error) {
            console.error('Password reset request failed:', error);
            throw error;
        }
    }

    /**
     * Reset password with token
     */
    public async resetPassword(resetData: ResetPasswordRequest): Promise<boolean> {
        try {
            const {email, token, password, confirmPassword} = resetData;
            await apiService.post('/auth/reset-password', {password, confirmPassword}, {
                params: {email, token}
            });
            return true;
        } catch (error) {
            console.error('Password reset failed:', error);
            throw error;
        }
    }

    /**
     * Confirm email
     */
    public async confirmEmail(userId: string, token: string): Promise<boolean> {
        try {
            await apiService.post('/auth/confirm-email', {}, {
                params: {userId, token}
            });
            return true;
        } catch (error) {
            console.error('Email confirmation failed:', error);
            throw error;
        }
    }

    /**
     * Resend email confirmation
     */
    public async resendEmailConfirmation(email: string): Promise<boolean> {
        try {
            await apiService.post('/auth/resend-email-confirmation', {email});
            return true;
        } catch (error) {
            console.error('Resend email confirmation failed:', error);
            throw error;
        }
    }

    /**
     * Decode a JWT token
     */
    private decodeToken(token: string): DecodedToken {
        return jwtDecode<DecodedToken>(token);
    }

    /**
     * Store token in localStorage
     */
    private storeToken(token: string, remember: boolean = true): void {
        if (remember) {
            localStorage.setItem(this.TOKEN_KEY, token);
        } else {
            sessionStorage.setItem(this.TOKEN_KEY, token);
        }
    }

    /**
     * Store user info in localStorage
     */
    private storeUser(userData: AuthResponse): void {
        localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
    }

    /**
     * Get token from storage
     */
    private getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Clear all stored tokens
     */
    private clearTokens(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);
    }
}

// Create and export a singleton instance
const authService = new AuthenticationService();
export default authService;

