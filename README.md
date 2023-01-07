# Table Of Contents

- [Table Of Contents](#table-of-contents)
- [API](#api)
  - [1. RegularService](#1-regularservice)
  - [2. IntervalService](#2-intervalservice)
  - [3. sleep](#3-sleep)



# API

## 1. RegularService

You can use RegularService to create an automatic mailing service, an automatic backup service, or anything you want.

```ts
import {RegularService, IntervalService, sleep } from 'sakura-time-service';



const autoMailingService = new RegularService({
    // The callback will be called when the clock points at timestamps 
    // declared at the times
    callback: async (e) => {

        // You can stop the service when the service is running.
        e.currentTarget.stop();
        // or
        autoMailingService.stop();


        // You can setTimes when the service is running.
        autoMailingService.setTimes([
            '22:00:00',
            '23:15:15',
        ]);
        // Or
        e.currentTarget.setTimes([
            '22:00:00',
            '23:15:15',
        ]);


        // This will not stop your application
        await sleep(15_000);
        // After 15 seconds


        // This will not stop your application
        throw new Error('This will trigger error handling');
    },

    // This is necessary because your server may be located anywhere,
    // the time difference will cause the results to be wrong.
    timeZone: 'America/New_York', // default: undefined
    

    times: [
        '00:00:00', // callback will be called at 00:00:00
        '22:00:00' // 
    ],
});


// Event when the service throw an error
autoMailingService.onError = (e) => {

    // stop service
    e.currentTarget.stop(); 
    // or
    autoMailingService.stop()


    // restart service
    e.currentTarget.restart(); 
    // or
    autoMailingService.restart();


    console.log(e.error);
}


autoMailingService.stop(); // stop service

autoMailingService.start(); // stop service

autoMailingService.restart(); // restart service

autoMailingService.status; // return service status: 'stopped' or 'running' ;

autoMailingService.times; //

autoMailingService.timeZone //

// You can setTimes when the service is running.
autoMailingService.setTimes([
    '22:00:00',
    '23:15:15',
]);



```

## 2. IntervalService

You can use the IntervalService to create an auto refresh token,...

```ts
import {RegularService, IntervalService, sleep } from 'sakura-time-service';

const autoRefreshToken = new IntervalService({
    callback: async (e) => {

        // you can change the delay time when the service is running.
        e.currentTarget.delay = 200; // 0.2 seconds
        // or
        autoRefreshToken.delay = 200;
        
    },
    delay: 15_000 // 15 seconds
});

autoRefreshToken.onError = (e) => {
   // your code here ... 
}

autoRefreshToken.delay // get and set the delay time.
autoRefreshToken.status // return service status: 'stopped' or 'running' ;
autoRefreshToken.start();
autoRefreshToken.stop();
autoRefreshToken.restart();


```


## 3. sleep

```ts
import { sleep } from 'sakura-time-service';

const func = async () => {

    await sleep(15_000); // unit: milliseconds
    // After 15 seconds

}

```