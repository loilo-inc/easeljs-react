import DisplayObject = createjs.DisplayObject;
import Container = createjs.Container;
import Stage = createjs.Stage;
import * as React from "react";
import * as ReactFiberReconciler from 'react-reconciler';
import {requestIdleCallback} from './ric';
import {now} from "./now";
import {getClosestInstanceFromNode} from './dom-tree';
import {StageComponent, StageProps} from "../index";
import {CanvasHTMLAttributes} from "react";

const kPropsToSkip = {children: true, ref: true, key: true, style: true};

let warningShowed = false;

function storedEventHandlerKey(ev) {
    return `__easeljs_react_wrapped_event_listener:${ev}`;
}

function applyNodeProps(instance: DisplayObject, props, oldProps = {}) {
    if (!warningShowed && 'id' in props) {
        const message = `easeljs-react: You are using "id" attribute for a easeljs node. In some very rare cases it may produce bugs. Currently we recommend not to use it and use "name" attribute instead.
You are using id = "${props.id}"`;
        console.warn(message);
        warningShowed = true;
    }

    const updatedProps = {};
    let hasUpdates = false;
    for (const key in oldProps) {
        if (kPropsToSkip[key]) {
            continue;
        }
        // events
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
        if (key === "bounds") {
            const bounds = props[key] || {x: null};
            instance.setBounds(bounds.x, bounds.y, bounds.width, bounds.height);
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
    //TODO: should update be done manually?
    const {stage} = node;
    if (stage) {
        stage.update();
    }
}

const UPDATE_SIGNAL = {};
const kEmptyObject = Object.freeze({});
const Renderer = ReactFiberReconciler({
    appendInitialChild(parentInstance: Container, child: DisplayObject) {
        if (typeof child === 'string') {
            // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
            throw new Error(`Don not use plain text as child of Konva.Node. You are using text: "${child}"`);
        }
        parentInstance.addChild(child);

        updatePicture(parentInstance);
    },

    createInstance(type: string, props: { [key: string]: any }, internalInstanceHandle) {
        const NodeClass = createjs[type];
        if (!NodeClass) {
            throw new Error(`createjs does not support the type "${type}"`);
        }

        const instance = new NodeClass();
        instance._applyProps = applyNodeProps;
        instance._applyProps(instance, props);

        return instance;
    },

    createTextInstance(text, rootContainerInstance, internalInstanceHandle) {
        throw new Error('Text components are not supported for now in easeljs-react. Use "TextComponent" instead.');
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
        return kEmptyObject;
    },

    getChildHostContext() {
        return kEmptyObject;
    },

    scheduleDeferredCallback: requestIdleCallback,

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

        insertBefore(parentInstance: Container, child: DisplayObject, beforeChild: DisplayObject) {
            if (child === beforeChild) {
                throw new Error('easeljs-react: Can not insert node before itself');
            }
            if (child.parent) {
                child.parent.removeChild(child);
            }
            const idx = parentInstance.getChildIndex(beforeChild);
            parentInstance.addChildAt(child, idx);
            updatePicture(parentInstance);
        },

        insertInContainerBefore(parentInstance: Container, child: DisplayObject, beforeChild: DisplayObject) {
            if (child === beforeChild) {
                throw new Error('easeljs-react: Can not insert node before itself');
            }
            if (child.parent) {
                child.parent.removeChild(child);
            }
            const idx = parentInstance.getChildIndex(beforeChild);
            parentInstance.addChildAt(child, idx);
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
    rendererPackageName: 'easeljs-react',
    getInspectorDataForViewTag: (...args) => {
        console.log(args);
    }
});

class StageComponentImpl
    extends React.Component<StageProps & CanvasHTMLAttributes<HTMLCanvasElement>>
    implements StageComponent {
    private _stage: createjs.Stage;
    get stage() {
        return this._stage;
    }

    private _mountNode;
    private _tagRef;

    componentDidMount() {
        this._stage = new createjs.Stage(this._tagRef);
        applyNodeProps(this._stage, this.props);
        this._mountNode = Renderer.createContainer(this._stage);
        Renderer.updateContainer(this.props.children, this._mountNode, this);
    }

    componentDidUpdate(prevProps, prevState) {
        applyNodeProps(this._stage, this.props, prevProps);
        Renderer.updateContainer(this.props.children, this._mountNode, this);
    }

    componentWillUnmount() {
        Renderer.updateContainer(null, this._mountNode, this);
        this._stage.clear();
    }

    render() {
        const {width, height} = this.props;
        return (
            <canvas
                className={this.props.className}
                ref={ref => (this._tagRef = ref)}
                width={~~width}
                height={~~height}
            />
        );
    }
}

export {StageComponentImpl as StageComponent}
export * from "./types";
