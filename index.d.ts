import * as React from "react";
import { CanvasHTMLAttributes } from "react";
import {
    Bitmap,
    BitmapCache,
    Container,
    DisplayObject,
    Filter,
    Graphics,
    Matrix2D,
    Rectangle,
    Shadow,
    Shape,
    Stage,
    MouseEvent
} from "@createjs/easeljs"

export type DisplayObjectProps = {
    // properties
    alpha?: number;
    bitmapCache?: BitmapCache;
    cacheCanvas?: HTMLCanvasElement | Object;
    cacheID?: number;
    compositeOperation?: string;
    cursor?: string;
    filters?: Filter[];
    hitArea?: DisplayObject;
    id?: number;
    mask?: Shape;
    mouseEnabled?: boolean;
    name?: string;
    //parent: Container;
    regX?: number;
    regY?: number;
    rotation?: number;
    scaleX?: number;
    scaleY?: number;
    shadow?: Shadow;
    skewX?: number;
    skewY?: number;
    snapToPixel?: boolean;
    stage?: Stage;
    tickEnabled?: boolean;
    transformMatrix?: Matrix2D;
    visible?: boolean;
    x?: number;
    y?: number;
    onAdded?: (ev: MouseEvent) => void
    onClick?: (ev: MouseEvent) => void
    onDblClick?: (ev: MouseEvent) => void
    onMouseDown?: (ev: MouseEvent) => void
    onMouseOut?: (ev: MouseEvent) => void
    onMouseOver?: (ev: MouseEvent) => void
    onPressMove?: (ev: MouseEvent) => void
    onPressUp?: (ev: MouseEvent) => void
    onRemoved?: () => void
    onRollOut?: (ev: MouseEvent) => void
    onRollOver?: (ev: MouseEvent) => void
    onTick?: () => void
    // easeljs-react extended
    bounds?: { x: number, y: number, width: number, height: number }
}

export class DisplayObjectComponent<N extends DisplayObject, P = {}> extends React.Component<P & DisplayObjectProps> {
    getPublicInstance(): N
}

export type StageProps = {
    autoClear?: boolean;
    canvas?: HTMLCanvasElement | Object;
    drawRect?: Rectangle;
    handleEvent?: Function;
    mouseInBounds?: boolean;
    mouseMoveOutside?: boolean;
    mouseX?: number;
    mouseY?: number;
    nextStage?: Stage;
    onStageMouseDown?: (ev: MouseEvent) => void
    onStageMouseMove?: (ev: MouseEvent) => void
    onStageMouseUp?: (ev: MouseEvent) => void
    onMouseEnter?: (ev: MouseEvent) => void
    onMouseLeave?: (ev: MouseEvent) => void
    onTickStart?: (ev: MouseEvent) => void
    onTickEnd?: (ev: MouseEvent) => void
    onDrawStart?: (ev: MouseEvent) => void
    onDrawEnd?: (ev: MouseEvent) => void
    // easeljs-react extended
    onContainerMounted?: (stage: Stage) => void
    onContainerUpdated?: (stage: Stage) => void
}

export class StageComponent extends React.Component<StageProps & CanvasHTMLAttributes<HTMLCanvasElement>> {
    readonly stage: Stage;
}

export class ContainerComponent extends DisplayObjectComponent<Container, {
    //children: DisplayObject[];
    mouseChildren?: boolean;
    //numChildren: number;
    tickChildren?: boolean;
}> {
}

export class ShapeComponent extends DisplayObjectComponent<Shape, {
    graphics?: Graphics
}> {
}

export class BitmapComponent extends DisplayObjectComponent<Bitmap, {
    image: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement;
    sourceRect?: Rectangle;
}> {
}

export type TextProps = {
    color?: string;
    font?: string;
    lineHeight?: number;
    lineWidth?: number;
    maxWidth?: number;
    outline?: number;
    text: string;
    textAlign?: string;
    textBaseline?: string;
} & DisplayObjectProps;

export class TextComponent extends DisplayObjectComponent<Text, TextProps> {
}
