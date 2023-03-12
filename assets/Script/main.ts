// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

import BaseBtnComponent from './component/buttons/base_btn_component';
import reduxDemoContainer from './redux_demo/pages/redux_demo_container';

@ccclass
export class Main extends cc.Component {
  handleOpenReduxDemo = () => {
    reduxDemoContainer.instantiate({
      containerNode: this.node,
    });
  };

  protected start(): void {
    BaseBtnComponent.instantiate({
      containerNode: this.node,
      props: {
        text: '打开redux demo',
        btnSize: {
          width: 200,
        },
        onClick: this.handleOpenReduxDemo,
      },
    }).then(({ node }) => {
      const widget = node.getComponent(cc.Widget) || node.addComponent(cc.Widget);
      widget.isAlignVerticalCenter = true;
      widget.isAlignHorizontalCenter = true;
    });
  }

}
