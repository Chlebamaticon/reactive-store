// Type defintions for reactive-store v0.0.2
// Project: https://github.com/dawiidio/reactive-store
// Definitions by: Jakub Chlebowicz <https://github.com/chlebamaticon/>
/// <reference types="react" />
/// <reference types="rxjs" />

import * as React from 'react';
import { Subject, Observable, Observer } from 'rxjs';

type Pair<T1, T2> = [ T1, T2 ];

type State = any;

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

interface StateProduct<S extends State = State> {
  state$: Observable<S>,
  actions: ActionMap<S>,
  initialState: S
}

type ExtractState<S extends StateProduct> = S['initialState'];

export function createState<S extends State = State>(
  initialState: S, 
  actionFactories: ActionObservableFactoryMap<S>
): StateProduct<S>;

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