import { IVector2D } from '../Interfaces/IVector2D';

interface NodeSelectedDetail {
	node?: { nodeTypeName?: string; nodeType?: string };
	element?: HTMLElement;
}

interface HotspotValueChangeDetail {
	coordinateId: string;
	coordinateValue: number;
}

/**
 * Handles dragging of hotspots within a single content element (the domSection passed to the
 * constructor). The persistent document/window listeners are shared across all instances, so a
 * page with multiple ContentWithHotspots elements only registers them once and routes events to
 * the instance that owns the selected hotspot.
 */
export default class Hotspots {
	private static instances: Set<Hotspots> = new Set();
	private static sharedListenersAttached: boolean = false;
	private static nodeSelectedListener: EventListener;
	private static hotspotValueChangeListener: EventListener;

	private editable: boolean = true;
	private selectedElement: HTMLElement | null = null;
	private readonly domSection: HTMLElement;
	private readonly hotspotNodeTypes: string[];
	private activeMouseDownListener!: EventListener;
	private activeMouseMoveListener!: EventListener;
	private activeMouseUpListener!: EventListener;

	constructor(domSection: HTMLElement, hotspotNodeTypes: string[] = ['FormatD.HotspotEditor:Content.Hotspot']) {
		this.domSection = domSection;
		this.hotspotNodeTypes = hotspotNodeTypes;

		if (document.querySelector('body')?.classList.contains('neos-backend')) {
			Hotspots.register(this);
		}
	}

	public setEditable(editable: boolean): void {
		if (!editable && this.selectedElement) {
			this._detachDragListeners();
			this.selectedElement = null;
		}

		this.editable = editable;
	}

	public dispose(): void {
		this._detachDragListeners();
		this.selectedElement = null;
		Hotspots.unregister(this);
	}

	private static register(instance: Hotspots): void {
		Hotspots.instances.add(instance);
		if (!Hotspots.sharedListenersAttached) {
			Hotspots._attachSharedListeners();
		}
	}

	private static unregister(instance: Hotspots): void {
		Hotspots.instances.delete(instance);
		if (Hotspots.instances.size === 0) {
			Hotspots._detachSharedListeners();
		}
	}

	private static _attachSharedListeners(): void {
		Hotspots.nodeSelectedListener = (event: Event) => {
			const detail = (event as CustomEvent).detail as NodeSelectedDetail;
			Hotspots.instances.forEach((instance) => instance._handleNodeSelected(detail));
		};
		Hotspots.hotspotValueChangeListener = (event: Event) => {
			const detail = (event as CustomEvent).detail as HotspotValueChangeDetail;
			Hotspots.instances.forEach((instance) => instance._handleValueChange(detail));
		};

		document.addEventListener('Neos.NodeSelected', Hotspots.nodeSelectedListener, false);
		window.parent.addEventListener('fd-hotspot-editor:hotspotInspectorValueChanged', Hotspots.hotspotValueChangeListener);
		Hotspots.sharedListenersAttached = true;
	}

	private static _detachSharedListeners(): void {
		document.removeEventListener('Neos.NodeSelected', Hotspots.nodeSelectedListener);
		window.parent.removeEventListener('fd-hotspot-editor:hotspotInspectorValueChanged', Hotspots.hotspotValueChangeListener);
		Hotspots.sharedListenersAttached = false;
	}

	private _handleValueChange(detail: HotspotValueChangeDetail): void {
		const coordinateId = detail.coordinateId;
		if ((!coordinateId.includes('x') && !coordinateId.includes('y')) || !this.selectedElement) {
			return;
		}

		const coordinateValue = detail.coordinateValue;
		if (coordinateId.includes('x')) {
			this._moveElement(this.selectedElement, coordinateValue, undefined);
		}
		if (coordinateId.includes('y')) {
			this._moveElement(this.selectedElement, undefined, coordinateValue);
		}
	}

