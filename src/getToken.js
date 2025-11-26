import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};
console.log("API KEY:", process.env.FIREBASE_API_KEY);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

async function main() {
  try {
    const user = await signInWithEmailAndPassword(
      auth,
      "test@test.com",
      "test1234@",
    );
    const token = await user.user.getIdToken();
    console.log("ID Token:", token);
  } catch (error) {
    console.error(error);
  }
}

main();
