import { createUsePuck } from "@puckeditor/core";

/**
 * Selector hook for editor state. Each component subscribes only to the slice
 * it renders from, so a hover or a drag does not re-render every overlay.
 * Use useGetPuck() instead when state is only needed inside an event handler.
 */
export const usePuckSelect = createUsePuck();
