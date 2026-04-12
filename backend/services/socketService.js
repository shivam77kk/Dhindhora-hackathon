import Reaction from '../models/Reaction.js';
import CommunityNote from '../models/CommunityNote.js';

export const setupSocketHandlers = (io) => {
  const roomViewers = new Map();

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join:webreel', ({ webreelId, username }) => {
      socket.join(webreelId);
      if (!roomViewers.has(webreelId)) roomViewers.set(webreelId, new Set());
      roomViewers.get(webreelId).add({ id: socket.id, username });
      io.to(webreelId).emit('viewers:update', {
        count: roomViewers.get(webreelId).size,
        viewers: Array.from(roomViewers.get(webreelId)),
      });
    });

    socket.on('leave:webreel', ({ webreelId }) => {
      socket.leave(webreelId);
      if (roomViewers.has(webreelId)) {
        const viewers = roomViewers.get(webreelId);
        viewers.forEach(v => { if (v.id === socket.id) viewers.delete(v); });
        io.to(webreelId).emit('viewers:update', { count: viewers.size });
      }
    });

    socket.on('join:user', ({ userId }) => {
      socket.join(userId);
    });

    socket.on('reaction:send', async ({ webreelId, emoji, username, position }) => {
      const reactionData = { emoji, username, position, id: socket.id, timestamp: Date.now() };
      io.to(webreelId).emit('reaction:new', reactionData);
      try {
        await Reaction.findOneAndUpdate(
          { webreelId, emoji },
          { $inc: { count: 1 } },
          { upsert: true, new: true }
        );
      } catch (e) {
        console.error('Reaction save error:', e);
      }
    });

    socket.on('vote:cast', ({ webreelId, option, username }) => {
      io.to(webreelId).emit('vote:update', { option, username, timestamp: Date.now() });
    });

    socket.on('prediction:bet', ({ webreelId, optionIndex, username, coins }) => {
      io.to(webreelId).emit('prediction:bet:new', { optionIndex, username, coins, timestamp: Date.now() });
    });

    socket.on('cursor:move', ({ webreelId, x, y, username, color }) => {
      socket.to(webreelId).emit('cursor:update', { socketId: socket.id, x, y, username, color });
    });

    socket.on('draw:stroke', ({ webreelId, points, color, width }) => {
      socket.to(webreelId).emit('draw:stroke', { socketId: socket.id, points, color, width });
    });

    socket.on('note:add', async ({ content, author, color, position }) => {
      try {
        const note = await CommunityNote.create({ content, author, color, position });
        io.emit('note:new', note);
      } catch (e) {
        socket.emit('error', { message: 'Note save failed' });
      }
    });

    socket.on('typing:start', ({ webreelId, username }) => {
      socket.to(webreelId).emit('typing:update', { username, isTyping: true });
    });

    socket.on('typing:stop', ({ webreelId, username }) => {
      socket.to(webreelId).emit('typing:update', { username, isTyping: false });
    });

    socket.on('disconnect', () => {
      roomViewers.forEach((viewers, roomId) => {
        viewers.forEach(v => {
          if (v.id === socket.id) {
            viewers.delete(v);
            io.to(roomId).emit('viewers:update', { count: viewers.size });
          }
        });
      });
    });
  });
};
