
export const is_narrow_screen = () => window.innerWidth <= 800

export function get_is_touch_device()
{
    return "ontouchstart" in window || navigator.maxTouchPoints > 0
}
