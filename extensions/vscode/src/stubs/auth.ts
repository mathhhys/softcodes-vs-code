import * as vscode from "vscode";
import * as firebase from "firebase/app";
import "firebase/auth";
import "firebase/firestore";


const firebaseConfig = {
  // Add your Firebase configuration here
};

firebase.initializeApp(firebaseConfig);

export async function getUserToken(): Promise<string> {
  // Prefer manual user token first
  const settings = vscode.workspace.getConfiguration("softcodes");
  const userToken = settings.get<string | null>("userToken", null);
  if (userToken) {
    return userToken;
  }

  const session = await vscode.authentication.getSession("github", [], {
    createIfNone: true,
  });
  return session.accessToken;
}
