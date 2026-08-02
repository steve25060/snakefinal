/**
 * Scoring system for Snake MCQ Challenge
 */

const CORRECT_ANSWER_POINTS = parseInt(process.env.MAX_CORRECT_SCORE) || 100;
const READING_BONUS_PER_SECOND = parseInt(process.env.READING_BONUS_POINTS) || 2;
const READING_TIME_TOTAL = parseInt(process.env.READING_TIME_SECONDS) || 20;

/**
 * Calculate score for a correct answer
 */
function calculateCorrectAnswerScore(readingTimeRemaining = 0) {
  const correctPoints = CORRECT_ANSWER_POINTS;
  const bonusPoints = (readingTimeRemaining > 0) 
    ? readingTimeRemaining * READING_BONUS_PER_SECOND 
    : 0;
  
  return {
    correctPoints,
    bonusPoints,
    totalPoints: correctPoints + bonusPoints,
    breakdown: {
      answer: correctPoints,
      readingBonus: bonusPoints
    }
  };
}

/**
 * Calculate score for wrong answer
 */
function calculateWrongAnswerScore() {
  return {
    correctPoints: 0,
    bonusPoints: 0,
    totalPoints: 0,
    breakdown: {
      answer: 0,
      readingBonus: 0
    }
  };
}

/**
 * Calculate score for border collision or skip
 */
function calculateSkipScore() {
  return {
    correctPoints: 0,
    bonusPoints: 0,
    totalPoints: 0,
    breakdown: {
      answer: 0,
      readingBonus: 0
    }
  };
}

/**
 * Calculate total final score
 */
function calculateFinalScore(answers) {
  let totalScore = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let skippedCount = 0;
  
  answers.forEach(answer => {
    if (answer.is_correct) {
      totalScore += answer.points_awarded || CORRECT_ANSWER_POINTS;
      totalScore += answer.reading_bonus_points || 0;
      correctCount++;
    } else if (answer.result_type === 'skipped' || answer.result_type === 'border_collision') {
      skippedCount++;
    } else {
      wrongCount++;
    }
  });
  
  return {
    totalScore,
    correctCount,
    wrongCount,
    skippedCount,
    totalAttempted: answers.length,
    accuracy: answers.length > 0 ? ((correctCount / answers.length) * 100).toFixed(2) : 0
  };
}

/**
 * Get score breakdown
 */
function getScoreBreakdown() {
  return {
    correctAnswerPoints: CORRECT_ANSWER_POINTS,
    readingBonusPerSecond: READING_BONUS_PER_SECOND,
    readingTimeTotal: READING_TIME_TOTAL,
    maxPossibleScore: (CORRECT_ANSWER_POINTS + (READING_TIME_TOTAL * READING_BONUS_PER_SECOND)) * 10,
    maxPerQuestion: CORRECT_ANSWER_POINTS + (READING_TIME_TOTAL * READING_BONUS_PER_SECOND)
  };
}

/**
 * Rank players based on score
 */
function rankPlayers(players) {
  return players
    .sort((a, b) => {
      // Primary: score (descending)
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      // Secondary: completion time (ascending)
      return new Date(a.completed_at) - new Date(b.completed_at);
    })
    .map((player, index) => ({
      ...player,
      rank: index + 1
    }));
}

module.exports = {
  calculateCorrectAnswerScore,
  calculateWrongAnswerScore,
  calculateSkipScore,
  calculateFinalScore,
  getScoreBreakdown,
  rankPlayers,
  CORRECT_ANSWER_POINTS,
  READING_BONUS_PER_SECOND,
  READING_TIME_TOTAL
};
