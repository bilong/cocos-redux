import BaseComponent from '../base_component/base_component';

const { ccclass, menu, property } = cc._decorator;

interface BaseBtnComponentProps {
  key?: string;
  text: string;
  textStyle?: {
    color?: cc.Color;
    fontSize?: number;
  };
  btnSize?: {
    width?: number;
    height?: number;
  };
  onClick?: (key?: string) => void;
}

@ccclass
@menu('components/BaseBtnComponent')
class BaseBtnComponent extends BaseComponent<BaseBtnComponentProps> {
  static instantiate = BaseComponent.instantiateCreator<BaseBtnComponentProps, BaseBtnComponent>(
    'prefabs/component/buttons/base_btn',
  );
  props: BaseBtnComponentProps = {
    text: 'hello, world!',
  };

  @property(cc.Label)
  label: cc.Label = null;

  handleClick() {
    this.props?.onClick?.(this.props.key);
  }

  updateProps = (props: Partial<BaseBtnComponentProps>) => {
    this.props = {
      ...this.props,
      ...props,
    };

    this.render();
  };

  render = () => {
    this.label.string = this.props.text;

    const { textStyle, btnSize } = this.props;
    if (textStyle?.color) {
      this.label.node.color = textStyle.color;
    }
    if (textStyle?.fontSize) {
      this.label.fontSize = textStyle.fontSize;
    }

    if (btnSize?.height) {
      this.node.height = btnSize.height;
    }
    if (btnSize?.width) {
      this.node.width = btnSize.width;
    }
  };
}

export default BaseBtnComponent;
export { BaseBtnComponentProps };
