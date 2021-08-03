import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-writing',
  templateUrl: './writing.component.html',
  styleUrls: ['./writing.component.scss']
})
export class WritingComponent implements OnInit {

  textToSend: any;

  constructor() { }

  ngOnInit(): void {
  }

  send() {
    console.log(this.textToSend);
    this.textToSend = '';
  }
}
