import { BoardGame, RecommendationPreferences, RecommendationResult, MatchReason } from '../types/game';

export function computeRecommendations(
  games: BoardGame[],
  prefs: RecommendationPreferences
): RecommendationResult[] {
  const results: RecommendationResult[] = [];

  for (const game of games) {
    let score = 0;
    const reasons: MatchReason[] = [];

    // 1. Player Count Evaluation (Max ~45 pts)
    const canPlay = prefs.playerCount >= game.minPlayers && prefs.playerCount <= game.maxPlayers;
    const isBest = game.bestPlayers.includes(String(prefs.playerCount)) ||
      (prefs.playerCount >= 3 && prefs.playerCount <= 4 && game.bestPlayers.includes('3-4')) ||
      (prefs.playerCount >= 4 && prefs.playerCount <= 5 && game.bestPlayers.includes('4-5')) ||
      (prefs.playerCount >= 5 && prefs.playerCount <= 6 && game.bestPlayers.includes('5-6')) ||
      (prefs.playerCount >= 7 && prefs.playerCount <= 8 && game.bestPlayers.includes('7-8'));

    if (canPlay) {
      if (isBest) {
        score += 45;
        reasons.push({
          type: 'player',
          label: `Ідеально для ${prefs.playerCount} гравців (визнано найкращим складом)`,
          positive: true,
        });
      } else {
        score += 35;
        reasons.push({
          type: 'player',
          label: `Підтримує гру на ${prefs.playerCount} осіб (діапазон: ${game.minPlayers}–${game.maxPlayers})`,
          positive: true,
        });
      }
    } else {
      // Game cannot be played with this count
      if (prefs.exactPlayerCount) {
        // Skip entirely if exact count required
        continue;
      } else {
        score -= 40;
        reasons.push({
          type: 'player',
          label: `Не підходить для ${prefs.playerCount} гравців (потрібно від ${game.minPlayers} до ${game.maxPlayers})`,
          positive: false,
        });
      }
    }

    // 2. Playtime Evaluation (Max ~20 pts)
    const avgTime = (game.minPlaytime + game.maxPlaytime) / 2;
    if (prefs.playtimePreference === 'quick') {
      if (game.maxPlaytime <= 30) {
        score += 20;
        reasons.push({
          type: 'time',
          label: `Швидка партія (${game.minPlaytime}–${game.maxPlaytime} хв), вкладається у 30 хв`,
          positive: true,
        });
      } else if (game.minPlaytime <= 30) {
        score += 12;
      }
    } else if (prefs.playtimePreference === 'medium') {
      if (avgTime >= 30 && avgTime <= 65) {
        score += 20;
        reasons.push({
          type: 'time',
          label: `Комфортна тривалість (${game.minPlaytime}–${game.maxPlaytime} хв) на один вечір`,
          positive: true,
        });
      } else if (avgTime < 30 || avgTime <= 80) {
        score += 10;
      }
    } else if (prefs.playtimePreference === 'long') {
      if (avgTime >= 60 && avgTime <= 120) {
        score += 20;
        reasons.push({
          type: 'time',
          label: `Глибока насичена партія на 1–2 години (${game.minPlaytime}–${game.maxPlaytime} хв)`,
          positive: true,
        });
      } else if (avgTime >= 45) {
        score += 10;
      }
    } else if (prefs.playtimePreference === 'epic') {
      if (game.maxPlaytime >= 100) {
        score += 20;
        reasons.push({
          type: 'time',
          label: `Епічна масштабна сесія (${game.minPlaytime}–${game.maxPlaytime} хв)`,
          positive: true,
        });
      }
    } else {
      score += 15;
    }

    // 3. Category / Genre Preferences (Max ~20 pts)
    if (prefs.categories.length > 0) {
      if (prefs.categories.includes(game.category)) {
        score += 20;
        const categoryMap: Record<string, string> = {
          strategy: 'Стратегія',
          party: 'Для вечірок',
          cooperative: 'Кооперативна',
          family: 'Сімейна',
          thematic: 'Пригоди та Тематична',
          abstract: 'Абстрактна',
          deckbuilding: 'Колодобудування',
        };
        reasons.push({
          type: 'genre',
          label: `Вподобаний жанр: ${categoryMap[game.category] || game.category}`,
          positive: true,
        });
      } else {
        // Partial check for matching mechanics/tags
        const matchedTag = game.tags.some(t =>
          prefs.categories.some(c => t.toLowerCase().includes(c.toLowerCase()))
        );
        if (matchedTag) {
          score += 10;
        }
      }
    } else {
      score += 10;
    }

    // 4. Complexity Match (Max ~15 pts)
    if (prefs.complexityPreference !== 'any') {
      if (game.complexity === prefs.complexityPreference) {
        score += 15;
        const compMap = { light: 'Легка (прості правила)', medium: 'Середня (збалансована)', heavy: 'Висока (для досвідчених)' };
        reasons.push({
          type: 'complexity',
          label: `Бажаний рівень складності: ${compMap[game.complexity]}`,
          positive: true,
        });
      } else {
        const isClose = (prefs.complexityPreference === 'medium' && (game.complexity === 'light' || game.complexity === 'heavy')) ||
          (prefs.complexityPreference === 'light' && game.complexity === 'medium') ||
          (prefs.complexityPreference === 'heavy' && game.complexity === 'medium');
        if (isClose) {
          score += 6;
        }
      }
    } else {
      score += 10;
    }

    // 5. Interaction style & mood match (Max ~10 pts)
    if (prefs.interactionStyle === 'cooperative') {
      if (game.category === 'cooperative' || game.mechanics.some(m => m.toLowerCase().includes('коопер'))) {
        score += 10;
        reasons.push({
          type: 'mood',
          label: 'Спільна перемога: всі грають в одній команді проти гри',
          positive: true,
        });
      }
    } else if (prefs.interactionStyle === 'friendly') {
      if (game.category === 'family' || game.tags.some(t => t.includes('Затишна') || t.includes('Сімейна'))) {
        score += 10;
        reasons.push({
          type: 'mood',
          label: 'Затишна дружня атмосфера без жорсткої агресії',
          positive: true,
        });
      }
    } else if (prefs.interactionStyle === 'bluff') {
      if (game.tags.some(t => t.includes('Блеф') || t.includes('Дедукція') || t.includes('Для вечірок'))) {
        score += 10;
        reasons.push({
          type: 'mood',
          label: 'Азартний блеф, таємні ролі та активне живе спілкування',
          positive: true,
        });
      }
    } else if (prefs.interactionStyle === 'competitive') {
      if (game.category === 'strategy' || game.tags.some(t => t.includes('Конфлікт') || t.includes('Військовий') || t.includes('Торгівля'))) {
        score += 10;
        reasons.push({
          type: 'mood',
          label: 'Пряме змагання та боротьба за лідерство',
          positive: true,
        });
      }
    }

    // 6. Rating boost (+0..5 pts)
    const ratingBonus = Math.max(0, (game.rating - 6.5) * 2);
    score += ratingBonus;

    // Normalize to 100%
    const normalizedScore = Math.min(100, Math.max(10, Math.round(score)));

    results.push({
      game,
      score: normalizedScore,
      matchPercentage: normalizedScore,
      reasons,
      isBestPlayerCount: isBest,
    });
  }

  // Sort descending by match score
  results.sort((a, b) => b.score - a.score);

  return results;
}

export function findSimilarGames(targetGame: BoardGame, allGames: BoardGame[], limit = 3): BoardGame[] {
  return allGames
    .filter(g => g.id !== targetGame.id)
    .map(g => {
      let sim = 0;
      if (g.category === targetGame.category) sim += 30;
      if (g.complexity === targetGame.complexity) sim += 20;
      const sharedMechanics = g.mechanics.filter(m => targetGame.mechanics.includes(m)).length;
      sim += sharedMechanics * 15;
      const sharedTags = g.tags.filter(t => targetGame.tags.includes(t)).length;
      sim += sharedTags * 10;
      return { game: g, sim };
    })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, limit)
    .map(x => x.game);
}
