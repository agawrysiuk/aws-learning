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
    nickname: 'nickname',
    password: 'password'
  }
  registrationActive: boolean = false;
  errorMessage: string | undefined;

  constructor(private fb: FormBuilder,
              private auth: AuthService,
              private cdr: ChangeDetectorRef) {
    this.form = this.createForm();
  }

  ngOnInit(): void {
  }

  changeTab(registrationActive: boolean) {
    this.registrationActive = registrationActive;
    if (registrationActive) {
      this.form.controls[this.formFields.nickname].setValidators([Validators.required, Validators.minLength(3)]);
    } else {
      this.form.controls[this.formFields.nickname].clearValidators();
    }
  }

  submit() {
    if (this.registrationActive) {
      this.register();
    } else {
      this.login();
    }
  }

  private register() {
    this.auth.register(
      this.form.controls[this.formFields.email].value,
      this.form.controls[this.formFields.nickname].value,
      this.form.controls[this.formFields.password].value
    )
      .then(res => {
        console.log(res);
        this.registrationActive = false;
      })
      .catch(err => this.errorMessage = err.message);
  }

  private login() {
    this.auth.login(
      this.form.controls[this.formFields.email].value,
      this.form.controls[this.formFields.password].value
    ).then(() => this.cdr.detectChanges());
  }

  private createForm() {
    return this.fb.group({
      [this.formFields.email]: this.fb.control(null, Validators.required),
      [this.formFields.nickname]: this.fb.control(null),
      [this.formFields.password]: this.fb.control(null, Validators.required)
    });
  }
}
