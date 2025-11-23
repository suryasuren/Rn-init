type TokenPair = { accessToken: string; refreshToken: string } | null;

type KeychainModule = {
  getGenericPassword?: (opts?: { service?: string }) => Promise<{ password: string } | false | null>;
  setGenericPassword?: (username: string, password: string, opts?: { service?: string }) => Promise<boolean>;
  resetGenericPassword?: (opts?: { service?: string }) => Promise<boolean>;
};

type AsyncStorageModule = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

let Keychain: KeychainModule | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Keychain = require("react-native-keychain") as KeychainModule;
} catch {
  Keychain = null;
}

const ASYNC_KEY = "@app:authTokens";
const KC_SERVICE = "authTokens";

let cache: TokenPair | undefined = undefined;
let readPromise: Promise<TokenPair> | null = null;
let gen = 0;

const safeParse = <T = unknown>(s: string | null): T | null => {
  if (!s) return null;
  try {
    return JSON.parse(s) as T;
  } catch {
    return null;
  }
};

let AsyncStorageModuleInstance: AsyncStorageModule | null = null;
async function getAsyncStorage(): Promise<AsyncStorageModule | null> {
  if (AsyncStorageModuleInstance) return AsyncStorageModuleInstance;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require("@react-native-async-storage/async-storage") as { default: AsyncStorageModule } | null;
    AsyncStorageModuleInstance = mod?.default ?? null;
  } catch {
    AsyncStorageModuleInstance = null;
  }
  return AsyncStorageModuleInstance;
}

async function readKeychain(): Promise<TokenPair> {
  if (!Keychain?.getGenericPassword) return null;
  try {
    const creds = await Keychain.getGenericPassword({ service: KC_SERVICE });
    if (!creds) return null;
    return safeParse<TokenPair>(creds.password ?? null);
  } catch {
    return null;
  }
}

async function readAsync(): Promise<TokenPair> {
  const AS = await getAsyncStorage();
  if (!AS) return null;
  try {
    const raw = await AS.getItem(ASYNC_KEY);
    return safeParse<TokenPair>(raw);
  } catch {
    return null;
  }
}

async function writeKeychain(payload: TokenPair): Promise<boolean> {
  if (!payload || !Keychain?.setGenericPassword) return false;
  try {
    await Keychain.setGenericPassword("auth", JSON.stringify(payload), { service: KC_SERVICE });
    return true;
  } catch {
    return false;
  }
}

async function writeAsync(payload: TokenPair): Promise<void> {
  const AS = await getAsyncStorage();
  if (!AS) return;
  try {
    await AS.setItem(ASYNC_KEY, JSON.stringify(payload));
  } catch {}
}

export const setTokens = async (accessToken: string, refreshToken: string): Promise<void> => {
  const payload: TokenPair = { accessToken, refreshToken };
  gen++;
  cache = payload;

  if (!(await writeKeychain(payload))) {
    await writeAsync(payload);
  }
};

export const getTokens = async (): Promise<TokenPair> => {
  if (cache !== undefined) return cache;
  if (readPromise) return readPromise;

  const captured = gen;

  readPromise = (async () => {
    const kc = await readKeychain();
    if (captured !== gen) return null;
    if (kc?.accessToken || kc?.refreshToken) {
      cache = kc;
      return kc;
    }

    const as = await readAsync();
    if (captured !== gen) return null;
    if (as?.accessToken || as?.refreshToken) {
      cache = as;
      return as;
    }

    cache = null;
    return null;
  })();

  return readPromise;
};

export const getAccessToken = async (): Promise<string | null> => {
  const tokens = await getTokens();
  return tokens?.accessToken ?? null;
};

export const getRefreshToken = async (): Promise<string | null> => {
  const tokens = await getTokens();
  return tokens?.refreshToken ?? null;
};

export const clearTokens = async (): Promise<void> => {
  gen++;
  cache = null;
  readPromise = null;

  try {
    if (Keychain?.resetGenericPassword) {
      await Keychain.resetGenericPassword({ service: KC_SERVICE });
    }
  } catch {}

  try {
    const AS = await getAsyncStorage();
    if (AS) await AS.removeItem(ASYNC_KEY);
  } catch {}
};
