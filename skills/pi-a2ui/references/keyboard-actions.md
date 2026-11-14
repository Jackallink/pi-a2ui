# Keyboard actions and ActionBar

Node24.x only. **CommandPalette and ActionBar are pattern/shell names, not callable catalog types.** Do not generate CommandPalette(...) or ActionBar(...). Use the [command-actions](../examples/command-actions.express) Row/Button composition for next-step intents; existing compiler/epoch/revision/literal-context checks apply.

## Canvas Find actions

The v0.1.5 canvas shell offers a header **Find actions** button or Ctrl/Cmd+K. Check that actual header control; a different active extension/older canvas may not have it even when this installed helper describes the new shell. The actionbar template needs only existing Row/Column/Text/Button APIs, so it remains useful without the keyboard shell. Future helper `patterns` metadata separates template availability and required shell capability `command-palette`.

Palette searches only currently rendered, enabled declared Buttons. Native copy/sort/media/modal/disclosure/picker controls and hidden Details/Tabs/closed Modal actions are excluded. Search is local (<=128 code points,<=64 candidates), no model request. Duplicate labels include surface/source IDs so the user can distinguish them. ArrowUp/Down and Home/End move through results; Enter chooses, Escape/Close returns focus, Tab stays in the dialog. A blank/nonmatching list is explicit and Enter does nothing. Another native Modal/pause/pending action prevents opening.

Choosing closes the dialog, rechecks current epoch/revision/visibility/availability and clicks the actual current Button control. SDK resolves latest draft values; no cached action payload or new command endpoint. Guarded form errors still stop the action. Structure/epoch changes invalidate the open list; ordinary native data updates keep drafts. Repeated Enter during a pending delivery cannot enqueue another action. It never executes a shell command directly, opens a source path or grants Pi permissions; the normal Pi action message remains the boundary.

`example command-actions` → `check --surface-id actions FILE` → a2ui_render. Continue Pi's response; user choices arrive later. For local helper vs active-runtime mismatches, trust the active tool/catalog and visible canvas header rather than assuming a version label is enough.
