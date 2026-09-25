# Compare

The reference and the render sit side by side, and each one is named. That requirement is from Telegram, 13 Sep 2026: the two images could not be told apart.

The same pair is how a live screenshot sits next to a poster when the bar is pixel-match.

<ComparePair left-label="Reference" right-label="Blender" />

Pass `left` and `right` as image URLs. Without them the labels still render, so an empty pair is obvious.

```md
<ComparePair
  left="/refs/house.jpg"
  right="/renders/house.jpg"
  left-label="Reference"
  right-label="Blender"
/>
```
