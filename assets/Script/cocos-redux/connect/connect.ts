import { connectAdvanced } from '../components/connect_advanced';
import shallowEqual from '../utils/shallow_equal';
import { mapDispatchToPropsFactory as defaultMapDispatchToPropsFactory } from './map_dispatch_to_props';
import { mapStateToPropsFactory as defaultMapStateToPropsFactories } from './map_state_to_props';
import { mergePropsFactory as defaultMergePropsFactory } from './merge_props';
import defaultSelectorFactory from './selector_factory';
import type { MapStateToPropsParam, MapDispatchToPropsParam, MergeProps } from './selector_factory';

function strictEqual(a: unknown, b: unknown) {
  return a === b;
}

// createConnect with default args builds the 'official' connect behavior. Calling it with
// different options opens up some testing and extensibility scenarios
export function createConnect(
  store,
  {
    connectHOC = connectAdvanced,
    mapStateToPropsFactory = defaultMapStateToPropsFactories,
    mapDispatchToPropsFactory = defaultMapDispatchToPropsFactory,
    mergePropsFactory = defaultMergePropsFactory,
    selectorFactory = defaultSelectorFactory,
  } = {},
) {
  return function connect<
    TStateProps = {},
    TDispatchProps = {},
    TOwnProps = {},
    TMergedProps = {},
    State = unknown,
  >(
    mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
    mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps> | undefined,
    mergeProps: MergeProps<TStateProps, TDispatchProps, TOwnProps, TMergedProps>,
    {
      pure = true,
      areStatesEqual = strictEqual,
      areOwnPropsEqual = shallowEqual,
      areStatePropsEqual = shallowEqual,
      areMergedPropsEqual = shallowEqual,
      ...extraOptions
    } = {
      pure: true,
      areStatesEqual: strictEqual,
      areOwnPropsEqual: shallowEqual,
      areStatePropsEqual: shallowEqual,
      areMergedPropsEqual: shallowEqual,
    },
  ) {
    const initMapStateToProps = mapStateToPropsFactory(mapStateToProps);
    const initMapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToProps);
    const initMergeProps = mergePropsFactory(mergeProps);

    return connectHOC(store, selectorFactory, {
      // used in error messages
      methodName: 'connect',

      // used to compute Connect's displayName from the wrapped component's displayName.
      getDisplayName: name => `Connect(${name})`,

      // if mapStateToProps is falsy, the Connect component doesn't subscribe to store state changes
      shouldHandleStateChanges: Boolean(mapStateToProps),

      // passed through to selectorFactory
      initMapStateToProps,
      initMapDispatchToProps,
      initMergeProps,
      pure,
      areStatesEqual,
      areOwnPropsEqual,
      areStatePropsEqual,
      areMergedPropsEqual,

      // any extra options args can override defaults of connect or connectAdvanced
      ...extraOptions,
    });
  };
}

export default createConnect;
