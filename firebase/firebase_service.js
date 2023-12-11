//firebase-service.js

const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set, get, child } = require('firebase/database');

const firebaseConfig = {
    apiKey: "AIzaSyAAglWoWlYVSZIWQ0qo0TryOUuKMjkQ3Pw",
    authDomain: "waterleaknotify.firebaseapp.com",
    projectId: "waterleaknotify",
    storageBucket: "waterleaknotify.appspot.com",
    messagingSenderId: "929272686688",
    appId: "1:929272686688:web:4290c938ccf5df2d5f7b05",
    measurementId: "G-533CD2MYE0"
};

const fireserver = initializeApp(firebaseConfig);
const db = getDatabase();
const dbRef = ref(db);

const saveToken = async(userId, token) => {
    const values = (await get(child(dbRef, `userTokens/${userId}/`))).val() ?? {};
    const payload = {...values, token};
    set(ref(db, `userTokens/${userId}/`), payload);
}

const getToken = async (userId) => {
    const values = (await get(child(dbRef, `userTokens/${userId}`))).val();
    return values ?? {};
}

module.exports = {
    fireserver,
    saveToken,
    getToken
}