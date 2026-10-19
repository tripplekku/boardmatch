import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { BoardGame, UserFavorite } from '../types/game';
import { INITIAL_GAMES } from '../data/seedGames';

const GAMES_PATH = 'games';

// Local storage key for fallback/offline favorites
const LOCAL_FAVS_KEY = 'boardmatch_favorites_local';

export async function fetchAllGames(): Promise<BoardGame[]> {
  try {
    const querySnapshot = await getDocs(collection(db, GAMES_PATH));
    if (querySnapshot.empty) {
      console.log('No games found in Firestore. Using seed games.');
      return INITIAL_GAMES;
    }
    const games: BoardGame[] = [];
    querySnapshot.forEach(docSnap => {
      games.push(docSnap.data() as BoardGame);
    });
    return games;
  } catch (error) {
    console.warn('Could not read from Firestore directly, using bundled database:', error);
    // Don't crash the entire UI; fallback to local verified dataset
    return INITIAL_GAMES;
  }
}

export async function seedDatabase(gamesToSeed: BoardGame[] = INITIAL_GAMES): Promise<number> {
  const path = GAMES_PATH;
  try {
    const batch = writeBatch(db);
    let count = 0;
    for (const game of gamesToSeed) {
      const gameRef = doc(db, path, game.id);
      batch.set(gameRef, {
        ...game,
        createdAt: game.createdAt || new Date().toISOString(),
      });
      count++;
    }
    await batch.commit();
    return count;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function addCustomGame(newGame: BoardGame): Promise<void> {
  const path = `${GAMES_PATH}/${newGame.id}`;
  try {
    await setDoc(doc(db, GAMES_PATH, newGame.id), {
      ...newGame,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getUserFavorites(userId?: string): Promise<string[]> {
  if (!userId) {
    // Read from localStorage
    try {
      const raw = localStorage.getItem(LOCAL_FAVS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  const path = `users/${userId}/favorites`;
  try {
    const snapshot = await getDocs(collection(db, path));
    const favIds: string[] = [];
    snapshot.forEach(d => {
      const data = d.data() as UserFavorite;
      favIds.push(data.gameId);
    });
    return favIds;
  } catch (error) {
    console.warn('Could not fetch user favorites from Firestore, falling back to local storage:', error);
    try {
      const raw = localStorage.getItem(LOCAL_FAVS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }
}

export async function toggleFavorite(gameId: string, currentStatus: boolean, userId?: string): Promise<boolean> {
  const newStatus = !currentStatus;

  // Always update local cache for instant UI feedback
  try {
    const raw = localStorage.getItem(LOCAL_FAVS_KEY);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (newStatus) {
      if (!list.includes(gameId)) list.push(gameId);
    } else {
      list = list.filter(id => id !== gameId);
    }
    localStorage.setItem(LOCAL_FAVS_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('LocalStorage write error', e);
  }

  if (!userId) {
    return newStatus;
  }

  const path = `users/${userId}/favorites/${gameId}`;
  try {
    if (newStatus) {
      await setDoc(doc(db, `users/${userId}/favorites`, gameId), {
        gameId,
        userId,
        savedAt: new Date().toISOString(),
      });
    } else {
      await deleteDoc(doc(db, `users/${userId}/favorites`, gameId));
    }
    return newStatus;
  } catch (error) {
    handleFirestoreError(error, newStatus ? OperationType.CREATE : OperationType.DELETE, path);
  }
}
