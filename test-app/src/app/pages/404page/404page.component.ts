import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-404page',
  templateUrl: './404page.component.html',
  styleUrls: ['./404page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotFoundPageComponent  {

  private readonly location = inject(Location);

  goBack() {
    this.location.back();
  }
}
