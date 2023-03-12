/* eslint-disable @typescript-eslint/ban-ts-comment */
import type { Action, Dispatch } from 'redux';
import bindActionCreators from '../utils/bind_action_creators';
import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrap_map_to_props';
import { createInvalidArgFactory } from './invalid_arg_factory';
import type { MapDispatchToPropsParam } from './selector_factory';

export function mapDispatchToPropsFactory<TDispatchProps, TOwnProps>(
  mapDispatchToProps: MapDispatchToPropsParam<TDispatchProps, TOwnProps> | undefined,
) {
  if (mapDispatchToProps && typeof mapDispatchToProps === 'object') {
    // @ts-ignore
    return wrapMapToPropsConstant((dispatch: Dispatch<Action<unknown>>) =>
      // @ts-ignore
      bindActionCreators(mapDispatchToProps, dispatch),
    );
  }

  if (!mapDispatchToProps) {
    return wrapMapToPropsConstant((dispatch: Dispatch<Action<unknown>>) => ({
      dispatch,
    }));
  }
  if (typeof mapDispatchToProps === 'function') {
    // @ts-ignore
    return wrapMapToPropsFunc(mapDispatchToProps, 'mapDispatchToProps');
  }

  return createInvalidArgFactory(mapDispatchToProps, 'mapDispatchToProps');
}
