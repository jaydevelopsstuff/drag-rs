import { invoke, Channel } from "@tauri-apps/api/core";

export type DragItem =
  | string[]
  | { data: string | Record<string, string>; types: string[] };

export type DragResult = "Dropped" | "Cancelled";

/**
 * An operation a drop target is allowed to perform.
 *
 * Only `copy`, `move` and `link` have an equivalent outside of macOS;
 * the remaining operations are ignored on Windows and Linux.
 */
export type DragMode =
  | "copy"
  | "link"
  | "generic"
  | "private"
  | "move"
  | "delete"
  | "every";

/**
 * Logical position of the cursor.
 */
export interface CursorPosition {
  x: Number;
  y: Number;
}

export interface Options {
  item: DragItem;
  icon: string;
  /**
   * The operations the drop target is allowed to perform. Defaults to `"copy"`.
   *
   * Pass an array to allow several operations at once, or an empty array to allow none.
   */
  mode?: DragMode | DragMode[];
}

export interface CallbackPayload {
  result: DragResult;
  cursorPos: CursorPosition;
}

/**
 * Starts a drag operation. Can either send a list of files or data to another app.
 *
 * ```typescript
 * import { startDrag } from "@crabnebula/tauri-plugin-drag";
 *
 * // drag a file:
 * startDrag({
 *  item: ["/path/to/file.png"],
 *  icon: "/path/to/preview.png"
 * });
 *
 * // drag Final Cut Pro data:
 * startDrag({
 *   item: {
 *    // alternatively, you can pass an object mapping each type to its own XML format
 *     data: '<fcpxml version="1.10">...</fcpxml>',
 *     types: [
 *       "com.apple.finalcutpro.xml.v1-10",
 *       "com.apple.finalcutpro.xml.v1-9",
 *       "com.apple.finalcutpro.xml"
 *     ]
 *   }
 * });
 * ```
 *
 * @param options the drag options containing data and preview image
 * @param onEvent on drag event handler
 */
export async function startDrag(
  options: Options,
  onEvent?: (result: CallbackPayload) => void
): Promise<void> {
  const onEventChannel = new Channel<CallbackPayload>();
  if (onEvent) {
    onEventChannel.onmessage = onEvent;
  }
  await invoke("plugin:drag|start_drag", {
    item: options.item,
    image: options.icon,
    options: {
      mode: options.mode,
    },
    onEvent: onEventChannel,
  });
}
