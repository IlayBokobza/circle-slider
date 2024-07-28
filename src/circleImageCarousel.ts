import { CircleHandlers, CircleHandlersSettings } from "./circleHanlders";
import { CircleSlider, CircleSliderSettings } from "./circleSlider";

type CircleCarouselSettings = {
    size?: number;
    forceImageToFit?: boolean,
    items: {
        img: string,
        category: string,
    }[],
    sliderSettings?: CircleSliderSettings,
    handlersSettings?: CircleHandlersSettings,
}

export class CircleCarousel {
    root: HTMLElement;
    elm: HTMLElement;
    innerElm: HTMLElement;
    settings: CircleCarouselSettings;
    size: number;
    thumb: CircleSlider;

    constructor(selector: string, settings: CircleCarouselSettings) {
        const root = document.querySelector(selector)

        if (!root) {
            throw new Error(`No element found with the ${selector} selector.`)
        }

        this.root = root as HTMLElement;
        this.root.style.position = "relative"
        this.settings = settings;

        //create elm
        const elm = document.createElement('div')
        root.appendChild(elm)
        this.elm = elm;

        //create inner elm
        this.innerElm = document.createElement("div")
        this.elm.appendChild(this.innerElm)

        //set size
        if (this.settings.size) {
            this.elm.style.width = this.settings.size + "px";
            this.elm.style.height = this.settings.size + "px";
            this.size = this.settings.size;
        }
        else {
            this.size = this.root.clientWidth;
        }

        //setup styles
        this.elm.style.borderRadius = '50%';
        this.elm.style.zIndex = "100"
        this.elm.style.overflow = "hidden"
        this.innerElm.style.display = "flex"

        //create elements
        for (const item of this.settings.items) {
            const child = document.createElement('img')
            child.setAttribute("src", item.img)
            child.style.height = this.size + "px"

            if (this.settings.forceImageToFit) {
                child.style.width = this.size + "px"
            }

            this.innerElm.appendChild(child)
        }

        //add first image again at the end
        const child = document.createElement('img')
        const item = this.settings.items[0]
        child.setAttribute("src", item.img)
        child.style.height = this.size + "px"

        if (this.settings.forceImageToFit) {
            child.style.width = this.size + "px"
        }

        this.innerElm.appendChild(child)

        const slider = new CircleSlider(this, this.settings.sliderSettings)
        slider.onChange = () => {
            this.moveBy(slider.getPercentage())
            // console.log(slider.getPercentage())
        }

        this.thumb = slider;

        const handlers = new CircleHandlers(this, slider, this.settings.handlersSettings)
        slider.handlerPoints = handlers.handlerPoints;
        handlers.renderItems()
    }

    moveTo(i: number) {
        this.innerElm.style.transform = `translateX(-${i * this.size!}px)`
    }

    moveBy(p: number) {
        const oneP = this.size * this.settings.items.length / 100;
        const amount = oneP * p;
        this.innerElm.style.transform = `translateX(-${amount}px)`
    }
}
