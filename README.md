# Reactive store

Store for React which uses RxJS

Project launch

build
```bash
npm run build
```

### NPM install
```bash
npm i -P @dawiidio/reactive-store
```

### Simple case study:

State creation:
```jsx harmony
// file: counterState.jsx
import { map, merge, bufferTime } from "rxjs/operators";
import { interval } from "rxjs";
import { createState } from "@dawiidio/reactive-store";

export const counter = createState(
  // first argument - initial state
  {
      counter: 0
  },
  // second - actions, all in state scope. Every action gets own, custom
  // subject in first param and every action needs to return Observable.
  // Real action exists in `map`, it gets value passed during call and 
  // must return second function which will get in first param current state
  // and return new one.
  {
    increment: (subject) => 
      subject
        .pipe(
          merge(interval(1000)),
          map((value) => (state) => ({
                  ...state,
                  counter: state.counter + value,
              }
            )
          ),
        )
  }
);
``` 

How to connect component and state:
```jsx harmony
// file: Counter.jsx
import { counter } from 'counterState.jsx'; 
import { withStore } from '@dawiidio/reactive-store'; 

export function _Counter({ counter, increment }) {
  // increment(value) is action from our state and it is equal to
  // call next(value)  on action subject
  const onClick = () => increment(counter + 10);
  
  return (
    <div>
      <p>Counter value: </p>
      <h3>{ counter }</h3>
      <button onClick={onClick}>Add 10 to counter</button>
    </div>
  );
}

export const Counter = withStore(counter)(state => {
  // state === state declared in store, you can pass many stores like 
  // withStore(counter, users, ...etc) all their actions and fields will
  // be available in connected component props. 
  
  // if you just return the same state without mutating like me then 
  // leave call empty - withStore(counter)()(_Counter); which is equal 
  // to state => state.
  return state;
}, actions => {
  // second functions can mutate actions from stores, same as state, if you
  // leave empty call it means "return all actions under the same names".
  return actions;
})(_Counter);
```