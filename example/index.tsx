import * as React from "react";
import {render} from "react-dom";
import {StageComponent} from "../src";
import {setInterval} from "timers";
import Shape = createjs.Shape;
import Stage = createjs.Stage;
import {BitmapComponent, ShapeComponent} from "../src/types";

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

    render() {
        return (
            <StageComponent
                autoClear={true}
                ref={n => this.stage = n._stage}
                width={1024} height={768}
            >
                <BitmapComponent image={this.image}/>
                <ShapeComponent ref={n => this.shape = n.getPublicInstance()} />
            </StageComponent>
        )
    }
}

render(
    <IndexComponent/>,
    document.getElementById("main")
);