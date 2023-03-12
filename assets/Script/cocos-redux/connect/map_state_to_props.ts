import { wrapMapToPropsConstant, wrapMapToPropsFunc } from './wrap_map_to_props';
import { createInvalidArgFactory } from './invalid_arg_factory';
import type { MapStateToPropsParam } from './selector_factory';

export function mapStateToPropsFactory<TStateProps, TOwnProps, State>(
  mapStateToProps: MapStateToPropsParam<TStateProps, TOwnProps, State>,
) {
  if (!mapStateToProps) {
    return wrapMapToPropsConstant(() => ({}));
  }

  if (typeof mapStateToProps === 'function') {
    return wrapMapToPropsFunc(mapStateToProps, 'mapStateToProps');
  }

  return createInvalidArgFactory(mapStateToProps, 'mapStateToProps');
}
