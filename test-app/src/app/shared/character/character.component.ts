import { Component, input } from '@angular/core';
import { ICharacter } from '../../interfaces/character.interface';
import { environment } from '../../../environments/environment.development';
@Component({
  selector: 'app-character',
  templateUrl: './character.component.html',
  styleUrls: ['./character.component.scss'],
})
export class CharacterComponent {
  character = input.required<ICharacter>();
  environment = environment;

  protected openModal(){

  }
}
