import React, { PureComponent } from 'react';
import { Subject, of } from "rxjs";
import { shareReplay, merge, scan, map } from "rxjs/operators";

const defaultSelector = state => state;

class Prevent extends PureComponent {
  render() {
    const { component: Component, ...rest } = this.props;
    return (
      <Component {...rest} />
    );
  }
}

export function createWithStoreConsumer(Component, state, stateSelector = defaultSelector, actionsSelector = defaultSelector) {
  const { state$, actions } = state;

  class WithStore extends PureComponent {
    static displayName = `Connect(${ Component.displayName || Component.name || 'Unknown' })`;
    actions = {};
    subscription = null;

    constructor(props) {
      super(props);

      this.subscription = state$
        .pipe( map(stateSelector || (() => ({})) ) )
        .subscribe(state => {
          if ( this.state ) 
            return this.setState.call(this, state);
          this.state = state;
        });

      if ( actionsSelector )
        this.actions = actionsSelector(actions);
    }


    componentWillUnmount() {
      this.subscription?.unsubscribe();
    }

    render() {
      return (
        <Prevent
          component={Component}
          {...this.state}
          {...this.actions}
          {...this.props}
        />
      )
    }
  }

  return WithStore;
}

export function withStore(states, stateSelector, actionsSelector) {
  const state = createMergedState(...states);

  return Component => createWithStoreConsumer(Component, state, stateSelector, actionsSelector)
}

export function createActionPairs(actionFactories) {
  return Object
    .entries(actionFactories)
    .map(([ key, action ]) => {
      const subject = new Subject();
      const observable = action(subject);

      return [ key, { subject, observable } ];
    });
}

export function createActions(actionPairs) {
  return actionPairs
    .reduce((acc, actionPair) => {
      const [
        key,
        { subject, observable }
      ] = actionPair;

      return { ...acc, [ key ]: value => subject.next(value) };
    }, {});
}

export function createState(initialState, actionFactories) {
  const _actionFactories = {
    ...actionFactories,
    reset(subject) {
      return subject.pipe( map(() => () => initialState) );
    }
  };
  const actionPairs = createActionPairs(_actionFactories);
  const actions = createActions(actionPairs, initialState);

  const state$ = of(initialState).pipe(
    merge( ...actionPairs.map( ([ , { observable } ]) => observable) ),
    scan( (state, reducerFn) => reducerFn(state) ),
    shareReplay(1)
  );

  return {
    state$,
    actions,
    initialState
  }
}

export function createMergedState(...localStates) {
  let rootState$ = of({});
  let rootInitialState = {};
  let rootActions = {};

  for (const { state$, actions, initialState } of localStates) {
    rootState$ = rootState$.pipe( merge(state$) );

    rootInitialState = {
      ...rootInitialState,
      ...initialState
    };

    rootActions = {
      ...rootActions,
      ...actions
    };
  }

  rootState$ = rootState$.pipe(
    scan((acc, state) => ({ ...acc, ...state })),
    shareReplay(1)
  );

  return {
    actions: rootActions,
    state$: rootState$,
    initialState: rootInitialState
  }
}

export function resetState(...states) {
  states.forEach(state => state?.reset());
}
