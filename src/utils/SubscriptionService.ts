// Imports
import { Ref, watch, WatchStopHandle } from 'vue';

// Types
export type StateSubscriptionCallback<T> = (newState: T, oldState: T) => void;

export type StateSubscription<T> = {
  callback: StateSubscriptionCallback<T>;
  stateToMatch?: T;
  callbackOnNoMatch?: StateSubscriptionCallback<T>;
};

export type StateSubscriptionId = number;

type StateSubscriptions<T> = Record<StateSubscriptionId, StateSubscription<T>>;

export default class SubscriptionService<T> {
  private _state: Ref<T>;
  private _watcher: WatchStopHandle | null = null;
  private _subscriptions: StateSubscriptions<T> = {};
  private _nextSubscriptionId: StateSubscriptionId = 0;

  constructor(state: Ref<T>, start: boolean = true) {
    this._state = state;
    if (start) this.start();
  }

  public subscribe(
    callback: StateSubscriptionCallback<T>,
    stateToMatch?: T,
    callbackOnNoMatch?: StateSubscriptionCallback<T>,
  ): StateSubscriptionId {
    const subscriptionId = this._nextSubscriptionId;
    this._nextSubscriptionId++;

    this._subscriptions[subscriptionId] = {
      callback,
      stateToMatch,
      callbackOnNoMatch,
    };

    return subscriptionId;
  }

  public unsubscribe(subscriptionId: StateSubscriptionId): void {
    delete this._subscriptions[subscriptionId];
  }

  public stop(): void {
    if (!this._watcher) throw new Error('SubscriptionService is not running');
    this._watcher();
  }

  public start(): void {
    if (this._watcher)
      throw new Error('SubscriptionService is already running');
    this._watcher = watch(this._state, this.onStateChange.bind(this));
  }

  protected onStateChange(newState: T, oldState: T): void {
    for (const subscriptionId in this._subscriptions) {
      const subscription = this._subscriptions[subscriptionId];
      if (subscription.stateToMatch) {
        if (subscription.stateToMatch === newState) {
          subscription.callback(newState, oldState);
        } else if (subscription.callbackOnNoMatch) {
          subscription.callbackOnNoMatch(newState, oldState);
        }
      } else subscription.callback(newState, oldState);
    }
  }
}
