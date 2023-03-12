
import { ReduxComponent } from "../../cocos-redux/connect/redux_component";

const { ccclass } = cc._decorator;

const renderPrefab = async ({ src }): Promise<cc.Node> => new Promise((resolve, reject) => {
  cc.resources.load<cc.Prefab>(src, cc.Prefab, (err, prefab) => {
    if (err) {
      console.warn('加载prefab失败，src：', src);
      console.error(err);
      reject(err);
      return;
    }

    const node = cc.instantiate(prefab);
    resolve(node);
  })
});

interface RenderBaseComponentParams<TPROPS> {
  containerNode?: cc.Node;
  props?: TPROPS;
}

@ccclass
class BaseComponent<TPROPS> extends cc.Component implements ReduxComponent {
  props: TPROPS;

  updateProps = (props: Partial<TPROPS>) => {
    this.props = {
      ...this.props,
      ...props,
    };
    return this.render();
  };

  render() {}

  static instantiateCreator =
    <TPROPS, TComponent extends BaseComponent<TPROPS>>(prefabPath: string) =>
    async (
      params: RenderBaseComponentParams<TPROPS>,
    ): Promise<{ node: cc.Node; component?: TComponent }> => {
      const node = await renderPrefab({ src: prefabPath });
      const component = node.getComponent(BaseComponent) as TComponent;

      if (!component) {
        console.warn(`prefab 上没有挂载BaseComponent组件，prefabPath: ${prefabPath}`);
      } else if (params.props) {
        component.updateProps(params.props);
      }
      if (cc.isValid(params.containerNode)) {
        params.containerNode.addChild(node);
      }

      return {
        node,
        component,
      };
    };
}

export { renderPrefab };

export default BaseComponent;
