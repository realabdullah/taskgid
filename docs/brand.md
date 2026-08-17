# Taskgid brand

## The mark

A **T** whose stem falls and kicks back up. It is the letter the name starts with and
the stroke you make when something is finished — the same two ideas the product is
built on: a task, and the record of it closing.

It is drawn on a 32-unit grid in a single stroke weight:

```
bar     M6 6 H26          stroke-width  3.8
stem    M16 6 V26         linecap       round
close   M16 26 L26 16     linejoin      round
```

The bar and stem are ink. **The closing stroke is the only coloured element in the
brand**, and it carries the same signal red the product uses for a pin or an alert —
colour means something here, so the mark never colours anything else.

## The wordmark

Set in **Geist SemiBold (600), tracked −0.03em**. It is always live text in the app
(`.brand-wordmark`), never an image, so it stays crisp and selectable. The outlined
SVG in `public/brand/` exists for places that cannot load the font.

Written **Taskgid** — one word, one capital. Never `TASKGID`, never `TaskGid`.

## The lockup

Mark then wordmark. The mark stands **1.34× the wordmark's cap height**, and the gap
between them is **half the cap height**. Keep clear space of at least half the mark's
height on every side. Minimum sizes: mark 16px, lockup 96px wide.

## Colour

| Role                    | Hex       | Token                           |
| ----------------------- | --------- | ------------------------------- |
| Ink                     | `#14110d` | `--color-ink` / `--neutral-900` |
| Paper                   | `#fdfcfb` | `--neutral-25`                  |
| Canvas                  | `#f9f8f5` | `--color-canvas`                |
| Signal (closing stroke) | `#e14b36` | `--color-signal`                |
| Done                    | `#0a703b` | `--color-status-done`           |

On ink backgrounds the T turns paper; the closing stroke stays signal.

## Files

| File                                                        | Use                                           |
| ----------------------------------------------------------- | --------------------------------------------- |
| `taskgid-lockup.svg`                                        | Default logo: mark + wordmark                 |
| `taskgid-lockup-mono.svg`                                   | One-colour print, faxes, embroidery           |
| `taskgid-lockup-paper.svg`                                  | On ink backgrounds                            |
| `taskgid-mark.svg` / `-mono` / `-paper`                     | Mark alone, where the name is already present |
| `taskgid-icon.svg` / `-paper`                               | App icon: mark on a tile                      |
| `taskgid-icon-512.png`                                      | Store listings, social profiles               |
| `taskgid-wordmark.svg` / `-paper`                           | Wordmark alone, outlined                      |
| `public/favicon.svg`, `favicon.ico`, `apple-touch-icon.png` | Browser and home screen                       |

Small favicons (16–48px) use a slightly larger glyph and tighter corner radius than the
full icon — an optical adjustment, not a different mark.

## In the product

```vue
<AppBrandMark show-name size="sm" />
<!-- ink T, signal close -->
<AppBrandMark tone="mono" />
<!-- one colour -->
<AppBrandMark show-name tone="inverted" />
<!-- on ink -->
```

## Don't

- Recolour the T or move the signal onto it.
- Rebuild the wordmark in another typeface, or letterspace it by eye.
- Add gradients, shadows, outlines, or rotation.
- Crop the mark, or set it closer than half its height to anything else.

## The retired mark

The previous mark was a circular G with a bar — the shape of Google's G glyph — with a
red square set into it. It was replaced because it read as another company's logo,
which is a trademark risk as well as a borrowed identity.
