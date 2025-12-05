const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";
const LOGIN_PATH = process.env.NEXT_PUBLIC_API_LOGIN_PATH || "/api/v1/login";
const REGISTER_PATH = process.env.NEXT_PUBLIC_API_REGISTER_PATH || "/api/v1/register";
const ME_PATH = process.env.NEXT_PUBLIC_API_ME_PATH || "/api/v1/me";

function headerToObj(headers: Headers): Record<string, string> {
  const obj: Record<string, string> = {};
  headers.forEach((v, k) => (obj[k.toLowerCase()] = v));
  return obj;
}

function extractTokenFromJson(json: any): string | null {
  if (!json) return null;
  // common places
  const candidates = ["token", "auth_token", "jwt", "access_token", "accessToken"];
  for (const c of candidates) {
    if (typeof json[c] === "string" && json[c].length > 0) return json[c];
  }
  // nested shapes like { data: { token: ... } }
  if (json.data && typeof json.data === "object") {
    for (const c of candidates) {
      if (typeof json.data[c] === "string" && json.data[c].length > 0) return json.data[c];
    }
  }
  return null;
}

function extractUserFromJson(json: any): any | null {
  if (!json) return null;
  if (json.user) return json.user;
  if (json.data && json.data.user) return json.data.user;
  // Devise Token Auth returns the user in 'data' or top-level attributes
  if (json.email || json.id) return json;
  return null;
}

async function requestJson(path: string, body: any) {
  const url = `${API_BASE}${path}`;
  console.log('🔵 API Request:', { url, body });
  
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  console.log('🔵 API Response status:', res.status);

  const text = await res.text();
  console.log('🔵 API Response text:', text.substring(0, 500)); // Limitar a 500 caracteres
  
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
    console.log('🔵 API Response JSON:', json);
  } catch (e) {
    console.error('🔵 Failed to parse JSON response:', e);
    json = null;
  }

  const headers = headerToObj(res.headers);
  console.log('🔵 API Response headers:', headers);

  if (!res.ok) {
    // try to surface a helpful message
    const msg = (json && (json.error || json.message || json.errors)) || text || res.statusText;
    console.error('🔵 API Error:', msg);
    console.error('🔵 Full error response:', { status: res.status, json, text: text.substring(0, 200) });
    const error = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    (error as any).status = res.status;
    throw error;
  }

  const token = extractTokenFromJson(json) || headers["authorization"] || headers["access-token"] || null;
  const user = extractUserFromJson(json);

  console.log('🔵 API Success:', { token: token ? 'present' : 'none', user });

  return { token, user, raw: json, rawHeaders: headers };
}

export async function login(email: string, password: string) {
  console.log('🔵 Login request:', { email });
  const result = await requestJson(LOGIN_PATH, { user: { email, password } });
  console.log('🔵 Login response:', result);
  return result;
}

export async function register(name: string, email: string, password: string, passwordConfirmation: string, language: string = "es") {
  return requestJson(REGISTER_PATH, { 
    user: { 
      name, 
      email, 
      password, 
      password_confirmation: passwordConfirmation,
      language 
    } 
  });
}

export async function fetchMe(): Promise<any> {
  const url = `${API_BASE}${ME_PATH}`;
  console.log('🔵 Fetching /me from:', url);
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  console.log('🔵 /me response:', { status: res.status, ok: res.ok });

  if (!res.ok) {
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  console.log('🔵 /me data:', data);
  return data;
}

export async function logout(): Promise<void> {
  const url = `${API_BASE}/api/v1/logout`;
  await fetch(url, {
    method: "DELETE",
    credentials: "include",
  });
}

export async function loginWithGoogle(credential: string) {
  console.log('🔵 Google OAuth login request with credential');
  const result = await requestJson('/api/v1/auth/google', { credential });
  console.log('🔵 Google OAuth login response:', result);
  return result;
}

export async function loginWithFacebook(token: string) {
  console.log('🔵 Facebook OAuth login request');
  const result = await requestJson('/api/v1/auth/facebook', { token });
  console.log('🔵 Facebook OAuth login response:', result);
  return result;
}

export default { login, register, fetchMe, logout, loginWithGoogle, loginWithFacebook };
