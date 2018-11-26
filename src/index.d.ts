// Type defintions for reactive-store v0.0.2
// Project: https://github.com/dawiidio/reactive-store
// Definitions by: Jakub Chlebowicz <https://github.com/chlebamaticon/>
/// <reference types="react" />
/// <reference types="rxjs" />

import * as React from 'react';
import { Subject, Observable } from 'rxjs';

type Pair<T1, T2> = [T1, T2];

interface Action<S = any> {
    (state: S): S
}

interface ActionMap<S = any> {
    [key: string]: Action<S>;
}

interface ActionObservableFactory<S = any> {
    <R = S>(state$: Observable<S>): Observable<R>
}

interface ActionObservableFactoryMap<S = any> {
    [key: string]: ActionObservableFactory<S>,

    reset: ActionObservableFactory<S>
}

interface ActionPair<S = any> {
    subject: Subject<S>,
    observable: ReturnType<ActionObservableFactory<S>>
}

type ActionPairs<S = any> = Pair<string, ActionPair<S>>;

export function createActionPairs<S = any>(actionFactories: ActionObservableFactoryMap<S>): ActionPairs<S>;

export function createActions<S = any>(actionPairs: ActionPairs<S>): ActionMap<S>;

interface StateProduct<S = any, A = any> {
    state$: Observable<S>,
    actions: { [K in keyof A]: Action<S> },
    initialState: S
}

type ExtractState<S extends StateProduct> = S['initialState'];
type ExtractActions<S extends StateProduct> = S['actions'];

export function createState<S = any, A = any>(
    initialState: S,
    actionFactories: A
): StateProduct<S, A>;

export function createMergedState<T extends StateProduct>(s0: T): StateProduct<ExtractState<T>>;
export function createMergedState<T extends StateProduct, A extends StateProduct>(s0: T, s1: A): StateProduct<ExtractState<T> & ExtractState<A>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct>(s0: T, s1: A, s2: B): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct>(s0: T, s1: A, s2: B, s3: C): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D, s5: E): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D, s5: E, s6: F): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D, s5: E, s6: F, s7: G): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct, H extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D, s5: E, s6: F, s7: G, s8: H): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G> & ExtractState<H>>;
export function createMergedState<T extends StateProduct, A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct, H extends StateProduct, I extends StateProduct>(s0: T, s1: A, s2: B, s3: C, s4: D, s5: E, s6: F, s7: G, s8: H, s9: I): StateProduct<ExtractState<T> & ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G> & ExtractState<H> & ExtractState<I>>;

export function resetState(...states: StateProduct[]): void;

interface Select<S = any> {
    (fragment: S): any
}

type Selector<S = any> = Select<S> | false;

interface WithStoreDecorator {
    <C extends React.ComponentClass>(c: C): C,
    <C extends React.FunctionComponent>(c: C): C,
}

export function withStore<A extends StateProduct>(states: [A], stateSelector?: Selector<ExtractState<A>>, actionsSelector?: Selector<ExtractActions<A>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct>(states: [A, B], stateSelector?: Selector<ExtractState<A> & ExtractState<B>> , actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct>(states: [A, B, C], stateSelector?: Selector<ExtractState<A> & ExtractActions<B> & ExtractActions<C>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct>(states: [A, B, C, D], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct>(states: [A, B, C, D, E], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct>(states: [A, B, C, D, E, F], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E> & ExtractActions<F>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct>(states: [A, B, C, D, E, F, G], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E> & ExtractActions<F> & ExtractActions<G>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct, H extends StateProduct>(states: [A, B, C, D, E, F, G, H], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G> & ExtractState<H>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E> & ExtractActions<F> & ExtractActions<G> & ExtractActions<H>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct, H extends StateProduct, I extends StateProduct>(states: [A, B, C, D, E, F, G, H, I], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G> & ExtractState<H> & ExtractState<I>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E> & ExtractActions<F> & ExtractActions<G> & ExtractActions<H> & ExtractActions<I>>): WithStoreDecorator;
export function withStore<A extends StateProduct, B extends StateProduct, C extends StateProduct, D extends StateProduct, E extends StateProduct, F extends StateProduct, G extends StateProduct, H extends StateProduct, I extends StateProduct, J extends StateProduct>(states: [A, B, C, D, E, F, G, H, I, J], stateSelector?: Selector<ExtractState<A> & ExtractState<B> & ExtractState<C> & ExtractState<D> & ExtractState<E> & ExtractState<F> & ExtractState<G> & ExtractState<H> & ExtractState<I> & ExtractState<J>>, actionsSelector?: Selector<ExtractActions<A> & ExtractActions<B> & ExtractActions<C> & ExtractActions<D> & ExtractActions<E> & ExtractActions<F> & ExtractActions<G> & ExtractActions<H> & ExtractActions<I> & ExtractActions<J>>): WithStoreDecorator;
