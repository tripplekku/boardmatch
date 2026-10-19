/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, testConnection } from './firebase';
import { BoardGame, RecommendationPreferences, RecommendationResult } from './types/game';
import { INITIAL_GAMES } from './data/seedGames';
import { fetchAllGames, getUserFavorites, toggleFavorite } from './services/gamesService';
import { computeRecommendations } from './services/recommendationEngine';
import { Navbar } from './components/Navbar';
import { RecommendationWizard } from './components/RecommendationWizard';
import { RecommendationResults } from './components/RecommendationResults';
import { CatalogView } from './components/CatalogView';
import { FavoritesView } from './components/FavoritesView';
import { QuickRoulette } from './components/QuickRoulette';
import { GameDetailsModal } from './components/GameDetailsModal';
import { DatabaseAdminModal } from './components/DatabaseAdminModal';
import { AddGameModal } from './components/AddGameModal';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [games, setGames] = useState<BoardGame[]>(INITIAL_GAMES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'wizard' | 'results' | 'catalog' | 'favorites' | 'roulette'>('wizard');
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [lastPreferences, setLastPreferences] = useState<RecommendationPreferences | null>(null);
  const [selectedGameForModal, setSelectedGameForModal] = useState<BoardGame | null>(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Initialize Firebase and load initial database records
  useEffect(() => {
    testConnection();

    // Listen to Firebase auth state
    const unsubscribe = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      // Reload favorites for this user
      getUserFavorites(currentUser?.uid).then(favs => setFavorites(favs));
    });

    // Load games from Firestore
    loadGames();

    return () => unsubscribe();
  }, []);

  const loadGames = async () => {
    try {
      const loaded = await fetchAllGames();
      if (loaded && loaded.length > 0) {
        setGames(loaded);
      }
    } catch (err) {
      console.warn('Error loading games from DB, using fallback dataset:', err);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleToggleFavorite = async (gameId: string) => {
    const isCurrentlyFav = favorites.includes(gameId);
    // Optimistic state update
    if (isCurrentlyFav) {
      setFavorites(prev => prev.filter(id => id !== gameId));
    } else {
      setFavorites(prev => [...prev, gameId]);
    }

    try {
      await toggleFavorite(gameId, isCurrentlyFav, user?.uid);
    } catch (err) {
      console.error('Error toggling favorite', err);
      // Revert if error
      if (isCurrentlyFav) {
        setFavorites(prev => [...prev, gameId]);
      } else {
        setFavorites(prev => prev.filter(id => id !== gameId));
      }
    }
  };

  const handleFindRecommendations = (prefs: RecommendationPreferences) => {
    setLastPreferences(prefs);
    const results = computeRecommendations(games, prefs);
    setRecommendations(results);
    setActiveTab('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGameAdded = (newGame: BoardGame) => {
    setGames(prev => [newGame, ...prev]);
    setSelectedGameForModal(newGame);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-400 selection:text-slate-950">
      {/* 3-Zone Navigation Header */}
      <Navbar
        activeTab={activeTab === 'results' ? 'wizard' : activeTab}
        setActiveTab={tab => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        favoritesCount={favorites.length}
        user={user}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        gamesCount={games.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'wizard' && (
          <RecommendationWizard
            games={games}
            onFindRecommendations={handleFindRecommendations}
          />
        )}

        {activeTab === 'results' && lastPreferences && (
          <RecommendationResults
            results={recommendations}
            preferences={lastPreferences}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={setSelectedGameForModal}
            onBackToWizard={() => setActiveTab('wizard')}
          />
        )}

        {activeTab === 'catalog' && (
          <CatalogView
            games={games}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={setSelectedGameForModal}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        )}

        {activeTab === 'favorites' && (
          <FavoritesView
            favorites={favorites}
            allGames={games}
            onToggleFavorite={handleToggleFavorite}
            onOpenDetails={setSelectedGameForModal}
            onNavigateToWizard={() => setActiveTab('wizard')}
            onNavigateToCatalog={() => setActiveTab('catalog')}
          />
        )}

        {activeTab === 'roulette' && (
          <QuickRoulette
            games={games}
            onOpenDetails={setSelectedGameForModal}
          />
        )}
      </main>

      {/* Game Details Modal */}
      <GameDetailsModal
        game={selectedGameForModal}
        allGames={games}
        isFavorite={selectedGameForModal ? favorites.includes(selectedGameForModal.id) : false}
        onToggleFavorite={handleToggleFavorite}
        onSelectGame={setSelectedGameForModal}
        onClose={() => setSelectedGameForModal(null)}
      />

      {/* Database Management & Seeding Modal */}
      <DatabaseAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        games={games}
        onRefreshGames={loadGames}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      {/* Add Custom Game Modal */}
      <AddGameModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onGameAdded={handleGameAdded}
      />

      {/* Minimal Anti-Slop Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">BoardMatch MVP</span>
            <span aria-hidden="true">·</span>
            <span>Система персональних рекомендацій настільних ігор</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{games.length} ігор у базі</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="hover:text-amber-400 transition-colors"
            >
              Синхронізація Firestore
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
