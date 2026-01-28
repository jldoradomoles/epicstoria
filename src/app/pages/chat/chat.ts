
import { Component, ElementRef, OnDestroy, OnInit, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { User } from '../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { ChatService, Message } from '../../services/chat.service';
import { FriendshipService } from '../../services/friendship.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat.html',
  styleUrls: ['./chat.scss'],
})
export class ChatComponent implements OnInit, OnDestroy {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  otherUserId = signal<number | null>(null);
  otherUser = signal<User | null>(null);
  messages = signal<Message[]>([]);
  newMessage = '';
  isLoadingMessages = signal<boolean>(false);
  isSending = signal<boolean>(false);
  errorMessage = signal<string>('');
  isInitialLoad = signal<boolean>(true);

  private pollingSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService,
    private chatService: ChatService,
    private friendshipService: FriendshipService,
  ) {}

  get currentUser() {
    return this.authService.currentUser;
  }

  ngOnInit(): void {
    // Obtener el ID del otro usuario desde la ruta
    this.route.params.subscribe((params) => {
      const userId = parseInt(params['userId']);
      if (isNaN(userId)) {
        this.router.navigate(['/profile']);
        return;
      }

      this.otherUserId.set(userId);
      this.loadOtherUser(userId);
      this.loadMessages();
      this.startPolling();
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }

  loadOtherUser(userId: number): void {
    // Cargar información del otro usuario desde el servicio de amistad
    this.friendshipService.getAllUsers().subscribe({
      next: (users) => {
        const user = users.find((u) => u.id === userId);
        if (user) {
          this.otherUser.set(user as User);
        } else {
          this.errorMessage.set('Usuario no encontrado');
          setTimeout(() => this.router.navigate(['/profile']), 2000);
        }
      },
      error: (error) => {
        console.error('Error al cargar usuario:', error);
        this.errorMessage.set('Error al cargar información del usuario');
      },
    });
  }

  loadMessages(showSpinner: boolean = true): void {
    const userId = this.otherUserId();
    if (!userId) return;

    if (showSpinner) {
      this.isLoadingMessages.set(true);
    }

    this.chatService.getMessages(userId).subscribe({
      next: (messages) => {
        const shouldScroll = this.messages().length === 0 || this.isInitialLoad();
        this.messages.set(messages);
        this.isLoadingMessages.set(false);
        this.isInitialLoad.set(false);
        if (shouldScroll) {
          setTimeout(() => this.scrollToBottom(), 100);
        }
      },
      error: (error) => {
        console.error('Error al cargar mensajes:', error);
        if (showSpinner) {
          this.errorMessage.set('Error al cargar mensajes');
        }
        this.isLoadingMessages.set(false);
        this.isInitialLoad.set(false);
      },
    });
  }

  sendMessage(event: Event): void {
    event.preventDefault();

    const message = this.newMessage.trim();
    const userId = this.otherUserId();

    if (!message || !userId) return;

    this.isSending.set(true);
    this.errorMessage.set('');

    this.chatService.sendMessage(userId, message).subscribe({
      next: () => {
        this.newMessage = '';
        this.isSending.set(false);
        this.loadMessages(false); // Recargar mensajes sin spinner después de enviar
      },
      error: (error) => {
        console.error('Error al enviar mensaje:', error);
        this.errorMessage.set('Error al enviar mensaje');
        this.isSending.set(false);
      },
    });
  }

  startPolling(): void {
    // Actualizar mensajes cada 3 segundos
    this.pollingSubscription = interval(3000).subscribe(() => {
      this.loadMessages(false); // No mostrar spinner en actualizaciones automáticas
    });
  }

  stopPolling(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  scrollToBottom(): void {
    try {
      if (this.messagesContainer) {
        const element = this.messagesContainer.nativeElement;
        element.scrollTop = element.scrollHeight;
      }
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  formatMessageTime(date: Date): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInMs = now.getTime() - messageDate.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Ahora';
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `Hace ${diffInHours}h`;
    } else if (diffInDays === 1) {
      return 'Ayer';
    } else if (diffInDays < 7) {
      return `Hace ${diffInDays} días`;
    } else {
      return messageDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}