	private _handleNodeSelected(detail: NodeSelectedDetail): void {
		const nodeTypeName = detail.node?.nodeTypeName || detail.node?.nodeType;
		const element = detail.element;
		const belongsToThisArea = !!nodeTypeName
			&& this.hotspotNodeTypes.includes(nodeTypeName)
			&& !!element
			&& this.domSection.contains(element);

		if (belongsToThisArea && this.editable) {
			this._selectHotspot(element as HTMLElement);
		} else if (this.selectedElement) {
			this._detachDragListeners();
			this.selectedElement = null;
		}
	}

	private _selectHotspot(element: HTMLElement): void {
		this.selectedElement = element;

		const initialPosition: IVector2D = {
			x: element.offsetLeft,
			y: element.offsetTop
		};
		const offsetPosition: IVector2D = { x: 0, y: 0 };
		const currentPosition: IVector2D = { x: 0, y: 0 };

		this.activeMouseUpListener = (mouseEvent: Event) => {
			const mEvent = mouseEvent as MouseEvent;
			mEvent.preventDefault();

			const container = mEvent.composedPath().find((node) =>
				node instanceof HTMLElement && node.className === 'content-with-hotspots--container'
			) as HTMLElement | undefined;

			if (container) {
				this._dispatchHotspotDraggedEvent({
					x: currentPosition.x + offsetPosition.x,
					y: currentPosition.y + offsetPosition.y
				}, container);
			}

			initialPosition.x = currentPosition.x;
			initialPosition.y = currentPosition.y;

			document.removeEventListener('mouseup', this.activeMouseUpListener);
			document.removeEventListener('mousemove', this.activeMouseMoveListener);
			element.removeEventListener('mousedown', this.activeMouseDownListener);
		};

		this.activeMouseDownListener = (mouseEvent: Event) => {
			const mEvent = mouseEvent as MouseEvent;
			mEvent.preventDefault();

			document.addEventListener('mouseup', this.activeMouseUpListener);
			document.addEventListener('mousemove', this.activeMouseMoveListener);

			initialPosition.x = mEvent.clientX - offsetPosition.x;
			initialPosition.y = mEvent.clientY - offsetPosition.y;

			const container = element.parentElement?.parentElement;
			if (container) {
				offsetPosition.x = element.getBoundingClientRect().left - container.getBoundingClientRect().left;
				offsetPosition.y = element.getBoundingClientRect().top - container.getBoundingClientRect().top;
			}
		};

		this.activeMouseMoveListener = (mouseEvent: Event) => {
			const mEvent = mouseEvent as MouseEvent;
			mEvent.preventDefault();
			mEvent.stopPropagation();

			currentPosition.x = mEvent.clientX - initialPosition.x;
			currentPosition.y = mEvent.clientY - initialPosition.y;

			this._moveElement(element, currentPosition.x + offsetPosition.x, currentPosition.y + offsetPosition.y, 'px');
		};

		element.addEventListener('mousedown', this.activeMouseDownListener);
	}

	private _detachDragListeners(): void {
		document.removeEventListener('mouseup', this.activeMouseUpListener);
		document.removeEventListener('mousemove', this.activeMouseMoveListener);
		if (this.selectedElement) {
			this.selectedElement.removeEventListener('mousedown', this.activeMouseDownListener);
			this.selectedElement.removeEventListener('mouseup', this.activeMouseUpListener);
			this.selectedElement.removeEventListener('mousemove', this.activeMouseMoveListener);
		}
	}

	private _dispatchHotspotDraggedEvent(position: IVector2D, parentElement?: HTMLElement) {
		if (parentElement) {
			position.x = (position.x / parentElement.offsetWidth) * 100;
			position.y = (position.y / parentElement.offsetHeight) * 100;
		}

		const dragEvent: CustomEvent = new CustomEvent(
			'fd-hotspot-editor:hotspotDragged',
			{
				detail: {
					Payload: {
						pos: {
							xPosition: position.x,
							yPosition: position.y
						}
					}
				}
			}
		);
		window.parent.dispatchEvent(dragEvent);
	}

	private _moveElement(element: HTMLElement, x?: number, y?: number, unit?: 'px' | '%') {
		unit = unit || '%';

		if (x !== undefined) {
			element.style.left = String(x) + unit;
		}
		if (y !== undefined) {
			element.style.top = String(y) + unit;
		}
	}
}
