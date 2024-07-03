import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import 'zone.js';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
    <h1>Hello world test from {{ name }}!</h1>
    <textarea></textarea>
    <a target="_blank" href="https://angular.dev/overview">
      Learn more about Angular
    </a>
    <img src="http://yuml.me/diagram/scruffy/class/{{ diagram }}" >
  `,
})
export class App {
  name = 'Angular';
  diagram = '[Customer]<->[Address]->[office]->[test]';
}

bootstrapApplication(App);
