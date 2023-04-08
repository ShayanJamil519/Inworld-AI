import "dotenv/config";
import { InworldClient } from "@inworld/nodejs-sdk";
import cors from "cors";
import express, { Request } from "express";
import bodyParser from "body-parser";
import mongoose, { ConnectOptions } from "mongoose";
import paymentRoutes, { use } from "./routes/paymentRoutes";
const cloudinary = require("cloudinary");



const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
var TwitterStrategy = require('passport-twitter');

const User = require("./model/userModel");
import session from "express-session";
import MongoStore from "connect-mongo";
const cookieSession = require("cookie-session");
const rateLimit = require("express-rate-limit");

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
      mongoUrl: process.env.mongoUri!,
    }),
    resave: false,
    saveUninitialized: false,
  })
);

cloudinary.config({
  cloud_name: process.env.cloudinaryCloudName,
  api_key: process.env.APIKey,
  api_secret: process.env.APISecret,
});

/*app.use(cookieSession({
  name: 'google-auth-session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))*/

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json());

app.use(express.json());

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
  message: "gi",
});

const user = require("./routes/userRoutes");
app.use("/api/user", freeLimiter, user);

const img = require("./routes/imgRoutes");
app.use("/api/img", img);



const standardLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 6,
  standardHeaders: true,
  legacyHeaders: false,
});

const standardUser = require("./routes/standardUserRoutes");
app.use("/api/standarduser", standardLimiter, standardUser);

const PremiumLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 7,
  standardHeaders: true,
  legacyHeaders: false,
});

const premiumUser = require("./routes/premiumUserRoutes");
app.use("/api/premiumuser", PremiumLimiter, premiumUser);

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

// passport.js Twitter Authentication
passport.use(new TwitterStrategy({
  consumerKey: process.env.TWITTER_API_KEY,
  consumerSecret: process.env.TWITTER_API_SECRET,
  callbackURL: '/auth/twitter/callback'
},
function(token, tokenSecret, profile, done) {
  User.findOne({ 'googleId': profile.id }, function (err, user) {
    if (err) { return done(err); }
    if (!user) {
      user = new User({
        googleId : profile.id,
        name: profile.displayName,
        email: profile.email,

      });
      user.save(function (err) {
        if (err) console.log(err);
        return done(err, user);
      });
    } else {
      return done(err, user);
    }
  });
}
));

// passport.js FaceBook Authentication
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_APP_ID,
  clientSecret: process.env.FACEBOOK_APP_SECRET,
  callbackURL: "/auth/facebook/callback",
  profileFields: ['id', 'displayName', 'email']
},
/*function(accessToken, refreshToken, profile, cb) {
  User.findOrCreate({ facebookId: profile.id }, function (err, user) {
    return cb(err, user);
  });
}*/
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
      email: profile.email,
    });
    await newUser.save();
    done(null, newUser);
  }
}
)
);

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


// Set up Twitter auth route
app.get('/login/twitter', passport.authenticate('twitter'));
app.get('/oauth/callback/twitter',
  passport.authenticate('twitter', { failureRedirect: '/login', failureMessage: true }),
  function(req, res) {
    var email = req.user?.email;
    res.redirect("http://localhost:3000/chat?email=" + email);
  });

// Set up Fb auth route
app.get('/auth/facebook',
  passport.authenticate('facebook'));

app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    var email = req.user?.email;
    res.redirect("http://localhost:3000/chat?email=" + email);
  });

app.listen(PORT, () => {
  console.log(`Listening to port ${PORT}`);
});
