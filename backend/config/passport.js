import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import crypto from 'crypto';
import User from '../models/userModel.js';

const configurePassport = () => {
  // If Google OAuth credentials are not provided, skip configuring the strategy.
  // This allows the server to run in development without OAuth setup.
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.warn(
      'Google OAuth client ID/secret not set. Skipping GoogleStrategy configuration.'
    );
  } else {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL: 'http://localhost:5000/api/users/auth/google/callback',
          scope: ['profile', 'email'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), null);
            }

            // First, check if user exists by googleId
            let user = await User.findOne({ googleId: profile.id });

            if (user) {
              // Existing user with Google ID - update profile image if needed
              if (!user.profileImage && profile.photos?.[0]?.value) {
                user.profileImage = profile.photos[0].value;
                await user.save();
              }
              return done(null, user);
            }

            // Check if user exists by email
            user = await User.findOne({ email });

            if (user) {
              // User exists with same email but not linked to Google
              // Check if this is a regular account (has password not from OAuth)
              const isOAuthGeneratedPassword = user.password && user.password.length <= 20;

              if (!user.googleId) {
                // Link existing account to Google
                user.googleId = profile.id;

                // Update profile data if missing
                if (!user.name && profile.displayName) {
                  user.name = profile.displayName;
                }
                if (!user.username && profile.displayName) {
                  user.username = profile.displayName.replace(/\s+/g, '').toLowerCase();
                }
                if (!user.profileImage && profile.photos?.[0]?.value) {
                  user.profileImage = profile.photos[0].value;
                }

                await user.save();
                return done(null, user);
              }
            }

            // Create new user
            const username = profile.displayName?.replace(/\s+/g, '').toLowerCase() ||
                            email.split('@')[0];

            const newUser = await User.create({
              googleId: profile.id,
              name: profile.displayName || email.split('@')[0],
              username: username,
              email: email,
              profileImage: profile.photos?.[0]?.value || null,
              role: 'Resident',
              // Generate a secure random password for OAuth users
              password: crypto.randomBytes(32).toString('hex'),
              isAdmin: false,
              // Initialize empty fields
              address: '',
              contact: '',
              area: null,
            });

            return done(null, newUser);
          } catch (error) {
            console.error('Google OAuth error:', error);
            return done(error, null);
          }
        }
      )
    );
  }

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default configurePassport;