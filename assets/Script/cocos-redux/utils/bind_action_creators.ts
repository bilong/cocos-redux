import { ActionCreatorsMapObject, Dispatch } from 'redux';

export default function bindActionCreators(
  actionCreators: ActionCreatorsMapObject,
  dispatch: Dispatch,
): ActionCreatorsMapObject {
  const boundActionCreators: ActionCreatorsMapObject = {};

  Object.keys(actionCreators).forEach((key: string) => {
    const actionCreator = actionCreators[key];
    if (typeof actionCreator === 'function') {
      boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
    }
  });
  return boundActionCreators;
}
