export class Utils {
    static makeAbsolute(elm: HTMLElement) {
        elm.style.position = "absolute"
        elm.style.transform = "translate(-50%,-50%)"
    }

    static makeAbsoluteAndCenter(elm: HTMLElement) {
        elm.style.top = "50%"
        elm.style.left = "50%"
        Utils.makeAbsolute(elm)
    }

    static range(a: number, b?: number) {
        let min: number;
        let max: number;

        if (b === undefined) {
            min = 0;
            max = a + 1;
        }
        else {
            min = a;
            max = b + 1;
        }

        return new Array(max - min).fill(0).map((_, i) => i + min);
    }

    static animateNumber(
        startValue: number,
        endValue: number,
        duration: number,
        onUpdate: (currentValue: number) => void,
        onComplete?: () => void
    ): void {
        const startTime = performance.now();
        const change = endValue - startValue;

        function update(currentTime: number) {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1); // Ensure progress does not exceed 1

            const currentValue = startValue + change * progress;
            onUpdate(currentValue);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else if (onComplete) {
                onComplete();
            }
        }

        requestAnimationFrame(update);
    }
}