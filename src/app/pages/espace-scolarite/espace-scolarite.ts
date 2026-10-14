import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NotificationService } from '../../core/notification.service';

@Component({
  selector: 'app-espace-scolarite',
  imports: [CommonModule, RouterLink, HttpClientModule],
  templateUrl: './espace-scolarite.html',
  styleUrl: './espace-scolarite.scss',
})
export class EspaceScolarite {
  protected readonly notif = inject(NotificationService);
  protected afficherNotifs = signal(false);

  protected readonly nomScolarite = localStorage.getItem('nom') ?? 'Scolarité';

  constructor() {
    this.notif.charger();
  }
}