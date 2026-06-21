
import { Strategy as GoogleStrategy } from "passport-google-oauth20"; 

const CALLBACK_BASE = process.env.BACKEND_URL_AUTH ?? "http://localhost:5000";

export default function initPassport(passport) {
 
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${CALLBACK_BASE}/auth/social/google/callback`,
      },
      (_accessToken, _refreshToken, profile, done) => { 
        done(null, {
          id: profile.id,
          email: profile.emails?.[0]?.value ?? null,
          firstName: profile.name?.givenName ?? profile.displayName,
          lastName: profile.name?.familyName ?? "",
          avatar: profile.photos?.[0]?.value ?? null,
          provider: "google",
        });
      }
    )
  );

 
}
