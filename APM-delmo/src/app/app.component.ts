import { Component, OnInit } from '@angular/core';
// import { of, from } from 'rxjs';
// import { map, tap, take } from 'rxjs/operators';
@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  pageTitle = 'Acme Product Management';

  ngOnInit() {
    // of(2,4,6,8).subscribe(console.log);

    // from([20, 15, 10, 5])
    // .pipe(
    //   tap(item => console.log(`emitted item .... ${item}`)),
    //   map(item => item * 2),
    //   map(item => item - 10),
    //   map(item => {
    //     if (item === 0) {
    //       throw new Error('zero detected');
    //     }
    //     return item;
    //   }),
    //   take(3)
    // ).subscribe(
    //   item => console.log(`resulting item .. ${item}`),
    //   err => console.error(`error occured ${err}`),
    //   () => console.log('complete')
    // )

    // of('go','pack','go')
    // .subscribe(
    //   cheer => console.log(`Emit ${cheer}`),
    //   err => console.error(`${err}`),
    //   () => console.log('victory completed')
    // );
  }
}
