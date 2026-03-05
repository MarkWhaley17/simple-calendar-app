import AsyncStorage from '@react-native-async-storage/async-storage';
import { login, logout, getToken, getUser, isAuthenticated, wpFetch } from '../../utils/auth';

const TOKEN_KEY = '@auth_token';
const USER_KEY = '@auth_user';

const mockFetch = jest.fn();
global.fetch = mockFetch;

beforeEach(() => {
  jest.clearAllMocks();
  (AsyncStorage.clear as jest.Mock)();
});

describe('login', () => {
  it('returns AuthUser and stores token on success', async () => {
    mockFetch
      // token endpoint
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jwt_token: 'test-jwt', status: 'success' }),
      })
      // users/me endpoint
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Mark Whaley' }),
      });

    const user = await login('marktwhaley', 'password123');

    expect(user).toEqual({ email: 'marktwhaley', displayName: 'Mark Whaley' });
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(TOKEN_KEY, 'test-jwt');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      USER_KEY,
      JSON.stringify({ email: 'marktwhaley', displayName: 'Mark Whaley' })
    );
  });

  it('falls back to username as displayName when users/me fails', async () => {
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ jwt_token: 'test-jwt' }),
      })
      .mockResolvedValueOnce({ ok: false, json: async () => ({}) });

    const user = await login('marktwhaley', 'password123');
    expect(user.displayName).toBe('marktwhaley');
  });

  it('throws with error_description on invalid credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        status: 'error',
        error: 'INVALID_CREDENTIALS',
        error_description: 'Invalid username or password.',
      }),
    });

    await expect(login('bad', 'wrong')).rejects.toThrow('Invalid username or password.');
  });

  it('throws fallback message when no error_description', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'error' }),
    });

    await expect(login('bad', 'wrong')).rejects.toThrow('Invalid credentials');
  });
});

describe('logout', () => {
  it('removes token and user from AsyncStorage', async () => {
    await logout();
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([TOKEN_KEY, USER_KEY]);
  });
});

describe('getToken', () => {
  it('returns null when no token stored', async () => {
    const token = await getToken();
    expect(token).toBeNull();
  });

  it('returns stored token', async () => {
    await AsyncStorage.setItem(TOKEN_KEY, 'my-token');
    const token = await getToken();
    expect(token).toBe('my-token');
  });
});

describe('getUser', () => {
  it('returns null when no user stored', async () => {
    const user = await getUser();
    expect(user).toBeNull();
  });

  it('returns parsed user object', async () => {
    const stored = { email: 'marktwhaley', displayName: 'Mark Whaley' };
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(stored));
    const user = await getUser();
    expect(user).toEqual(stored);
  });
});

describe('isAuthenticated', () => {
  it('returns false when no token in storage', async () => {
    const result = await isAuthenticated();
    expect(result).toBe(false);
  });

  it('returns true when token-validate responds with status TRUE', async () => {
    await AsyncStorage.setItem(TOKEN_KEY, 'valid-token');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'TRUE', message: 'VALID_TOKEN', code: '200' }),
    });

    const result = await isAuthenticated();
    expect(result).toBe(true);
  });

  it('returns false when token-validate returns error status', async () => {
    await AsyncStorage.setItem(TOKEN_KEY, 'expired-token');
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ status: 'error', error: 'EXPIRED_TOKEN' }),
    });

    const result = await isAuthenticated();
    expect(result).toBe(false);
  });

  it('returns true on network error (offline fallback)', async () => {
    await AsyncStorage.setItem(TOKEN_KEY, 'cached-token');
    mockFetch.mockRejectedValueOnce(new Error('Network request failed'));

    const result = await isAuthenticated();
    expect(result).toBe(true);
  });
});

describe('wpFetch', () => {
  it('includes Authorization header when token is stored', async () => {
    await AsyncStorage.setItem(TOKEN_KEY, 'my-jwt');
    mockFetch.mockResolvedValueOnce({ ok: true });

    await wpFetch('/wp/v2/posts');

    expect(mockFetch).toHaveBeenCalledWith(
      'https://kalapamedia.com/wp-json/wp/v2/posts',
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer my-jwt' }),
      })
    );
  });

  it('omits Authorization header when no token', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true });

    await wpFetch('/wp/v2/posts');

    const callHeaders = mockFetch.mock.calls[0][1].headers;
    expect(callHeaders).not.toHaveProperty('Authorization');
  });
});
