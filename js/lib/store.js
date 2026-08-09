
import { db } from "../config/firebase.js";
import {
  collection, doc, onSnapshot, addDoc, updateDoc, deleteDoc,
  getDoc, setDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

export function watchCourses(callback,errorCallback){
  return onSnapshot(collection(db,"courses"),snap=>{
    const data=snap.docs.map(d=>({id:d.id,...d.data()}));
    data.sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999) || (a.title||"").localeCompare(b.title||""));
    callback(data);
  },errorCallback);
}

export function watchCategories(callback,errorCallback){
  return onSnapshot(collection(db,"categories"),snap=>{
    const data=snap.docs.map(d=>({id:d.id,...d.data()}));
    data.sort((a,b)=>(Number(a.order)||9999)-(Number(b.order)||9999) || (a.name||"").localeCompare(b.name||""));
    callback(data);
  },errorCallback);
}

export function watchSettings(callback,errorCallback){
  return onSnapshot(doc(db,"siteSettings","main"),snap=>{
    callback(snap.exists()?snap.data():{});
  },errorCallback);
}

export async function saveCourse(id,payload){
  const data={...payload,updatedAt:serverTimestamp()};
  if(id){
    await updateDoc(doc(db,"courses",id),data);
    return id;
  }
  data.createdAt=serverTimestamp();
  return (await addDoc(collection(db,"courses"),data)).id;
}

export async function removeCourse(id){
  await deleteDoc(doc(db,"courses",id));
}

export async function saveCategory(id,payload){
  const data={...payload,updatedAt:serverTimestamp()};
  if(id){
    await updateDoc(doc(db,"categories",id),data);
    return id;
  }
  data.createdAt=serverTimestamp();
  return (await addDoc(collection(db,"categories"),data)).id;
}

export async function removeCategory(id){
  await deleteDoc(doc(db,"categories",id));
}

export async function saveSettings(payload){
  await setDoc(doc(db,"siteSettings","main"),{...payload,updatedAt:serverTimestamp()},{merge:true});
}


export function watchMedia(id,callback,errorCallback){
  return onSnapshot(doc(db,"media",id),snap=>{
    callback(snap.exists()?snap.data():{});
  },errorCallback);
}

export async function saveMedia(id,payload){
  await setDoc(doc(db,"media",id),{...payload,updatedAt:serverTimestamp()},{merge:true});
}

export async function clearMedia(id){
  await setDoc(doc(db,"media",id),{dataUrl:"",updatedAt:serverTimestamp()},{merge:true});
}
