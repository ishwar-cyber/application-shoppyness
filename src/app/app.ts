import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./components/header/header";
import { Footer } from "./components/footer/footer";
import { NetworkService } from './services/network-service';
import { CartService } from './services/cart';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit{

  protected title = 'application-shoppyness';

  public network = inject(NetworkService);
  private cartService = inject(CartService);

   ngOnInit(): void {
    this.cartService.loadCart();
  }
}
