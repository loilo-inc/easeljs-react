"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactFiberReconciler = require("react-reconciler");
const ric_1 = require("./ric");
const now_1 = require("./now");
const dom_tree_1 = require("./dom-tree");
const kPropsToSkip = { children: true, ref: true, key: true, style: true };
let warningShowed = false;
function storedEventHandlerKey(ev) {
    return `__easeljs_react_wrapped_event_listener:${ev}`;
}
function applyNodeProps(instance, props, oldProps = {}) {
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
        const isEvent = key.slice(0, 2) === 'on';
        const toAdd = oldProps[key] !== props[key];
        if (isEvent && toAdd) {
            let eventName = key.substr(2).toLowerCase();
            if (props[key]) {
                const listener = instance.on(eventName, props[key]);
                instance[storedEventHandlerKey(key)] = listener;
            }
        }
        if (!isEvent &&
            (props[key] !== oldProps[key] || props[key] !== instance[key])) {
            hasUpdates = true;
            updatedProps[key] = props[key];
        }
    }
    if (hasUpdates) {
        instance.set(updatedProps);
        updatePicture(instance);
    }
}
function updatePicture(node) {
    //TODO: should update be done manually?
    const { stage } = node;
    if (stage) {
        stage.update();
    }
}
const UPDATE_SIGNAL = {};
const kEmptyObject = Object.freeze({});
const Renderer = ReactFiberReconciler({
    appendInitialChild(parentInstance, child) {
        if (typeof child === 'string') {
            // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
            throw new Error(`Don not use plain text as child of Konva.Node. You are using text: "${child}"`);
        }
        parentInstance.addChild(child);
        updatePicture(parentInstance);
    },
    createInstance(type, props, internalInstanceHandle) {
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
                return instance;
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
    scheduleDeferredCallback: ric_1.requestIdleCallback,
    shouldSetTextContent(type, props) {
        return false;
    },
    now: now_1.now,
    useSyncScheduling: true,
    mutation: {
        appendChild(parentInstance, child) {
            if (child.parent === parentInstance) {
                parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            }
            else {
                parentInstance.addChild(child);
            }
            updatePicture(parentInstance);
        },
        appendChildToContainer(parentInstance, child) {
            if (child.parent === parentInstance) {
                parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
            }
            else {
                parentInstance.addChild(child);
            }
            updatePicture(parentInstance);
        },
        insertBefore(parentInstance, child, beforeChild) {
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
        insertInContainerBefore(parentInstance, child, beforeChild) {
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
        removeChild(parentInstance, child) {
            child.removeAllEventListeners();
            parentInstance.removeChild(child);
            updatePicture(parentInstance);
        },
        removeChildFromContainer(parentInstance, child) {
            child.removeAllEventListeners();
            parentInstance.removeChild(child);
            updatePicture(parentInstance);
        },
        commitTextUpdate(textInstance, oldText, newText) {
            textInstance.text = newText;
            updatePicture(textInstance.parent);
        },
        commitMount(instance, type, newProps) {
            // Noop
        },
        commitUpdate(instance, updatePayload, type, oldProps, newProps, fiberInstance) {
            instance._applyProps(instance, newProps, oldProps);
        }
    }
});
const foundDevTools = Renderer.injectIntoDevTools({
    findFiberByHostInstance: dom_tree_1.getClosestInstanceFromNode,
    bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
    version: React.version || 16,
    rendererPackageName: 'easeljs-react',
    getInspectorDataForViewTag: (...args) => {
        console.log(args);
    }
});
class StageComponentImpl extends React.Component {
    get stage() {
        return this._stage;
    }
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
        const { width, height } = this.props;
        return (React.createElement("canvas", { className: this.props.className, ref: ref => (this._tagRef = ref), width: ~~width, height: ~~height }));
    }
}
exports.StageComponent = StageComponentImpl;
__export(require("./types"));
