import { CircleCarousel } from "./circleImageCarousel";
import { CircleSlider } from "./circleSlider";
import { Point } from "./point";
import { Utils } from "./utils";

const defSettings = {
    sizeMultipler: 1.5,
    areItemsHtml: false,
}

export type CircleHandlersSettings = typeof defSettings;

export class CircleHandlers {
    controller: CircleCarousel;
    thumbController: CircleSlider;
    radius: number;
    center: Point;
    settings: CircleHandlersSettings;
    handlerPoints: Point[] = []

    constructor(controller: CircleCarousel, thumbController: CircleSlider, settings = defSettings) {
        this.radius = controller.size * settings.sizeMultipler / 2
        this.controller = controller;
        this.center = new Point(controller.size / 2, controller.size / 2)
        this.settings = settings
        this.thumbController = thumbController;
    }

    renderItems() {
        const points = this.generatePoints()

        let i = 0;
        for (const item of this.controller.settings.items) {
            const category = item.category;
            let elm = document.createElement("button") as HTMLElement

            if (this.settings.areItemsHtml) {
                elm.innerHTML = category;
                elm = elm.firstChild! as HTMLElement;
            }
            else {
                elm.innerText = category;
            }

            const point = points.at(i - 1)!
            Utils.makeAbsolute(elm)
            elm.style.left = point.x + "px"
            elm.style.top = point.y + "px"
            elm.style.width = "100px"
            elm.style.cursor = "pointer"
            elm.style.zIndex = "102"
            elm.style.backgroundColor = 'red'
            this.controller.root.appendChild(elm)
            const p = i * (100 / this.controller.settings.items.length)

            elm.addEventListener('click', () => {
                this.thumbController.animateToPercentage(p, i * 100)
            })
            elm.addEventListener('mouseup', e => e.stopPropagation())

            this.handlerPoints.push(point)

            i++;
        }
    }

    generatePoints() {
        const points: Point[] = []

        const step = 100 / this.controller.settings.items.length;
        for (let i = 1; i <= this.controller.settings.items.length; i++) {
            const p = this.thumbController.moveToPercentage(i * step);
            const slop = (p.y - this.center.y) / (p.x - this.center.x)
            const angle = Math.atan(slop)
            const F = (x: number) => slop * x + this.center.y - slop * this.center.x;

            let x = p.x > this.center.x ?
                this.radius * Math.cos(angle) + this.center.x :
                -(this.radius * Math.cos(angle) - this.center.x);

            const y = F(x)

            points.push(new Point(x, y))
        }


        return points;
    }
}