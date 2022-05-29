import React, { useRef, useState } from "react";
import "./App.css";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
    apiKey: "AIzaSyCw4IF8PE2eK0n6H0qpo6rPnIAPlb0VIAQ",
    authDomain: "live-chat-app-96847.firebaseapp.com",
    projectId: "live-chat-app-96847",
    storageBucket: "live-chat-app-96847.appspot.com",
    messagingSenderId: "396118114500",
    appId: "1:396118114500:web:e1b3d27b5242d27bc58991",
    measurementId: "G-Z0Q50EJZLN",
});

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {
    const [user] = useAuthState(auth);
    return (
        <div className="App">
            <header>
                <SignOut />
            </header>
            <section>{user ? <ChatRoom /> : <SignIn />}</section>
        </div>
    );
}

function SignIn() {
    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider);
    };

    return <button onClick={signInWithGoogle}>Sign in with Google</button>;
}

function SignOut() {
    return (
        auth.currentUser && (
            <button className="sign-out" onClick={() => auth.signOut()}>
                Sign Out
            </button>
        )
    );
}

function ChatRoom() {
    const messagesRef = firestore.collection("messages");
    const query = messagesRef.orderBy("createdAt").limit(25);
    const [messages] = useCollectionData(query, { idField: "id" });
    const [formValue, setFormValue] = useState("");
    const dummy = useRef();

    const sendMessage = async (e) => {
        e.preventDefault();
        const { uid, photoURL } = auth.currentUser;
        await messagesRef.add({
            text: formValue,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
        });
        setFormValue("");

        dummy.current.scrollIntoView({ behavior: "smooth" });
    };

    return (
        <div>
            <div>
                {messages &&
                    messages.map((msg) => (
                        <ChatMessage key={msg.id} message={msg} />
                    ))}
            </div>
            <div ref={dummy}></div>

            <form onSubmit={sendMessage}>
                <input
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>
        </div>
    );
}

function ChatMessage(props) {
    const { text, uid, photoURL } = props.message;
    const messageClass = uid === auth.currentUser.uid ? "sent" : "received";

    return (
        <div className={`message ${messageClass}`}>
            <img
                src={
                    photoURL ||
                    "https://tr.wikipedia.org/wiki/Dosya:User-avatar.svg"
                }
                alt="avatar"
            />
            <p>{text}</p>
        </div>
    );
}

export default App;
