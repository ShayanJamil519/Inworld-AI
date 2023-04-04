import "dotenv/config";
import { InworldClient } from "@inworld/nodejs-sdk";
import cors from "cors";
import express , {Request} from "express";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import paymentRoutes, { use } from "./routes/paymentRoutes";

const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("./model/userModel");
import session from 'express-session'
import MongoStore from 'connect-mongo'
const cookieSession = require('cookie-session');
const rateLimit = require('express-rate-limit')

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
    store: MongoStore.create({
      mongoUrl: process.env.mongoUri!
    }),
    resave: false,
    saveUninitialized: false,
  })
);

/*app.use(cookieSession({
  name: 'google-auth-session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))*/

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

const client = new InworldClient().setApiKey({
  key: process.env.INWORLD_KEY!,
  secret: process.env.INWORLD_SECRET!,
});

app.use(cors());
app.use("/payment", paymentRoutes);

const freeLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	max: 2, 
	standardHeaders: true,
	legacyHeaders: false, 
  message:"gi"
})

const user = require("./routes/userRoutes");
app.use("/api/user",freeLimiter, user);


const standardLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	max: 6, 
	standardHeaders: true,
	legacyHeaders: false, 

  
})

const standardUser = require("./routes/standardUserRoutes");
app.use("/api/standarduser",standardLimiter, standardUser);

const PremiumLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, 
	max: 7, 
	standardHeaders: true,
	legacyHeaders: false, 
})

const premiumUser = require("./routes/premiumUserRoutes");
app.use("/api/premiumuser",PremiumLimiter, premiumUser);

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
  done(null, user);
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
    var email = req.user?.email;
    res.redirect("http://localhost:3000/chat?email=" + email);
  }
);



app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
