/* eslint-disable */

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

export function createState(initialState, actionsFactories) {
  const actionsArr = Object
    .entries(actionsFactories)
    .map(([key, action]) => {
      const subjectForAction = new Subject();
      const actionObservable = action(subjectForAction);

      return { key, actionObservable };
    });

  const actions = actionsArr.reduce((acc, val) => {
    const { key, actionObservable } = val;

    return {
      ...acc,
      [key]: (value) => {
        return actionObservable.next(value);
      }
    }
  }, {});

  const state$ = of(initialState).pipe(
    merge(...actionsArr.map(({ actionObservable }) => actionObservable)),
    scan((state, reducerFn) => reducerFn(state)),
    publishReplay(1),
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
    state$
  }
}