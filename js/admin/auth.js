
import { auth, ADMIN_EMAIL } from "../config/firebase.js";
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

export async function login(email,password){
  const cred=await signInWithEmailAndPassword(auth,email,password);
  if((cred.user.email||"").toLowerCase()!==ADMIN_EMAIL.toLowerCase()){
    await signOut(auth);
    throw new Error("This account is not authorized.");
  }
  return cred.user;
}
export function logout(){ return signOut(auth); }
export function watchAdmin(callback){
  return onAuthStateChanged(auth,async user=>{
    if(!user){callback(null);return;}
    if((user.email||"").toLowerCase()!==ADMIN_EMAIL.toLowerCase()){
      await signOut(auth);callback(null);return;
    }
    callback(user);
  });
}
