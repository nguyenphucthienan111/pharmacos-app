export class User {
  constructor(name = "", email = "", phone = "", password = "", isAdmin = false) {
    this.name = name;
    this.email = email;
    this.phone = phone;
    this.password = password;
    this.isAdmin = isAdmin; 
  }
}