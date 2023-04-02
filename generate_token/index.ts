import "dotenv/config";
import { InworldClient } from "@inworld/nodejs-sdk";
import cors from "cors";
import express from "express";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import paymentRoutes, { use } from "./routes/paymentRoutes";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/userModel");
const session = require("express-session");

const app = express();
const PORT = 4000;

if (!process.env.INWORLD_KEY) {
  throw new Error("INWORLD_KEY env variable is required");
}

if (!process.env.INWORLD_SECRET) {
  throw new Error("INWORLD_SECRET env variable is required");
}

// Set up passport middleware
app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

const client = new InworldClient().setApiKey({
  key: process.env.INWORLD_KEY!,
  secret: process.env.INWORLD_SECRET!,
});

app.use(cors());
app.use("/payment", paymentRoutes);

app.get("/", async (_, res) => {
  const token = await client.generateSessionToken();
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(token));
});

const connectDB = async () => {
  console.log(process.env.mongoUri);
  try {
    const conn = await mongoose.connect(process.env.mongoUri!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDB();

// passport.js Google Authentication
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      // Check if user already exists in our database
      const user = await User.findOne({ googleId: profile.id }).exec();
      if (user) {
        done(null, user);
      } else {
        // Create new user
        const newUser = new User({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails[0].value,
        });
        await newUser.save();
        done(null, newUser);
      }
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});

// Set up Google auth route
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Set up Google auth callback route
app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("http://localhost:3000/chat");
  }
);

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
