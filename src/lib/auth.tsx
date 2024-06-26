import Elysia from "elysia";
import { lucia } from "$lib/lucia";
import { verifyRequestOrigin, type User, type Session } from "lucia";

// Create middleware that provides user and session
export const auth = new Elysia().derive({ as: "global" }, 
  async (context): Promise<{
	user: User | null;
	session: Session | null;
  }> => {
	// CSRF check
	if (context.request.method !== "GET") {
	  const hostHeader = context.request.headers.get("Host");
	  const originHeader = context.request.headers.get("Origin");
	  if (!originHeader || !hostHeader || !verifyRequestOrigin(originHeader, [hostHeader])) {
		return {
		  user: null,
		  session: null
		};
	  }
	}

	// Use headers instead of Cookie API to prevent type coercion
	const cookieHeader = context.request.headers.get("Cookie") ?? "";
	const sessionId = lucia.readSessionCookie(cookieHeader);
	if (!sessionId) {
	  return {
		user: null,
		session: null
	  };
	}

    // Validate sessionId from cookie
	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
	  const sessionCookie = lucia.createSessionCookie(session.id);
	  context.cookie[sessionCookie.name].set({
		value: sessionCookie.value,
		...sessionCookie.attributes
	  });
	}
	if (!session) {
	  const sessionCookie = lucia.createBlankSessionCookie();
	  context.cookie[sessionCookie.name].set({
		value: sessionCookie.value,
		...sessionCookie.attributes
	  });
	}
	return {
	  user,
	  session
	};
  }
);
