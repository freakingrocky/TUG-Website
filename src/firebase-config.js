import { initializeApp } from "firebase/app";
import { getFirestore } from '@firebase/firestore'

const firebaseConfig = {
    apiKey: "AIzaSyC3zV0zpruf59FmKpbJzen2gJGAhLz5so8",
    authDomain: "amsahk-demo.firebaseapp.com",
    projectId: "amsahk-demo",
    storageBucket: "amsahk-demo.appspot.com",
    messagingSenderId: "302986860006",
    appId: "1:302986860006:web:bb543a96770dc52f883227",
    measurementId: "G-C6K3MDX0WH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
