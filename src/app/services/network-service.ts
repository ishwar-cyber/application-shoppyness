import { Injectable, signal } from '@angular/core';
import { fromEvent, map, startWith, merge } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class NetworkService {
  public online = signal<boolean>(navigator.onLine);

  private checkNetwork(){
    const online = fromEvent(window, 'online').pipe(map(()=>true));
    const offline = fromEvent(window, 'offline').pipe(map(()=>false));

    merge(online, offline)
    .pipe(startWith(navigator.onLine))
    .subscribe((status:boolean)=>{
      this.online.set(status)
    })
  }
}
