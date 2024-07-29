import { CircleCarousel } from "./circleImageCarousel";
import { Point } from "./point";
import { Utils } from "./utils";

export type CircleSliderSettings = {
    color: string,
    sizeMultipler: number,
    thickness: number,
}

const defSettings: CircleSliderSettings = {
    color: "red",
    sizeMultipler: 1.1,
    thickness: 1,
}

export class CircleSlider {
    controller: CircleCarousel;
    elm: HTMLElement;
    thumb: HTMLElement;
    radius: number;
    center: Point;
    handlerPoints?: Point[]
    thumbPos: Point = new Point(0, 0);
    onChange?: Function;

    constructor(controller: CircleCarousel, settings = defSettings) {
        const elm = document.createElement("div")
        //size
        elm.style.width = controller.size * settings.sizeMultipler + "px";
        elm.style.height = controller.size * settings.sizeMultipler + "px";
        this.radius = controller.size * settings.sizeMultipler / 2

        //border
        elm.style.border = `${settings.thickness}px solid ${settings.color}`
        elm.style.borderRadius = "50%"

        //postion
        Utils.makeAbsoluteAndCenter(elm)

        elm.style.zIndex = "101"
        controller.root.appendChild(elm)

        //thumb
        //TODO allow edit in settings
        const thumb = document.createElement("div")
        thumb.style.width = "70px"
        thumb.style.height = "70px"
        thumb.style.backgroundColor = "purple"
        thumb.style.borderRadius = "50%"
        Utils.makeAbsolute(thumb)

        thumb.style.cursor = "pointer"
        thumb.style.zIndex = "102"
        thumb.addEventListener('mousedown', () => {
            this.moveRelativeToMouse()
            document.addEventListener('mouseup', () => this.stopMovingRelativeToMouse(), { once: true })
        })
        controller.root.appendChild(thumb)

        this.controller = controller;
        this.elm = elm;
        this.thumb = thumb;
        this.thumb.draggable = false
        this.center = new Point(controller.size / 2, controller.size / 2)
    }

    getLineFunc(slop: number) {
        return (x: number) => slop * x + this.center.y - slop * this.center.x;
    }

    moveThumb(x: number, y: number) {
        this.thumb.style.left = x + "px"
        this.thumb.style.top = y + "px"
        this.thumbPos = new Point(x, isNaN(y) ? this.thumbPos.y : y)
        if (this.onChange) {
            this.onChange()
        }
    }

    moveThumbToPoint(p: Point) {
        this.moveThumb(p.x, p.y)
    }

    moveThumbOnCircleRelativeToPoint(p: Point) {
        const slop = (p.y - this.center.y) / (p.x - this.center.x)
        const angle = Math.atan(slop)
        const F = this.getLineFunc(slop)
        const x = p.x > this.center.x ?
            this.radius * Math.cos(angle) + this.center.x :
            -(this.radius * Math.cos(angle) - this.center.x);
        const y = F(x);

        const pointOnCircle = new Point(x, y)
        this.moveThumbToPoint(pointOnCircle)
    }

    mouseMoveEventListenrWrapper = (e: MouseEvent) => this.moveMoveEventListener(e)

    moveRelativeToMouse() {
        document.addEventListener('mousemove', this.mouseMoveEventListenrWrapper)
    }

    stopMovingRelativeToMouse() {
        document.removeEventListener("mousemove", this.mouseMoveEventListenrWrapper)
        this.snapThump()
    }

    //snaps the thumb to the closet full item in carousel
    snapThump() {
        console.log('here')
        if (!this.handlerPoints) {
            throw new Error("Handler Points must be provided for thumb snapping to be enabled")
        }

        let shortestDelta = Number.MAX_SAFE_INTEGER
        let itemIndex = -1;

        for (let i = 0; i < this.handlerPoints.length; i++) {
            const p = this.handlerPoints[i]
            const d = p.distance(this.thumbPos)

            if (d < shortestDelta) {
                shortestDelta = d;
                itemIndex = i;
            }
        }

        const step = 100 / this.controller.settings.items.length;
        let p = step * itemIndex;

        this.animateToPercentage(p)
    }

    animateToPercentage(p: number, time = 100) {
        if (p === 0) {
            if (this.thumbPos.x > this.center.x) {
                p = 0.1;
            }
            else {
                p = 100
            }
        }
        else {
            const start = this.getPercentage()
            const forward = p - start
            const backward = start > 50 ? 100 - start + p : 100 - p + start;

            //if going backwards is faster
            if (Math.abs(backward) < Math.abs(forward)) {
                const half = start > 50 ? 100 : 0.1
                Utils.animateNumber(
                    start,
                    half,
                    time / 2,
                    (v: number) => this.moveToPercentage(v),
                    () => {
                        //on complete
                        Utils.animateNumber(
                            half === 100 ? 0.1 : 100,
                            p,
                            time / 2,
                            (v: number) => this.moveToPercentage(v),
                        )
                    }
                )
                return;
            }
        }

        Utils.animateNumber(this.getPercentage(), p, time, (v) => this.moveToPercentage(v))
    }

    moveMoveEventListener(e: MouseEvent) {
        const rect = this.controller.root.getBoundingClientRect()
        const y = e.clientY - rect.top;
        const x = e.clientX - rect.left;
        this.moveThumbOnCircleRelativeToPoint(new Point(x, y))
    }

    getAngle() {
        const slop = (this.thumbPos.y - this.center.y) / (this.thumbPos.x - this.center.x)
        const angle = Math.atan(slop)

        if (isNaN(angle)) {
            if (this.thumbPos.y > this.center.y) {
                return 0;
            }
            else {
                return 180;
            }
        }

        let deg = 90 + angle * (180 / Math.PI)

        if (this.thumbPos.x < this.center.x) {
            deg += 180
        }

        return deg === 360 ? 0 : deg;
    }

    moveToAngle(ogDeg: number) {
        let deg = ogDeg;
        if (ogDeg > 180) {
            deg -= 180
        }

        if (deg === 180) {
            deg -= 0.1
        }

        const angle = (deg - 90) * (Math.PI / 180)
        const slop = Math.tan(angle)
        const F = this.getLineFunc(slop)
        const x = ogDeg <= 180 ?
            this.radius * Math.cos(angle) + this.center.x :
            -(this.radius * Math.cos(angle) - this.center.x);
        const y = F(x);

        this.moveThumb(x, y)
        return this.thumbPos;
    }

    getPercentage() {
        const angle = this.getAngle()
        return angle / 3.6;
    }

    moveToPercentage(p: number) {
        this.moveToAngle(p * 3.6)
        return this.thumbPos;
    }
}