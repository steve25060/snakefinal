const db = require('../utils/db');
const logger = require('../utils/logger');

/**
 * Socket.IO event handlers for real-time updates
 */
module.exports = function(io) {
  // Store active connections
  const activeConnections = new Map();
  
  io.on('connection', (socket) => {
    logger.info('Client connected', { socketId: socket.id });
    
    /**
     * User connects to real-time updates
     */
    socket.on('join-leaderboard', (data) => {
      try {
        const { userId, roomId = 'leaderboard' } = data;
        
        socket.join(roomId);
        activeConnections.set(socket.id, { userId, roomId });
        
        logger.debug('User joined leaderboard', { userId, roomId, socketId: socket.id });
        
        io.to(roomId).emit('user-joined', {
          totalViewers: io.sockets.adapter.rooms.get(roomId)?.size || 1,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Join leaderboard error:', { error: error.message });
        socket.emit('error', { message: 'Failed to join leaderboard' });
      }
    });
    
    /**
     * Broadcast leaderboard update
     */
    socket.on('leaderboard-update', async (data) => {
      try {
        const { sessionId, userId, score, correctAnswers } = data;
        const roomId = 'leaderboard';
        
        // Get updated player rank
        const player = await db.getOne(
          `SELECT 
            RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
            u.name, u.roll_number, gs.score, gs.correct_answers, gs.completed_at
           FROM users u
           JOIN game_sessions gs ON u.id = gs.user_id
           WHERE u.id = $1 AND gs.game_status = 'completed'
           ORDER BY gs.score DESC LIMIT 1`,
          [userId]
        );
        
        if (player) {
          io.to(roomId).emit('player-updated', {
            player,
            timestamp: new Date().toISOString()
          });
        }
        
        logger.debug('Leaderboard updated', { userId, score });
      } catch (error) {
        logger.error('Leaderboard update error:', { error: error.message });
        socket.emit('error', { message: 'Failed to update leaderboard' });
      }
    });
    
    /**
     * Real-time admin dashboard update
     */
    socket.on('join-admin-dashboard', (data) => {
      try {
        const { adminId, roomId = 'admin-dashboard' } = data;
        
        socket.join(roomId);
        activeConnections.set(socket.id, { adminId, roomId });
        
        logger.debug('Admin joined dashboard', { adminId, roomId, socketId: socket.id });
        
        io.to(roomId).emit('admin-connected', {
          adminId,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        logger.error('Admin join dashboard error:', { error: error.message });
        socket.emit('error', { message: 'Failed to join admin dashboard' });
      }
    });
    
    /**
     * Admin requests live statistics
     */
    socket.on('request-live-stats', async (data) => {
      try {
        const roomId = 'admin-dashboard';
        
        const stats = await db.getOne(
          `SELECT 
            COUNT(DISTINCT CASE WHEN gs.game_status = 'active' THEN u.id END) as active_players,
            COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN u.id END) as completed_players,
            COUNT(DISTINCT u.id) as total_participants
           FROM users u
           LEFT JOIN game_sessions gs ON u.id = gs.user_id`
        );
        
        io.to(roomId).emit('live-stats', {
          ...stats,
          timestamp: new Date().toISOString()
        });
        
        logger.debug('Live stats sent', { adminRoom: roomId });
      } catch (error) {
        logger.error('Live stats request error:', { error: error.message });
        socket.emit('error', { message: 'Failed to get live statistics' });
      }
    });
    
    /**
     * Notify admin of game completion
     */
    socket.on('game-completed', async (data) => {
      try {
        const { userId, sessionId, finalScore, completedAt } = data;
        const adminRoom = 'admin-dashboard';
        
        const playerInfo = await db.getOne(
          'SELECT name, roll_number FROM users WHERE id = $1',
          [userId]
        );
        
        io.to(adminRoom).emit('new-completion', {
          userId,
          playerName: playerInfo?.name,
          rollNumber: playerInfo?.roll_number,
          finalScore,
          completedAt,
          timestamp: new Date().toISOString()
        });
        
        logger.info('Game completion notified', { userId, sessionId, score: finalScore });
      } catch (error) {
        logger.error('Game completion notification error:', { error: error.message });
      }
    });
    
    /**
     * Real-time question management updates
     */
    socket.on('join-admin-questions', (data) => {
      try {
        const { adminId, roomId = 'admin-questions' } = data;
        
        socket.join(roomId);
        
        logger.debug('Admin joined questions room', { adminId, roomId });
      } catch (error) {
        logger.error('Join admin questions error:', { error: error.message });
        socket.emit('error', { message: 'Failed to join questions room' });
      }
    });
    
    /**
     * Broadcast question changes to admin
     */
    socket.on('question-updated', (data) => {
      try {
        const { questionId, action } = data; // action: 'created', 'updated', 'deleted'
        
        io.to('admin-questions').emit('question-change', {
          questionId,
          action,
          timestamp: new Date().toISOString()
        });
        
        logger.debug('Question update broadcasted', { questionId, action });
      } catch (error) {
        logger.error('Question update broadcast error:', { error: error.message });
      }
    });
    
    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      try {
        const connection = activeConnections.get(socket.id);
        
        if (connection) {
          activeConnections.delete(socket.id);
          logger.info('Client disconnected', { 
            socketId: socket.id,
            roomId: connection.roomId,
            userId: connection.userId || connection.adminId
          });
          
          // Notify room that user left
          io.to(connection.roomId).emit('user-left', {
            totalViewers: (io.sockets.adapter.rooms.get(connection.roomId)?.size || 1) - 1,
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        logger.error('Disconnect error:', { error: error.message });
      }
    });
    
    /**
     * Error handling
     */
    socket.on('error', (error) => {
      logger.error('Socket error:', { error: error.message, socketId: socket.id });
    });
  });
  
  /**
   * Periodic broadcast of live leaderboard updates (every 5 seconds)
   */
  setInterval(async () => {
    try {
      if (io.sockets.adapter.rooms.get('leaderboard')?.size > 0) {
        const leaderboard = await db.getAll(
          `SELECT 
            RANK() OVER (ORDER BY gs.score DESC, gs.completed_at ASC) as rank,
            u.id, u.name, u.roll_number,
            gs.score, gs.correct_answers, gs.completed_at
           FROM users u
           JOIN game_sessions gs ON u.id = gs.user_id
           WHERE gs.game_status = 'completed'
           ORDER BY gs.score DESC, gs.completed_at ASC
           LIMIT 10`
        );
        
        io.to('leaderboard').emit('leaderboard-snapshot', {
          leaderboard,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Leaderboard broadcast error:', { error: error.message });
    }
  }, 5000);
  
  /**
   * Periodic broadcast of live admin stats (every 3 seconds)
   */
  setInterval(async () => {
    try {
      if (io.sockets.adapter.rooms.get('admin-dashboard')?.size > 0) {
        const stats = await db.getOne(
          `SELECT 
            COUNT(DISTINCT CASE WHEN gs.game_status = 'active' THEN u.id END) as active_players,
            COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN u.id END) as completed_players,
            COUNT(DISTINCT u.id) as total_participants,
            COUNT(DISTINCT CASE WHEN gs.game_status = 'completed' THEN gs.id END) as total_completed,
            ROUND(AVG(CASE WHEN gs.game_status = 'completed' THEN gs.score END)::numeric, 2) as avg_score,
            MAX(CASE WHEN gs.game_status = 'completed' THEN gs.score END) as highest_score
           FROM users u
           LEFT JOIN game_sessions gs ON u.id = gs.user_id`
        );
        
        io.to('admin-dashboard').emit('stats-update', {
          ...stats,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Admin stats broadcast error:', { error: error.message });
    }
  }, 3000);
  
  return io;
};
