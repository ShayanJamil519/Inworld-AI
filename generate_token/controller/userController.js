// const { MongoClient } = require("mongodb");
// var passport = require("passport");
// var GoogleStrategy = require("passport-google-oidc");

// const url = process.env.mongoUri;

// googleCallback: function verify(issuer, profile, cb) {
//   MongoClient.connect(url, function (err, client) {
//     if (err) {
//       return cb(err);
//     }

//     const db = client.db("mydatabase");

//     db.collection("federated_credentials").findOne(
//       {
//         provider: issuer,
//         subject: profile.id,
//       },
//       function (err, row) {
//         if (err) {
//           return cb(err);
//         }
//         if (!row) {
//           db.collection("users").insertOne(
//             {
//               name: profile.displayName,
//             },
//             function (err, result) {
//               if (err) {
//                 return cb(err);
//               }

//               const id = result.insertedId;
//               db.collection("federated_credentials").insertOne(
//                 {
//                   user_id: id,
//                   provider: issuer,
//                   subject: profile.id,
//                 },
//                 function (err) {
//                   if (err) {
//                     return cb(err);
//                   }
//                   const user = {
//                     id: id,
//                     name: profile.displayName,
//                   };
//                   client.close();
//                   return cb(null, user);
//                 }
//               );
//             }
//           );
//         } else {
//           db.collection("users").findOne(
//             {
//               _id: row.user_id,
//             },
//             function (err, row) {
//               if (err) {
//                 return cb(err);
//               }
//               if (!row) {
//                 return cb(null, false);
//               }
//               client.close();
//               return cb(null, row);
//             }
//           );
//         }
//       }
//     );
//   });
// }

// module.exports = {
//   googleCallback,
// };
