import { auth, verifyToken } from "@clerk/nextjs/server";

export type RequestUser =
  | {
      isAuthenticated: true;
      userId: string;
    }
  | {
      isAuthenticated: false;
      userId: null;
    };

function readBearerToken(request?: Request) {
  if (!request) {
    return null;
  }

  const header = request.headers.get("authorization");

  if (!header?.startsWith("Bearer ")) {
    return null;
  }

  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function getRequestUser(request?: Request): Promise<RequestUser> {
  const cookieAuth = await auth();

  if (cookieAuth.isAuthenticated && cookieAuth.userId) {
    return {
      isAuthenticated: true,
      userId: cookieAuth.userId
    };
  }

  const token = readBearerToken(request);

  if (!token) {
    return {
      isAuthenticated: false,
      userId: null
    };
  }

  const secretKey = process.env.CLERK_SECRET_KEY?.trim();

  if (!secretKey) {
    return {
      isAuthenticated: false,
      userId: null
    };
  }

  try {
    const payload = await verifyToken(token, { secretKey });
    const userId = payload?.sub;

    if (!userId) {
      return {
        isAuthenticated: false,
        userId: null
      };
    }

    return {
      isAuthenticated: true,
      userId
    };
  } catch {
    return {
      isAuthenticated: false,
      userId: null
    };
  }
}
