import * as React from "react";
import { render } from "react-dom";
import { StageComponent } from "../src";
import { Rectangle, Shape, Stage } from "@createjs/easeljs";
import { BitmapComponent, ContainerComponent, ShapeComponent, TextComponent } from "../src";

class IndexComponent extends React.Component {
    stage;
    setStageRef = n => this.stage = n.stage;
    shape;
    setShapeRef = n => this.shape = n.getPublicInstance();
    state = {
        bitmapX: 0,
        bitmapY: 0,
        textColor: "white",
        image: null
    };

    componentDidMount() {
        console.log("containerDidMount");
        const image = new Image();
        image.src = "public/img/mandrill.png";
        image.onload = () => {
            this.setState({ image });
        };
        setInterval(() => {
            this.update();
        }, 16);
    }

    onContainerMounted = (stage) => {
        console.log("onContainerMounted: childCnt=", stage.children.length)
    };

    onContainerUpdated = (stage) => {
        console.log("onContainerUpdated");
    };

    update() {
        const bounds = this.shape.getBounds();
        this.shape.graphics
            .clear()
            .beginStroke("red")
            .drawRect(bounds.x, bounds.y, bounds.width, bounds.height)
            .endStroke();
        this.stage.update();
    }

    points = [];
    onDown = (ev) => {
        console.log("onDown");
        this.points = [];
        this.points.push({
            x: ev.stageX, y: ev.stageY
        });
        this.setState({
            textColor: "red"
        })
    };

    onPressMove = (ev) => {
        this.points.push({
            x: ev.stageX, y: ev.stageY
        });
        const len = this.points.length;
        let [prev, curr] = [this.points[len - 2], this.points[len - 1]];
        let [dx, dy] = [curr.x - prev.x, curr.y - prev.y];
        this.setState({
            bitmapX: this.state.bitmapX + dx,
            bitmapY: this.state.bitmapY + dy
        });
    };

    onPressUp = (ev) => {
        this.points.push({
            x: ev.stageX, y: ev.stageY
        });
        console.log("onUp");
        this.setState({
            textColor: "white"
        });
    };

    render() {
        return (
            <StageComponent
                autoClear={true}
                ref={this.setStageRef}
                width={1024} height={768}
                onContainerMounted={this.onContainerMounted}
                onContainerUpdated={this.onContainerUpdated}
            >
                <BitmapComponent image={this.state.image}
                    x={this.state.bitmapX}
                    y={this.state.bitmapY}
                    onMouseDown={this.onDown}
                    onPressMove={this.onPressMove}
                    onPressUp={this.onPressUp} />
                <ShapeComponent ref={this.setShapeRef}
                    bounds={new Rectangle(0, 0, 100, 100)} />
                <ContainerComponent x={100} y={200}>
                    <TextComponent
                        font={"20pt Arial"}
                        color={this.state.textColor}
                        text={"hello world!"} />
                </ContainerComponent>
            </StageComponent>
        )
    }
}

render(
    <IndexComponent />,
    document.getElementById("main")
);
