import admin from "firebase-admin";
import fs from "fs";

// ✅ Correct path to service account JSON file
const serviceAccount = JSON.parse(fs.readFileSync("./firebaseServiceAccountKey.json", "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function deleteAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map((user) => user.uid);

    if (users.length === 0) {
      console.log("✅ No users found in Firebase.");
      return;
    }

    await admin.auth().deleteUsers(users);
    console.log(`🔥 Deleted ${users.length} users from Firebase.`);
  } catch (error) {
    console.error("❌ Error deleting users:", error);
  }
}

deleteAllUsers();
