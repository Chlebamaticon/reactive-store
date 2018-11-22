import React, { PureComponent } from 'react';
import { Subject, of } from "rxjs";
import { publishReplay, refCount, merge, scan, map, skip } from "rxjs/operators";

class Prevent extends PureComponent {
  render() {
    const { component: Component, ...rest } = this.props;
    return (
      <Component {...rest} />
    );
  }
}

export function createWithStoreConsumer(Component, state, stateSelector = s => s, actionsSelector = a => a) {
  const { state$, actions } = state;

  class WithStore extends PureComponent {
    static displayName = `Connect(${ Component.displayName || Component.name || 'Unknown' })`;

    componentDidMount() {
      this.subscription = state$
        .pipe(
            map(stateSelector)
        )
        .subscribe(this.setState.bind(this));
      this.actions = actionsSelector(actions);
    }

    componentWillUnmount() {
      this.subscription.unsubscribe();
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
  }
  const actionPairs = createActionPairs(_actionFactories);
  const actions = createActions(actionPairs, initialState);

  const state$ = of(initialState).pipe(
    merge( ...actionPairs.map( ([ , { observable } ]) => observable) ),
    scan( (state, reducerFn) => reducerFn(state) ),
    publishReplay( 1 ),
    refCount(),
  );

  return {
    state$,
    actions,
    initialState
  }
}

export function createMergedState(...localStates) {
  let localStateObservers = [];
  let rootInitialState = {};
  let rootActions = {};

  localStates.forEach(({ state$: internalState, initialState, actions }) => {
    localStateObservers.push(internalState.pipe(
      skip(1) //skip initial values for every state
    ));

    rootInitialState = {
      ...rootInitialState,
      ...initialState
    };

    rootActions = {
      ...rootActions,
      ...actions
    };
  });

  const state$ = of(rootInitialState).pipe(
    merge(...localStateObservers),
    scan((oldState, newState) => ({ ...oldState, ...newState })),
    publishReplay(1),
    refCount()
  );

  return {
    actions: rootActions,
    state$,
    initialState: rootInitialState
  }
}

export function resetState(...states) {
  for (const { actions } of states)
    if ( actions.reset ) 
      actions.reset();
}
