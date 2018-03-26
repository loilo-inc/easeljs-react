import DisplayObject = createjs.DisplayObject;
import Container = createjs.Container;
import Stage = createjs.Stage;
import Rectangle = createjs.Rectangle;
import * as React from "react";
import * as emptyObject from "fbjs/lib/emptyobject"
import * as ReactFiberReconciler from 'react-reconciler';
import {now, rIC} from './scheduling';
import * as invariant from "fbjs/lib/invariant";
import {getClosestInstanceFromNode} from './dom-tree';
import {StageComponent, StageProps} from "../index";

const kPropsToSkip = {children: true, ref: true, key: true, style: true};

let warningShowed = false;
function storedEventHandlerKey(ev) {
 return  "__easeljs_react_wrapped_event_listener:"+ev;
}
function applyNodeProps(instance: DisplayObject, props, oldProps = {}) {
    if (!warningShowed && 'id' in props) {
        const message = `ReactKonva: You are using "id" attribute for a Konva node. In some very rare cases it may produce bugs. Currently we recommend not to use it and use "name" attribute instead.
You are using id = "${props.id}".
For me info see: https://github.com/lavrton/react-konva/issues/119`;
        console.warn(message);
        warningShowed = true;
    }

    const updatedProps = {};
    let hasUpdates = false;
    for (const key in oldProps) {
        if (kPropsToSkip[key]) {
            continue;
        }
        // onXXX系のイベント
        const isEvent = key.slice(0, 2) === 'on';
        const propChanged = oldProps[key] !== props[key];
        if (isEvent && propChanged) {
            let eventName = key.substr(2).toLowerCase();
            const func = instance[storedEventHandlerKey(key)];
            if (func) {
                instance.off(eventName, func);
            }
        }
        const toRemove = !props.hasOwnProperty(key);
        if (toRemove) {
            updatedProps[key] = void 0;
        }
    }
    for (const key in props) {
        if (kPropsToSkip[key]) {
            continue;
        }
        const isEvent = key.slice(0, 2) === 'on';
        const toAdd = oldProps[key] !== props[key];
        if (isEvent && toAdd) {
            let eventName = key.substr(2).toLowerCase();
            if (props[key]) {
                const listener = instance.on(eventName, props[key]);
                instance[storedEventHandlerKey(key)] = listener;
            }
        }
        if (
            !isEvent &&
            (props[key] !== oldProps[key] || props[key] !== instance[key])
        ) {
            hasUpdates = true;
            updatedProps[key] = props[key];
        }
    }

    if (hasUpdates) {
        instance.set(updatedProps);
        updatePicture(instance);
    }
}

function updatePicture(node: Stage | DisplayObject) {
    const {stage} = node;
    if (stage) {
        stage.update();
    }
}

const UPDATE_SIGNAL = {};

const Renderer = ReactFiberReconciler({
    appendInitialChild(parentInstance: Container, child: DisplayObject) {
        if (typeof child === 'string') {
            // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
            invariant(
                false,
                'Don not use plain text as child of Konva.Node. You are using text: "%s"',
                child
            );
            return;
        }
        parentInstance.addChild(child);

        updatePicture(parentInstance);
    },

    createInstance(type: string, props: { [key: string]: any }, internalInstanceHandle) {
        const NodeClass = createjs[type];
        if (!NodeClass) {
            invariant(null, 'createjs does not support the type "%s"', type);
            return;
        }

        const instance = new NodeClass();
        instance._applyProps = applyNodeProps;
        instance._applyProps(instance, props);

        return instance;
    },

    createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
        invariant(
            false,
            'Text components are not supported for now in createjs.'
        );
    },

    finalizeInitialChildren(domElement, type, props) {
        return false;
    },

    getPublicInstance(instance) {
        return Object.assign(instance, {
            getPublicInstance() {
                return instance
            }
        });
    },

    prepareForCommit() {
        // Noop
    },

    prepareUpdate(domElement, type, oldProps, newProps) {
        return UPDATE_SIGNAL;
    },

    resetAfterCommit() {
        // Noop
    },

    resetTextContent(domElement) {
        // Noop
    },

    shouldDeprioritizeSubtree(type, props) {
        return false;
    },

    getRootHostContext() {
        return emptyObject;
    },

    getChildHostContext() {
        return emptyObject;
    },

    scheduleDeferredCallback: rIC,

    shouldSetTextContent(type, props) {
        return false;
    },

    now: now,

    useSyncScheduling: true,

    mutation: {
        appendChild(parentInstance: Container, child: DisplayObject) {
            if (child.parent === parentInstance) {
                parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            } else {
                parentInstance.addChild(child);
            }

            updatePicture(parentInstance);
        },

        appendChildToContainer(parentInstance: Container, child: DisplayObject) {
            if (child.parent === parentInstance) {
                parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            } else {
                parentInstance.addChild(child);
            }
            updatePicture(parentInstance);
        },

        insertBefore(parentInstance: Container, child: DisplayObject, beforeChild) {
            invariant(
                child !== beforeChild,
                'createjs: Can not insert node before itself'
            );
            // remove and add back to reset zIndex
            parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            updatePicture(parentInstance);
        },

        insertInContainerBefore(parentInstance: Container, child: DisplayObject, beforeChild) {
            invariant(
                child !== beforeChild,
                'createjs: Can not insert node before itself'
            );
            // remove and add back to reset zIndex
            parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            updatePicture(parentInstance);
        },

        removeChild(parentInstance: Container, child: DisplayObject) {
            child.removeAllEventListeners();
            parentInstance.removeChild(child);
            updatePicture(parentInstance);
        },

        removeChildFromContainer(parentInstance: Container, child: DisplayObject) {
            child.removeAllEventListeners();
            parentInstance.removeChild(child);
            updatePicture(parentInstance);
        },

        commitTextUpdate(textInstance: createjs.Text, oldText: string, newText: string) {
            textInstance.text = newText;
            updatePicture(textInstance.parent);
        },

        commitMount(instance, type, newProps) {
            // Noop
        },

        commitUpdate(instance,
                     updatePayload,
                     type,
                     oldProps,
                     newProps,
                     fiberInstance) {
            instance._applyProps(instance, newProps, oldProps);
        }
    }
});

const foundDevTools = Renderer.injectIntoDevTools({
    findFiberByHostInstance: getClosestInstanceFromNode,
    bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
    version: React.version || 16,
    rendererPackageName: 'createjs-react',
    getInspectorDataForViewTag: (...args) => {
        console.log(args);
    }
});

class StageComponentImpl extends React.Component<StageProps & {
    width: number, height: number
}> implements StageComponent {
    _stage: createjs.Stage;
    get stage() {
        return this._stage;
    }

    _mountNode;
    _tagRef;

    componentDidMount() {
        const {height, width} = this.props;

        this._stage = new createjs.Stage(this._tagRef);

        applyNodeProps(this._stage, this.props);

        this._mountNode = Renderer.createContainer(this._stage);
        Renderer.updateContainer(this.props.children, this._mountNode, this);
    }

    componentDidUpdate(prevProps, prevState) {
        const props = this.props;

        applyNodeProps(this._stage, this.props, prevProps);

        Renderer.updateContainer(this.props.children, this._mountNode, this);
    }

    componentWillUnmount() {
        Renderer.updateContainer(null, this._mountNode, this);
        this._stage.clear();
    }

    getStage() {
        return this._stage;
    }

    render() {
        return (
            <canvas
                ref={ref => (this._tagRef = ref)}
                width={this.props.width}
                height={this.props.height}
            />
        );
    }
}

export { StageComponentImpl as StageComponent }
export * from "./types";