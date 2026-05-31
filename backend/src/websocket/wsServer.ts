import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

const connectedClients = new Map<string, { ws: WebSocket; role: string }>();

export const initWebSocketServer = (wss: WebSocketServer) => {
  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get('token');

    if (!token) {
      ws.close(4001, 'Unauthorized');
      return;
    }

    jwt.verify(token, env.JWT_SECRET, (err: any, user: any) => {
      if (err) {
        ws.close(4001, 'Unauthorized');
        return;
      }

      const userId = `user-${Math.random().toString(36).slice(2, 9)}`;
      connectedClients.set(userId, { ws, role: user.role });

      ws.on('message', (message: string) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.event === 'ACTIVE_TELEMETRY_STREAM') {
            ws.send(JSON.stringify({ event: 'TELEMETRY_ACKNOWLEDGED', status: 'STABLE' }));
          }
        } catch (e) {
          ws.send(JSON.stringify({ error: 'Invalid JSON payload format' }));
        }
      });

      ws.on('close', () => {
        connectedClients.delete(userId);
      });
    });
  });
};

export const broadcastToTeachers = (payload: any) => {
  connectedClients.forEach((client) => {
    if (client.role === 'TEACHER' && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(payload));
    }
  });
};
