import React, { PureComponent } from 'react';
import { Subject } from "rxjs";
import { of } from "rxjs";
import { publishReplay, refCount, merge, scan, map, skip } from "rxjs/operators";

class Prevent extends PureComponent {
  render() {
    const { renderComponent, ...rest } = this.props;
    return renderComponent(rest);
  }
}

export function withStore(...localStates) {
  return createStoreConnectComponent(createRootState(...localStates));
}

export function createStoreConnectComponent({ actions: rxActions, state$ }) {
  const actions = Object.entries(rxActions)
    .reduce((acc, [key, value]) => ({
      ...acc,
      [key]: value
    }), {});

  const defaultStateSelector = state => state;
  const defaultActionsSelector = actions => actions;

  return (selector = defaultStateSelector, actionsSelector = defaultActionsSelector) => (WrappedComponent) => {
    const renderComponent = props => <WrappedComponent {...props} />;

    class WithStore extends PureComponent {
      static displayName = `Connect(${WrappedComponent.displayName || WrappedComponent.name || 'Unknown'})`;

      componentDidMount() {
        this.subscription = state$.pipe(map(selector)).subscribe(this.setState.bind(this));
        this.actions = actionsSelector(actions);
      }

      componentWillUnmount() {
        this.subscription.unsubscribe();
      }

      render() {
        return (
          <Prevent
            renderComponent={renderComponent}
            {...this.state}
            {...this.actions}
            {...this.props}
          />
        )
      }
    }

    return WithStore;
  };
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
  const actionPairs = createActionPairs(actionFactories);
  const actions = createActions(actionPairs);

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

export function createRootState(...localStates) {
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