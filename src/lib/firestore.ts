import { getFirestore } from 'firebase/firestore'
import { firebase } from './firebase'
export const db = firebase.app ? getFirestore(firebase.app) : null
