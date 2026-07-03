import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICharacter } from '../../interfaces/character.interface';

export enum CharacterStatus {
  Alive = 'Alive',
  Dead = 'Dead',
  Unknown = 'unknown'
}

@Component({
  selector: 'app-character',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent {
  public character = input.required<ICharacter>();

  private readonly statusStyles: Record<CharacterStatus, string> = {
    [CharacterStatus.Alive]: 'bg-green-100 text-green-700',
    [CharacterStatus.Dead]: 'bg-red-100 text-red-700',
    [CharacterStatus.Unknown]: 'bg-gray-100 text-gray-700'
  };

  protected getStatusClass(status: string): string {
    return this.statusStyles[status as CharacterStatus] || this.statusStyles[CharacterStatus.Unknown];
  }
}
