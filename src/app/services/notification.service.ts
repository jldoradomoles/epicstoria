import { inject, Injectable } from '@angular/core';
import { interval, Subject } from 'rxjs';
import { AuthService } from './auth.service';
import { ChatService } from './chat.service';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private chatService = inject(ChatService);
  private authService = inject(AuthService);

  private previousUnreadCount = 0;
  private pollInterval = 10000; // 10 segundos
  private pollingSubscription: any;

  // Subject para emitir cuando hay nuevos mensajes
  private newMessageSubject = new Subject<number>();
  public newMessage$ = this.newMessageSubject.asObservable();

  /**
   * Iniciar el polling de mensajes no leídos
   */
  startPolling(): void {
    // Solo hacer polling si el usuario está autenticado
    if (!this.authService.currentUser()) {
      return;
    }

    // Solicitar permiso para notificaciones del navegador
    this.requestNotificationPermission();

    // Hacer primera consulta inmediatamente
    this.checkUnreadMessages();

    // Consultar cada X segundos
    this.pollingSubscription = interval(this.pollInterval).subscribe(() => {
      this.checkUnreadMessages();
    });
  }

  /**
   * Detener el polling
   */
  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = null;
    }
    this.previousUnreadCount = 0;
  }

  /**
   * Verificar mensajes no leídos
   */
  private checkUnreadMessages(): void {
    if (!this.authService.currentUser()) {
      return;
    }

    this.chatService.getUnreadCount().subscribe({
      next: (count) => {
        // Si hay más mensajes no leídos que antes, mostrar notificación
        if (count > this.previousUnreadCount && this.previousUnreadCount > 0) {
          const newMessages = count - this.previousUnreadCount;
          this.showNotification(newMessages);
          this.newMessageSubject.next(count);
        }
        this.previousUnreadCount = count;
      },
      error: (error) => {
        console.error('Error al verificar mensajes no leídos:', error);
      },
    });
  }

  /**
   * Solicitar permiso para notificaciones del navegador
   */
  private requestNotificationPermission(): void {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }

  /**
   * Mostrar notificación
   */
  private showNotification(count: number): void {
    const title = count === 1 ? 'Nuevo mensaje' : `${count} mensajes nuevos`;
    const body =
      count === 1 ? 'Has recibido un nuevo mensaje' : `Has recibido ${count} mensajes nuevos`;

    // Notificación del navegador
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/logos/epicstoria-logo.png',
        badge: '/logos/epicstoria-logo.png',
        tag: 'chat-notification',
        renotify: true,
      });

      // Cerrar notificación después de 5 segundos
      setTimeout(() => notification.close(), 5000);

      // Manejar click en la notificación
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  }

  /**
   * Obtener el contador actual de mensajes no leídos
   */
  getCurrentUnreadCount(): number {
    return this.previousUnreadCount;
  }
}
