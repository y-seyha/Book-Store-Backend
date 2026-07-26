import {
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';


@WebSocketGateway({
    cors: {
        origin: [
            'http://localhost:3001',
            'http://localhost:3002',
            'https://ys-bookstore.vercel.app'
        ],
        credentials: true,
    }
})
export class NotificationGateway implements OnGatewayConnection, OnGatewayDisconnect{
    @WebSocketServer()
    server : Server;

    handleConnection(client: Socket) {
        console.log('Client connected:', client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('Client disconnected:', client.id);
    }

    @SubscribeMessage('register')
    handleRegister(client: Socket, userId: string) {
        if (!userId) return;

        client.join(userId);
        // console.log(`User ${userId} joined room`);
    }

    sendToUser(userId: string, event: string, data: any) {
        // console.log("📨 EMIT EVENT");
        // console.log("Room:", userId);
        // console.log("Event:", event);
        // console.log("Data:", data);
        this.server.to(userId).emit(event, data);
    }

    broadcast(event : string, data : any){
        this.server.emit(event,data);
    }


}