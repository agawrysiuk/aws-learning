import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AuthService} from "../../shared/services/auth/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  formFields = {
    email: 'email',
    password: 'password'
  }

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private cdr: ChangeDetectorRef) {
    this.form = this.fb.group({
      [this.formFields.email]: this.fb.control(null, Validators.required),
      [this.formFields.password]: this.fb.control(null, Validators.required)
    });
  }

  ngOnInit(): void {
  }

  login() {
    this.auth.login(
      this.form.controls[this.formFields.email].value,
      this.form.controls[this.formFields.password].value
    )
      .then(() => this.cdr.detectChanges());
  }
}
