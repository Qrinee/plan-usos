import crypto from 'crypto';

export interface OAuthRequestParams {
  url: string;
  method?: 'GET' | 'POST';
  params?: Record<string, string | number | boolean>;
  consumerKey: string;
  consumerSecret: string;
  token?: string;
  tokenSecret?: string;
}

export class USOSOAuthClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.USOS_BASE_URL || 'https://usosapps.prz.edu.pl/') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  }

  public static percentEncode(str: string): string {
    return encodeURIComponent(str)
      .replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
  }

  public static generateNonce(length: number = 32): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
  }

  public static getTimestamp(): string {
    return Math.floor(Date.now() / 1000).toString();
  }

  public static buildSignature(
    method: string,
    url: string,
    params: Record<string, string>,
    consumerSecret: string,
    tokenSecret: string = ''
  ): string {
    const parsedUrl = new URL(url);
    const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;

    const sortedKeys = Object.keys(params).sort();
    const paramPairs = sortedKeys.map((key) => {
      return `${this.percentEncode(key)}=${this.percentEncode(params[key])}`;
    });
    const normalizedParams = paramPairs.join('&');

    const baseString = [
      method.toUpperCase(),
      this.percentEncode(normalizedUrl),
      this.percentEncode(normalizedParams),
    ].join('&');

    const signingKey = `${this.percentEncode(consumerSecret)}&${this.percentEncode(tokenSecret)}`;

    return crypto
      .createHmac('sha1', signingKey)
      .update(baseString)
      .digest('base64');
  }

  public static buildAuthHeader(params: Record<string, string>, filterOauthOnly: boolean = false): string {
    const keys = Object.keys(params)
      .filter((k) => !filterOauthOnly || k.startsWith('oauth_'))
      .sort();

    const headerParts = keys.map((k) => {
      return `${this.percentEncode(k)}="${this.percentEncode(params[k])}"`;
    });

    return `OAuth ${headerParts.join(', ')}`;
  }

  async getRequestToken(options: {
    consumerKey: string;
    consumerSecret: string;
    callbackUrl: string;
    scopes?: string;
  }): Promise<{ oauth_token: string; oauth_token_secret: string }> {
    const url = `${this.baseUrl}services/oauth/request_token`;
    const method = 'POST';

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: options.consumerKey,
      oauth_nonce: USOSOAuthClient.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: USOSOAuthClient.getTimestamp(),
      oauth_version: '1.0',
      oauth_callback: options.callbackUrl,
    };

    const allParams: Record<string, string> = { ...oauthParams };
    if (options.scopes) {
      allParams.scopes = options.scopes;
    }

    const signature = USOSOAuthClient.buildSignature(
      method,
      url,
      allParams,
      options.consumerSecret,
      ''
    );

    oauthParams.oauth_signature = signature;

    const authHeader = USOSOAuthClient.buildAuthHeader(oauthParams, true);

    const requestUrl = options.scopes
      ? `${url}?scopes=${encodeURIComponent(options.scopes)}`
      : url;

    const res = await fetch(requestUrl, {
      method,
      headers: {
        Authorization: authHeader,
      },
    });

    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(`Błąd USOS API (${res.status}): ${responseText}`);
    }

    const parsed = new URLSearchParams(responseText);
    const oauth_token = parsed.get('oauth_token');
    const oauth_token_secret = parsed.get('oauth_token_secret');

    if (!oauth_token || !oauth_token_secret) {
      throw new Error(`Nieprawidłowa odpowiedź tokena USOS: ${responseText}`);
    }

    return { oauth_token, oauth_token_secret };
  }

  getAuthorizeUrl(requestToken: string): string {
    return `${this.baseUrl}services/oauth/authorize?oauth_token=${encodeURIComponent(requestToken)}`;
  }

  async getAccessToken(options: {
    consumerKey: string;
    consumerSecret: string;
    requestToken: string;
    requestTokenSecret: string;
    oauthVerifier: string;
  }): Promise<{ oauth_token: string; oauth_token_secret: string }> {
    const url = `${this.baseUrl}services/oauth/access_token`;
    const method = 'POST';

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: options.consumerKey,
      oauth_token: options.requestToken,
      oauth_verifier: options.oauthVerifier,
      oauth_nonce: USOSOAuthClient.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: USOSOAuthClient.getTimestamp(),
      oauth_version: '1.0',
    };

    const signature = USOSOAuthClient.buildSignature(
      method,
      url,
      oauthParams,
      options.consumerSecret,
      options.requestTokenSecret
    );

    oauthParams.oauth_signature = signature;
    const authHeader = USOSOAuthClient.buildAuthHeader(oauthParams, true);

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: authHeader,
      },
    });

    const responseText = await res.text();

    if (!res.ok) {
      throw new Error(`Błąd autoryzacji Access Token (${res.status}): ${responseText}`);
    }

    const parsed = new URLSearchParams(responseText);
    const oauth_token = parsed.get('oauth_token');
    const oauth_token_secret = parsed.get('oauth_token_secret');

    if (!oauth_token || !oauth_token_secret) {
      throw new Error(`Nieprawidłowa odpowiedź Access Token: ${responseText}`);
    }

    return { oauth_token, oauth_token_secret };
  }

  async signedRequest(options: OAuthRequestParams): Promise<Response> {
    const method = options.method || 'GET';
    const parsedUrl = new URL(options.url, this.baseUrl);

    const queryParams: Record<string, string> = {};

    parsedUrl.searchParams.forEach((val, key) => {
      queryParams[key] = val;
    });

    if (options.params) {
      for (const [k, v] of Object.entries(options.params)) {
        queryParams[k] = String(v);
      }
    }

    const oauthParams: Record<string, string> = {
      oauth_consumer_key: options.consumerKey,
      oauth_nonce: USOSOAuthClient.generateNonce(),
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: USOSOAuthClient.getTimestamp(),
      oauth_version: '1.0',
    };

    if (options.token) {
      oauthParams.oauth_token = options.token;
    }

    const allParams = { ...queryParams, ...oauthParams };
    const signature = USOSOAuthClient.buildSignature(
      method,
      parsedUrl.origin + parsedUrl.pathname,
      allParams,
      options.consumerSecret,
      options.tokenSecret || ''
    );

    oauthParams.oauth_signature = signature;

    const authHeader = USOSOAuthClient.buildAuthHeader(oauthParams, true);

    const query = new URLSearchParams();
    for (const [k, v] of Object.entries(queryParams)) {
      query.append(k, String(v));
    }

    const finalUrl = query.toString()
      ? `${parsedUrl.origin}${parsedUrl.pathname}?${query.toString()}`
      : `${parsedUrl.origin}${parsedUrl.pathname}`;

    return fetch(finalUrl, {
      method,
      headers: {
        Authorization: authHeader,
        Accept: 'application/json',
      },
    });
  }
}
