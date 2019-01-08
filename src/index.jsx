import React, { PureComponent, Component } from 'react';
import { Subject, of, BehaviorSubject } from "rxjs";
import { merge, scan, map } from "rxjs/operators";

const defaultSelector = state => state;

function shallowUpdate (previous, next) {
  let shallow = false;
  const prevKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  shallow = prevKeys.length !== nextKeys.length;

  if ( !shallow ) {
    for (const key of nextKeys) {
      if ( Array.isArray(previous[key]) && Array.isArray(next[key]) )
        shallow = shallowUpdate(previous[key], next[key]);
      else
        shallow = previous[key] !== next[key];

      if (shallow)
        return shallow;
    }
  }

  return shallow;
}

class Prevent extends Component {
  shouldComponentUpdate(nextProps) {
    const previousProps = this.props;

    return shallowUpdate(previousProps, nextProps);
  }

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

      if ( stateSelector ) {
        this.subscription = state$
          .pipe( map( (state) => stateSelector(state, props) ) )
          .subscribe(state => {
            if ( this.state )
              return this.setState.call(this, state);
            this.state = state;
          });
      }

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
        { subject }
      ] = actionPair;

      return { ...acc, [ key ]: state => subject.next(state) };
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

  const state$ = new BehaviorSubject();
  const subscription = of(initialState)
    .pipe(
      merge( ...actionPairs.map( ([ , { observable } ]) => observable) ),
      scan( (state, reducerFn) => reducerFn(state)),
    ).subscribe(state => state$.next(state));

  return {
    state$: state$.asObservable(),
    actions,
    initialState
  }
}

export function createMergedState(...localStates) {
  let rootInitialState = {};
  let rootActions = {};

  for (const { actions, initialState } of localStates) {
    rootInitialState = {
      ...rootInitialState,
      ...initialState
    };

    rootActions = {
      ...rootActions,
      ...actions
    };
  }

  const rootState$ = new BehaviorSubject();
  const subscription = of(rootInitialState)
    .pipe(
      merge(...localStates.map(({ state$ }) => state$)),
      scan((acc, state) => ({ ...acc, ...state })),
    )
    .subscribe(state => rootState$.next(state));

  return {
    state$: rootState$.asObservable(),
    actions: rootActions,
    initialState: rootInitialState
  }
}

export function resetState(...states) {
  states.forEach(state => state?.reset());
}
