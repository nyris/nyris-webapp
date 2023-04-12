```typescript jsx
const [isOpen, setOpen] = React.useState(false);
const [imageUrl, setImageUrl] = React.useState("");
const captureComplete = (image) => {
    setImageUrl(image.toDataURL());
    setOpen(false);
};
<div>
    <button onClick={() => setOpen(true)}>Open capture</button>
    { isOpen && 
        <Capture
            onCaptureComplete={captureComplete}
            onCaptureCanceled={() => setOpen(false)}
            useAppText="Use camera app" />
    }
    { imageUrl && <div>Result: <img src={imageUrl}/> </div> }
</div>
```
