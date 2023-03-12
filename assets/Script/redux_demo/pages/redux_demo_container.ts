import { ReduxComponent } from '../../cocos-redux/connect/redux_component';
import type {
  MapStateToPropsParam,
  MapDispatchToPropsParam,
} from '../../cocos-redux/connect/selector_factory';

import BaseComponent from '../../component/base_component/base_component';
import BaseBtnComponent from '../../component/buttons/base_btn_component';

import { connect, AppDispatch, RootState } from '../store/store_demo';
import { initMainPageAction } from '../actions/action_demo/action_demo';
import { updateUserInfo } from '../reducers/reducer_slice_demo/reducer_slice_demo';

const { ccclass, menu } = cc._decorator;

interface StateProps {
  userInfo: RootState['mainPage']['userInfo'];
}

interface DispathProps {
  updateUserInfo(payload: StateProps['userInfo']): void;
  initMainPageAction(): Promise<unknown>;
}

type MergeProps = StateProps & DispathProps;

const mapStateToProps: MapStateToPropsParam<StateProps, {}, RootState> = (state: RootState) => ({
  userInfo: state.mainPage.userInfo,
});

const mapDispatchToProps: MapDispatchToPropsParam<DispathProps, {}> = (dispatch: AppDispatch) => ({
  initMainPageAction: async () => await dispatch(initMainPageAction()),
  updateUserInfo: (payload: StateProps['userInfo']) => dispatch(updateUserInfo(payload)),
});

@ccclass
@menu('reduxDemo/reduxDemoContainer')
@connect<StateProps, DispathProps, {}, MergeProps>(mapStateToProps, mapDispatchToProps, null)
export default class reduxDemoContainer
  extends BaseComponent<MergeProps>
  implements ReduxComponent
{
  static instantiate = BaseComponent.instantiateCreator<MergeProps, reduxDemoContainer>(
    'prefabs/redux_demo_view',
  );

  props: MergeProps = {
    userInfo: { nickName: 'click to load' },
    initMainPageAction: async () => ({}),
    updateUserInfo: () => {},
  };

  // LIFE-CYCLE CALLBACKS:

  start() {
    this.render();
  }

  render() {
    this.renderClose();
    this.renderNickName();
  }

  close = () => {
    this.node.destroy();
  };

  closeBtn: BaseBtnComponent;
  async renderClose() {
    if (!this.closeBtn) {
      BaseBtnComponent.instantiate({
        containerNode: this.node,
        props: {
          text: '关闭',
          onClick: this.close,
        },
      }).then(({ component }) => {
        this.closeBtn = component;
        const widget =
          this.closeBtn.node.getComponent(cc.Widget) || this.closeBtn.node.addComponent(cc.Widget);
        widget.isAlignTop = true;
        widget.isAlignLeft = true;
        widget.top = 50;
        widget.left = 20;
      });
    }
  }

  nickNameLabel: BaseBtnComponent;
  renderNickName() {
    if (!this.nickNameLabel) {
      BaseBtnComponent.instantiate({
        containerNode: this.node,
        props: {
          text: this.props.userInfo.nickName,
          btnSize: {
            width: 200,
          },
          onClick: this.handleNickNameClick,
        },
      }).then(({ component }) => {
        this.closeBtn = component;
      });
    }
  }

  handleNickNameClick = () => {
    if (this.props.userInfo.nickName === 'click to load') {
      this.props.initMainPageAction();
      return;
    }
    const preUserInfo = this.props.userInfo;
    this.props.updateUserInfo({ nickName: 'click nickName' });
    setTimeout(() => {
      this.props?.updateUserInfo(preUserInfo);
    }, 1000);
  };

  // update (dt) {}
}
