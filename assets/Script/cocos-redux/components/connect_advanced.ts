import type { Store, Dispatch, Action } from 'redux';

import { createSubscription } from '../utils/subscription';
import defaultSelectorFactory, {
  InitOptions,
  WrappedMapStateToProps,
  WrappedMapDispatchToProps,
  MergeProps,
  SelectorFactoryOptions,
  ComponentType,
} from '../connect/selector_factory';

export interface ConnectOptions<
  State = unknown,
  TStateProps = {},
  TDispatchProps = {},
  TOwnProps = {},
  TMergedProps = {},
> {
  storeKey?: string;
  methodName?: string;
  pure?: boolean;
  shouldHandleStateChanges?: boolean;
  getDisplayName?: (name: string) => string;

  initMapStateToProps: (
    dispatch: Dispatch<Action<unknown>>,
    options: InitOptions<TStateProps, TOwnProps, TMergedProps, State>,
  ) => WrappedMapStateToProps<TStateProps, TOwnProps, State>;
  initMapDispatchToProps: (
    dispatch: Dispatch<Action<unknown>>,
    options: InitOptions<TStateProps, TOwnProps, TMergedProps, State>,
  ) => WrappedMapDispatchToProps<TDispatchProps, TOwnProps>;
  initMergeProps: (
    dispatch: Dispatch<Action<unknown>>,
    options: InitOptions<TStateProps, TOwnProps, TMergedProps, State>,
  ) => MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>;

  areStatesEqual: (nextState: State, prevState: State) => boolean;

  areOwnPropsEqual: (nextOwnProps: TOwnProps, prevOwnProps: TOwnProps) => boolean;

  areStatePropsEqual: (nextStateProps: TStateProps, prevStateProps: TStateProps) => boolean;
  areMergedPropsEqual: (nextMergedProps: TMergedProps, prevMergedProps: TMergedProps) => boolean;
}

// Attempts to stringify whatever not-really-a-component value we were given
// for logging in an error message
const stringifyComponent = (Comp: unknown) => {
  try {
    return JSON.stringify(Comp);
  } catch (err) {
    return String(Comp);
  }
};

const isParentClass = (type: any, parentType: any) => {
  let _type = type;
  while (_type) {
    if (_type === parentType) {
      return true;
    }
    _type = _type.__proto__;
  }

  return false;
};

let hotReloadingVersion = 0;
// const dummyState = {};
function noop() {}
function makeSelectorStateful(sourceSelector, store) {
  // wrap the selector in an object that tracks its results between runs.
  const selector: {
    error?: any;
    shouldComponentUpdate?: boolean;
    props?: any;
    run: (props: any) => void;
  } = {
    run: function runComponentSelector(props) {
      // console.log(props)
      try {
        const nextProps = sourceSelector(store.getState(), props);
        // console.log(nextProps)
        if (nextProps !== selector.props || selector.error) {
          selector.shouldComponentUpdate = true;
          selector.props = nextProps;
          selector.error = null;
        }
      } catch (error) {
        selector.shouldComponentUpdate = true;
        selector.error = error;
        console.log(error);
      }
    },
  };

  return selector;
}

const connectAdvanced = <
  TStateProps = {},
  TDispatchProps = {},
  TOwnProps = {},
  TMergedProps = {},
  State = unknown,
