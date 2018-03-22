import {DisplayObjectProps} from "./index";
import * as React from "react";
import Container = createjs.Container;
import DisplayObject = createjs.DisplayObject;
import Shape = createjs.Shape;
import Bitmap = createjs.Bitmap;
import Rectangle = createjs.Rectangle;

export class DisplayObjectComponent<N extends DisplayObject, P = {}> extends React.Component<P & DisplayObjectProps> {
    getPublicInstance(): N
    getNativeNode(): N
}

export class ContainerComponent extends DisplayObjectComponent<Container> {
}

export class ShapeComponent extends DisplayObjectComponent<Shape> {
}

export class BitmapComponent extends DisplayObjectComponent<Bitmap, {
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    sourceRect?: Rectangle;
}> {
}

export class TextComponent extends DisplayObjectComponent<createjs.Text> {
}