import * as React from "react";
import {render} from "react-dom";
import {StageComponent} from "../src";

const Shape = createjs.Shape;
const Stage = createjs.Stage;
import {BitmapComponent, ContainerComponent, ShapeComponent, TextComponent} from "../src";

class IndexComponent extends React.Component {
    image;
    stage;
    shape;
    state = {
        bitmapX: 0,
        bitmapY: 0
    };

    constructor(props) {
        super(props);
        this.image = new Image();
    }

    componentDidMount() {
        this.image.src = "public/img/loilo.png";
        this.image.onload = () => {
            this.onTick();
            this.stage.update();
        };
        setInterval(this.update.bind(this), 32);
    }

    update() {
        this.onTick();
        this.stage.update();
    }

    onTick() {
        this.shape.graphics
            .clear()
            .beginStroke("red")
            .drawRect(0, 0, 100, 100)
            .endStroke();
    }

    onDown(ev) {
        console.log("onDown");
        this.setState({
            bitmapX: ev.stageX,
            bitmapY: ev.stageY
        })
    }

    onPressMove(ev) {
        this.setState({
            bitmapX: ev.stageX,
            bitmapY: ev.stageY
        })
    }

    onPressUp(ev) {
        console.log("onUp");
    }

    _render() {
        // obsolete way.
        const stage = new createjs.Stage("canvas");
        const bitmap = new createjs.Bitmap(this.image);
        const shape = new createjs.Shape();
        const container = new createjs.Container();
        const text = new createjs.Text();
        text.font = "20pt Arial";
        text.color = "white";
        text.text = "hello world!";
        container.addChild(text);
        container.x = 100;
        container.y = 200;
        stage.addChild(bitmap, shape, container);
    }

    render() {
        return (
            <StageComponent
                autoClear={true}
                ref={n => {
                    if (!n) return;
                    this.stage = n._stage
                }}
                width={1024} height={768}
            >
                <BitmapComponent image={this.image}
                                 x={this.state.bitmapX}
                                 y={this.state.bitmapY}
                                 onMouseDown={this.onDown.bind(this)}
                                 onPressMove={this.onPressMove.bind(this)}
                                 onPressUp={this.onPressUp.bind(this)}
                />
                <ShapeComponent ref={n => {
                    if (!n) return;
                    this.shape = n.getPublicInstance();
                }}/>
                <ContainerComponent x={100} y={200}>
                    <TextComponent
                        font={"20pt Arial"}
                        color={"white"}
                        text={"hello world!"}/>
                </ContainerComponent>
            </StageComponent>
        )
    }
}

render(
    <IndexComponent/>,
    document.getElementById("main")
);
