declare module 'drift-zoom' {
  export interface DriftOptions {
    /** Prefix for generated class names */
    namespace?: string | null
    /** Show whitespace when zoom pane nears edges */
    showWhitespaceAtEdges?: boolean
    /** Keep inline pane within image bounds */
    containInline?: boolean
    /** Horizontal offset for inline pane */
    inlineOffsetX?: number
    /** Vertical offset for inline pane */
    inlineOffsetY?: number
    /** Container for inline zoom pane */
    inlineContainer?: HTMLElement
    /** Attribute containing zoom image URL */
    sourceAttribute?: string
    /** Magnification multiplier */
    zoomFactor?: number
    /** Container for non-inline pane */
    paneContainer?: HTMLElement
    /** true = always inline; number = breakpoint width for inline mode */
    inlinePane?: boolean | number
    /** Enable touch event triggers */
    handleTouch?: boolean
    /** Callback when zoom pane displays */
    onShow?: () => void
    /** Callback when zoom pane hides */
    onHide?: () => void
    /** Auto-inject base styles */
    injectBaseStyles?: boolean
    /** Milliseconds before showing on mouseenter */
    hoverDelay?: number
    /** Milliseconds before showing on touchstart */
    touchDelay?: number
    /** Show bounding box during hover */
    hoverBoundingBox?: boolean
    /** Show bounding box during touch */
    touchBoundingBox?: boolean
    /** Container for bounding box */
    boundingBoxContainer?: HTMLElement
    /** Use passive listeners for touch events */
    passive?: boolean
  }

  export default class Drift {
    constructor(triggerEl: HTMLElement, options?: DriftOptions)

    /** Disable the Drift instance */
    disable(): void

    /** Enable a previously disabled Drift instance */
    enable(): void

    /** Change the URL of the zoom image */
    setZoomImageURL(imageURL: string): void

    /** Destroy the Drift instance and clean up */
    destroy(): void
  }
}
