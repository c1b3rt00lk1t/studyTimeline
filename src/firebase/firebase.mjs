import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, child, get } from "firebase/database";
import { firebaseConfig } from "./firebaseEnv.mjs";
import { getAnalytics } from "firebase/analytics";

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Real-time database

const database = getDatabase(app);

const connectedRef = ref(database, ".info/connected");
export const checkConnectionFromDB = (handleConnected) => {
  onValue(connectedRef, async (snap) => {
    if (snap.val() === true) {
      console.log("connected");
      await handleConnected();
    } else {
      console.log("not connected");
    }
  });
};

const dbRef = ref(database);

const getDataFromDB = (mark, hasLanguage, path) => (handleDataFromDB) =>
  get(child(dbRef, path))
    .then((snapshot) => {
      if (snapshot.exists()) {
        handleDataFromDB(mark, hasLanguage, snapshot.val());
        return snapshot.val();
      } else {
        console.log("No data available");
      }
    })
    .catch((error) => {
      console.error(error);
    });

export const getDataFromDBLines = getDataFromDB("lines", true, `/lines/lines`);
export const getDataFromDBLanguages = getDataFromDB(
  "languages",
  false,
  `/languages/languages`
);
export const getDataFromDBBasics = getDataFromDB(
  "basics",
  true,
  `/languages/basics`
);
export const getDataFromDBInitialLanguage = getDataFromDB(
  "initialLanguage",
  false,
  `/languages/initialLanguage`
);

export const getDataFromDBInitialLine = getDataFromDB(
  "initialLine",
  false,
  `/lines/initialLine`
);
export const getDataFromDBModals = getDataFromDB(
  "modals",
  true,
  `/modals/modals`
);
export const getDataFromDBYears = getDataFromDB("years", true, `/years`);
export const getDataFromDBVersion = getDataFromDB("version", false, `/version`);
