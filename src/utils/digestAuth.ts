import crypto from "crypto";

/* =========================================================
   DIGEST AUTH HELPER
   Basic auth works via `user:pass@host` embedded in the URL,
   but Digest requires a real challenge/response handshake:
   1. Request without credentials → camera replies 401 with a
      WWW-Authenticate header containing a nonce/realm.
   2. Compute a response hash from that nonce + credentials.
   3. Retry with an Authorization: Digest header.
   Handles the two variants IP cameras actually use in the
   wild: qop="auth" (vs. "auth-int", which isn't supported —
   see note below) and algorithm=MD5 or MD5-sess.
========================================================= */

const md5 = (input: string) => crypto.createHash("md5").update(input).digest("hex");

function parseDigestChallenge(header: string) {
  const params: Record<string, string> = {};
  const regex = /(\w+)=(?:"([^"]*)"|([^\s,]+))/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(header)) !== null) {
    params[match[1]] = match[2] ?? match[3];
  }
  return params;
}

export async function fetchWithDigestAuth(
  url: string,
  username: string,
  password: string,
  signal: AbortSignal
) {
  const method = "GET";

  const initial = await fetch(url, { method, signal });

  if (initial.status !== 401) {
    // Either it worked with no auth, or failed for an unrelated reason —
    // either way there's no digest challenge to respond to.
    return initial;
  }

  const challenge = initial.headers.get("www-authenticate");
  if (!challenge || !challenge.toLowerCase().startsWith("digest")) {
    return initial;
  }

  const { realm, nonce, qop: qopOptions, opaque, algorithm } =
    parseDigestChallenge(challenge);

  // qop-options can be a comma-separated list (e.g. "auth,auth-int").
  // We only implement "auth" — pick it out specifically rather than
  // echoing the raw list back, which would produce a malformed header.
  // If the server only offers auth-int, we fall back to no qop; most
  // camera firmware accepts that, but a server that strictly requires
  // auth-int will reject this and the camera will correctly report
  // as unreachable via this method.
  const qop = qopOptions?.split(",").map((s) => s.trim()).includes("auth")
    ? "auth"
    : undefined;

  const { pathname, search } = new URL(url);
  const uri = `${pathname}${search}`;
  const nc = "00000001";
  const cnonce = crypto.randomBytes(8).toString("hex");

  const baseHa1 = md5(`${username}:${realm}:${password}`);
  const isSess = algorithm?.toLowerCase() === "md5-sess";
  const ha1 = isSess ? md5(`${baseHa1}:${nonce}:${cnonce}`) : baseHa1;

  const ha2 = md5(`${method}:${uri}`);
  const response = qop
    ? md5(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    : md5(`${ha1}:${nonce}:${ha2}`);

  const authHeader =
    `Digest username="${username}", realm="${realm}", nonce="${nonce}", uri="${uri}", ` +
    `response="${response}"` +
    (qop ? `, qop=${qop}, nc=${nc}, cnonce="${cnonce}"` : "") +
    (opaque ? `, opaque="${opaque}"` : "") +
    (algorithm ? `, algorithm=${algorithm}` : "");

  return fetch(url, {
    method,
    headers: { Authorization: authHeader },
    signal,
  });
}