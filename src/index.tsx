import * as createjs from "@createjs/easeljs"
import { Container, DisplayObject, Stage, Text } from "@createjs/easeljs"
import * as React from "react";
import { CanvasHTMLAttributes } from "react";
import * as ReactReconciler from 'react-reconciler';
import { HostConfig } from 'react-reconciler';
import { now } from "./now";
import { getClosestInstanceFromNode } from './dom-tree';
import { StageComponent, StageProps } from "../index";

const kPropsToSkip = { children: true, ref: true, key: true, style: true };

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
            const bounds = props[key] || { x: null };
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
    // TODO: should update be done manually?
    // const { stage } = node;
    // the object spread works on dev mode, but not after build, on "create-react-app" project
    if (node.parent && node.parent.update) {
        node.parent.update.update();
    }
}

const UPDATE_SIGNAL = {};
const kEmptyObject = Object.freeze({});

class HostConfigImpl implements HostConfig<any, any, any, any, any, any, any, any, any, any, any, any> {
    appendInitialChild(parentInstance: Container, child: DisplayObject): void {
        if (typeof child === 'string') {
            // Noop for string children of Text (eg <Text>{'foo'}{'bar'}</Text>)
            throw new Error(`Don not use plain text as child of Konva.Node. You are using text: "${child}"`);
        }
        parentInstance.addChild(child);

        updatePicture(parentInstance);
    }

    cancelDeferredCallback(callbackID: any): void {
    }

    clearTimeout(handle: any): void {
    }

    createInstance(type: any, props: any, rootContainerInstance: any, hostContext: any, internalInstanceHandle: ReactReconciler.OpaqueHandle): any {
        const NodeClass = createjs[type];
        if (!NodeClass) {
            throw new Error(`createjs does not support the type "${type}"`);
        }

        const instance = new NodeClass();
        instance._applyProps = applyNodeProps;
        instance._applyProps(instance, props);

        return instance;
    }

    createTextInstance(text: string, rootContainerInstance: any, hostContext: any, internalInstanceHandle: ReactReconciler.OpaqueHandle): any {
        throw new Error('Text components are not supported for now in easeljs-react. Use "TextComponent" instead.');
    }

    finalizeInitialChildren(parentInstance: any, type: any, props: any, rootContainerInstance: any, hostContext: any): boolean {
        return false;
    }

    getChildHostContext(parentHostContext: any, type: any, rootContainerInstance: any): any {
        return kEmptyObject;
    }

    getPublicInstance(instance: any): any {
        return Object.assign(instance, {
            getPublicInstance() {
                return instance
            }
        });
    }

    getRootHostContext(rootContainerInstance: any): any {
        return kEmptyObject;
    }

    prepareForCommit(containerInfo: any): void {
        // noop
    }

    prepareUpdate(instance: any, type: any, oldProps: any, newProps: any, rootContainerInstance: any, hostContext: any): null | any {
        return UPDATE_SIGNAL;
    }

    resetAfterCommit(containerInfo: any): void {
    }

    scheduleDeferredCallback(callback: () => any, options?: { timeout: number }): any {
    }

    setTimeout(handler: (...args: any[]) => void, timeout: number): any {
        return undefined;
    }

    shouldDeprioritizeSubtree(type: any, props: any): boolean {
        return false;
    }

    shouldSetTextContent(type: any, props: any): boolean {
        return false;
    }

    appendChild(parentInstance: Container, child: DisplayObject) {
        if (child.parent === parentInstance) {
            parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
        } else {
            parentInstance.addChild(child);
        }

        updatePicture(parentInstance);
    }

    appendChildToContainer(parentInstance: Container, child: DisplayObject) {
        if (child.parent === parentInstance) {
            parentInstance.setChildIndex(child, parentInstance.numChildren - 1);
        } else {
            parentInstance.addChild(child);
        }
        updatePicture(parentInstance);
    }

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
    }

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
    }

    removeChild(parentInstance: Container, child: DisplayObject) {
        child.removeAllEventListeners();
        parentInstance.removeChild(child);
        updatePicture(parentInstance);
    }

    removeChildFromContainer(parentInstance: Container, child: DisplayObject) {
        child.removeAllEventListeners();
        parentInstance.removeChild(child);
        updatePicture(parentInstance);
    }

    commitTextUpdate(textInstance: Text, oldText: string, newText: string) {
        textInstance.text = newText;
        updatePicture(textInstance.parent);
    }

    commitMount(instance, type, newProps) {
        // Noop
    }

    commitUpdate(instance,
        updatePayload,
        type,
        oldProps,
        newProps,
        fiberInstance) {
        instance._applyProps(instance, newProps, oldProps);
    }

    isPrimaryRenderer: boolean = false;
    noTimeout: any = -1;
    supportsHydration: boolean = false;
    supportsMutation: boolean = true;
    supportsPersistence: boolean = false;

    now(): number {
        return now()
    }

}

const hostConfig = new HostConfigImpl();
const Renderer = ReactReconciler(hostConfig);

const foundDevTools = Renderer.injectIntoDevTools({
    findFiberByHostInstance: getClosestInstanceFromNode,
    bundleType: process.env.NODE_ENV !== 'production' ? 1 : 0,
    version: React.version,
    rendererPackageName: 'easeljs-react',
    getInspectorDataForViewTag: (...args) => {
        console.log(args);
        return { name: "noop" }
    }
});

class StageComponentImpl
    extends React.Component<StageProps & CanvasHTMLAttributes<HTMLCanvasElement>>
    implements StageComponent {
    private _stage: Stage;
    get stage() {
        return this._stage;
    }
    private _canvas;
    readonly setCanvasRef = n => this._canvas = n;

    private _mountNode;

    componentDidMount() {
        this._stage = new Stage(this._canvas);
        // https://stackoverflow.com/a/17172943
        createjs.Touch.enable(this._stage);
        applyNodeProps(this._stage, this.props);
        this._mountNode = Renderer.createContainer(this._stage, false, false);
        Renderer.updateContainer(this.props.children, this._mountNode, this, () => {
            if (this.props.onContainerMounted) {
                this.props.onContainerMounted(this._stage);
            }
        });
    }

    componentDidUpdate(prevProps, prevState) {
        applyNodeProps(this._stage, this.props, prevProps);
        Renderer.updateContainer(this.props.children, this._mountNode, this, () => {
            if (this.props.onContainerUpdated) {
                this.props.onContainerUpdated(this._stage);
            }
        });
    }

    componentWillUnmount() {
        Renderer.updateContainer(null, this._mountNode, this, null);
        this._stage.clear();
    }

    render() {
        const { width, height } = this.props;
        return (
            <canvas
                className={this.props.className}
                style={this.props.style}
                ref={this.setCanvasRef}
                width={~~width}
                height={~~height}
            />
        );
    }
}

export { StageComponentImpl as StageComponent }
export * from "./types";
