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
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let json: any = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = null;
  }

  const headers = headerToObj(res.headers);

  if (!res.ok) {
    // try to surface a helpful message
    const msg = (json && (json.error || json.message || json.errors)) || text || res.statusText;
    const error = new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
    (error as any).status = res.status;
    throw error;
  }

  const token = extractTokenFromJson(json) || headers["authorization"] || headers["access-token"] || null;
  const user = extractUserFromJson(json);

  return { token, user, raw: json, rawHeaders: headers };
}

export async function login(email: string, password: string) {
  console.log('🔵 Login request:', { email });
  const result = await requestJson(LOGIN_PATH, { user: { email, password } });
  console.log('🔵 Login response:', result);
  return result;
}

export async function register(name: string, email: string, password: string) {
  return requestJson(REGISTER_PATH, { user: { name, email, password } });
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

export default { login, register, fetchMe, logout };
