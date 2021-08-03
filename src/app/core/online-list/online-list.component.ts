import { Component, OnInit } from '@angular/core';
import {User} from "../../shared/constants/user";

@Component({
  selector: 'app-online-list',
  templateUrl: './online-list.component.html',
  styleUrls: ['./online-list.component.scss']
})
export class OnlineListComponent implements OnInit {

  onlineList: User[] = [{userName: 'Konrad'}, {userName: 'Andrzej'}];

  constructor() { }

  ngOnInit(): void {
  }
}
