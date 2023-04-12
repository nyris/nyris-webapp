```typescript jsx
const canvas = document.createElement('canvas');
canvas.width = 300;
canvas.height = 300;
const ctx = canvas.getContext('2d');
ctx.beginPath();
ctx.arc(75, 75, 50, 0, Math.PI * 2, true); // Outer circle
ctx.moveTo(110, 75);
ctx.arc(75, 75, 35, 0, Math.PI, false);  // Mouth (clockwise)
ctx.moveTo(65, 65);
ctx.arc(60, 65, 5, 0, Math.PI * 2, true);  // Left eye
ctx.moveTo(95, 65);
ctx.arc(90, 65, 5, 0, Math.PI * 2, true);  // Right eye
ctx.stroke();


const [selection, setSelection] = React.useState({x1: 0.1, x2: 0.9, y1: 0.1, y2: 0.9});
const regions=[
    { normalizedRect: {x1: 0.1, x2: 0.4, y1: 0.1, y2: 0.4 }},
    { normalizedRect: {x1: 0.6, x2: 0.9, y1: 0.1, y2: 0.4 }}
];

<Preview
    image={canvas}
    selection={selection}
    regions={regions}
    onSelectionChange={setSelection}
    maxWidth={600}
    maxHeight={600}
    dotColor="#00FF00" />
```
