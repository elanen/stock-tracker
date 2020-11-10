import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/analytics';
import 'firebase/functions';

let config = {
	apiKey: "AIzaSyADrnCel6bqs5UTWHTnfo7l6YcX2uxq9FM",
    authDomain: "stock-tracker-8f0ab.firebaseapp.com",
    databaseURL: "https://stock-tracker-8f0ab.firebaseio.com",
    projectId: "stock-tracker-8f0ab",
    storageBucket: "stock-tracker-8f0ab.appspot.com",
    messagingSenderId: "232618417366",
    appId: "1:232618417366:web:29a1d2816e777e5dd5bd77",
    measurementId: "G-R9TQBGE8QN"
};
firebase.initializeApp(config);
firebase.analytics();

export default firebase;
