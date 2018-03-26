import * as React from "react";
import {render} from "react-dom";
import {StageComponent} from "../src";
import Shape = createjs.Shape;
import {BitmapComponent, ContainerComponent, ShapeComponent, TextComponent} from "../src/types";
import Stage = createjs.Stage;

class IndexComponent extends React.Component {
    image;
    stage: Stage;
    shape: Shape;

    constructor(props) {
        super(props);
        this.image = new Image();
    }

    componentDidMount() {
        this.image.src = "public/img/loilo.png";
        this.image.onload = () => {
            this.onTick();
            this.stage.update();
        }
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
                ref={n => this.stage = n._stage}
                width={1024} height={768}
            >
                <BitmapComponent image={this.image}/>
                <ShapeComponent ref={n => this.shape = n.getPublicInstance()}/>
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
