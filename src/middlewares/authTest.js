import { initializeApp } from "firebase/app";
import dotenv from "dotenv";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

dotenv.config();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export async function getIdToken() {
  const user = await signInWithEmailAndPassword(
    auth,
    "test@test.com",
    "test1234@",
  );
  console.log(user.user.getIdToken());

  return;
}