>(
  /*
    selectorFactory is a func that is responsible for returning the selector function used to
    compute new props from state, props, and dispatch. For example:

      export default connectAdvanced((dispatch, options) => (state, props) => ({
        thing: state.things[props.thingId],
        saveThing: fields => dispatch(actionCreators.saveThing(props.thingId, fields)),
      }))(YourComponent)

    Access to dispatch is provided to the factory so selectorFactories can bind actionCreators
    outside of their selector as an optimization. Options passed to connectAdvanced are passed to
    the selectorFactory, along with displayName and WrappedComponent, as the second argument.

    Note that selectorFactory is responsible for all caching/memoization of inbound and outbound
    props. Do not use connectAdvanced directly without memoizing results between calls to your
    selector, otherwise the Connect component will re-render on every state or props change.
  */

  //  NEW: for cocos-redux
  store: Store,

  selectorFactory: typeof defaultSelectorFactory,
  // options object:
  {
    // the func used to compute this HOC's displayName from the wrapped component's displayName.
    // probably overridden by wrapper functions such as connect()
    getDisplayName = name => `ConnectAdvanced(${name})`,

    // shown in error messages
    // probably overridden by wrapper functions such as connect()
    methodName = 'connectAdvanced',

    // if defined, the name of the property passed to the wrapped element indicating the number of
    // calls to render. useful for watching in react devtools for unnecessary re-renders.
    // renderCountProp = undefined,

    // determines whether this HOC subscribes to store changes
    shouldHandleStateChanges = true,

    // the key of props/context to get the store
    storeKey = 'store',

    // if true, the wrapped element is exposed by this HOC via the getWrappedInstance() function.
    // withRef = false,

    // additional options are passed through to the selectorFactory
    ...connectOptions
  }: ConnectOptions<State, TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
) => {
  const UPDATERKEY = 'render';

  // const subscriptionKey = `${storeKey}Subscription`;
  const version = hotReloadingVersion++;

  return function wrapWithConnect<T extends ComponentType>(WrappedComponent: T): T {
    if (!isParentClass(WrappedComponent, cc.Component)) {
      throw new Error(
        `You must pass a component to the function returned by ${methodName}. Instead received ${
          WrappedComponent.name
        } ${stringifyComponent(WrappedComponent)}`,
      );
    }

    const wrappedComponentName = WrappedComponent.name || 'prototypeObject';

    const displayName = getDisplayName(wrappedComponentName);

    const selectorFactoryOptions: SelectorFactoryOptions<
      TStateProps,
      TOwnProps,
      TDispatchProps,
      TMergedProps,
      State
    > = {
      ...connectOptions,
      // methodName,
      // renderCountProp,
      shouldHandleStateChanges,
      // storeKey,
      // withRef,
      displayName,
      wrappedComponentName,
      WrappedComponent,
    };
    class ConnectComponent extends WrappedComponent {
      __version: number;
      __state = null;
      __renderCount = 0;
      __store: Store = null;
      props = null;
      __selector = null;
      __subscription = null;
      // __notifyNestedSubs = null;

      onLoad() {
        this.__version = version;
        this.__state = {};
        this.__renderCount = 0;
        this.__store = store;

        // this.__setWrappedInstance = this.__setWrappedInstance.bind(this)
        if (!this.__store) {
          throw new Error(
            `Could not find "${storeKey}" in either the context or props of "${displayName}". Either wrap the root component in a <Provider>, or explicitly pass "${storeKey}" as a prop to "${displayName}".`,
          );
        }

        this.__initSelector();
        this.__initSubscription();
        super.onLoad?.();
      }

      start() {
        if (shouldHandleStateChanges) {
          this.__subscription.trySubscribe();
          this.__selector.run({});
          if (this.__selector.shouldComponentUpdate) {
            this.props = this.__selector.props;
            // this[UPDATERKEY]()
            // this.__selector.shouldComponentUpdate = false
          }
        }

        super.start?.();
      }

      onDestroy() {
        if (this.__subscription) this.__subscription.tryUnsubscribe();
        this.__subscription = null;
        // this.__notifyNestedSubs = noop;
        this.__store = null;
        this.props = null;
        this.__selector.run = noop;
        this.__selector.shouldComponentUpdate = false;

        super.onDestroy?.();
      }

      __initSelector = () => {
        const sourceSelector = selectorFactory(store.dispatch, selectorFactoryOptions);
        this.__selector = makeSelectorStateful(sourceSelector, this.__store);
        this.__selector.run({});
        this.props = this.__selector.props;
      };

      __initSubscription = () => {
        if (!shouldHandleStateChanges) return;

        // parentSub's source should match where store came from: props vs. context. A component
        // connected to the store via props shouldn't use subscription from context, or vice versa.
        // const parentSub = (this.propsMode ? this.props : this.context)[subscriptionKey]
        this.__subscription = createSubscription(this.__store, null, this.__onStateChange);

        // `notifyNestedSubs` is duplicated to handle the case where the component is  unmounted in
        // the middle of the notification loop, where `this.subscription` will then be null. An
        // extra null check every change can be avoided by copying the method onto `this` and then
        // replacing it with a no-op on unmount. This can probably be avoided if Subscription's
        // listeners logic is changed to not call listeners that have been unsubscribed in the
        // middle of the notification loop.
        // this.__notifyNestedSubs = this.subscription.notifyNestedSubs.bind(this.__subscription)
      };

      __onStateChange = () => {
        const selector = this.__selector;
        selector.run({});

        if (selector.error) {
          throw selector.error;
        }

        if (selector.shouldComponentUpdate) {
          this.props = this.__selector.props;
          // console.log(this.props)
          if (typeof this[UPDATERKEY] === 'function') {
            this[UPDATERKEY]();
          }
          selector.shouldComponentUpdate = false;
        }
      };

      __isSubscribed = () => Boolean(this.__subscription) && this.__subscription.isSubscribed();
    }

    return ConnectComponent;
  };
};

export { connectAdvanced };
