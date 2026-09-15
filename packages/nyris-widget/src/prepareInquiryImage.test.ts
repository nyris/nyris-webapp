import {
  JPEG_QUALITY,
  MAX_DOWNSCALE_ITERATIONS,
  MAX_INQUIRY_IMAGE_BYTES,
  prepareInquiryImage,
} from './prepareInquiryImage';

interface FakeCtx {
  fillStyle: string;
  fillRect: jest.Mock;
  drawImage: jest.Mock;
}

interface FakeCanvas {
  width: number;
  height: number;
  ctx: FakeCtx;
  getContext: jest.Mock;
  toDataURL: jest.Mock;
}

const JPEG_PREFIX = 'data:image/jpeg;base64,';

function defaultDataUrl(canvas: FakeCanvas): string {
  return `${JPEG_PREFIX}${'A'.repeat(canvas.width * canvas.height)}`;
}

function createFakeCanvas(
  toDataURLImpl: (canvas: FakeCanvas, type?: string, quality?: number) => string,
): FakeCanvas {
  const ctx: FakeCtx = {
    fillStyle: '',
    fillRect: jest.fn(),
    drawImage: jest.fn(),
  };
  const canvas: FakeCanvas = {
    width: 0,
    height: 0,
    ctx,
    getContext: jest.fn((type: string) => (type === '2d' ? ctx : null)),
    toDataURL: jest.fn((type?: string, quality?: number) =>
      toDataURLImpl(canvas, type, quality),
    ),
  };
  return canvas;
}

function sourceCanvas(width: number, height: number): HTMLCanvasElement {
  return {
    width,
    height,
    getContext: jest.fn(),
    toDataURL: jest.fn(),
  } as unknown as HTMLCanvasElement;
}

describe('prepareInquiryImage', () => {
  const originalCreateElement = document.createElement.bind(document);
  let created: FakeCanvas[];
  let toDataURLImpl: (
    canvas: FakeCanvas,
    type?: string,
    quality?: number,
  ) => string;
  let context2d: FakeCtx | null | ((canvas: FakeCanvas) => FakeCtx | null);

  beforeEach(() => {
    created = [];
    toDataURLImpl = defaultDataUrl;
    context2d = canvas => canvas.ctx;
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName !== 'canvas') {
        return originalCreateElement(tagName);
      }
      const canvas = createFakeCanvas((current, type, quality) =>
        toDataURLImpl(current, type, quality),
      );
      canvas.getContext.mockImplementation((type: string) => {
        if (type !== '2d') {
          return null;
        }
        if (typeof context2d === 'function') {
          return context2d(canvas);
        }
        return context2d;
      });
      created.push(canvas);
      return canvas as unknown as HTMLCanvasElement;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('encodes a small canvas as JPEG 0.9 without changing dimensions', () => {
    const source = sourceCanvas(10, 8);
    const result = prepareInquiryImage(source);

    expect(created).toHaveLength(1);
    expect(created[0].width).toBe(10);
    expect(created[0].height).toBe(8);
    expect(created[0].toDataURL).toHaveBeenCalledWith('image/jpeg', JPEG_QUALITY);
    expect(result.startsWith(JPEG_PREFIX)).toBe(true);
    expect(result.length).toBeLessThanOrEqual(MAX_INQUIRY_IMAGE_BYTES);
    expect(source.getContext).not.toHaveBeenCalled();
    expect(source.toDataURL).not.toHaveBeenCalled();
    expect(created[0].ctx.drawImage).toHaveBeenCalledWith(source, 0, 0, 10, 8);
  });

  it('paints a white background before drawing the source', () => {
    const source = sourceCanvas(4, 4);
    prepareInquiryImage(source);

    const { ctx } = created[0];
    expect(ctx.fillStyle).toBe('#fff');
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 4, 4);
    expect(ctx.fillRect.mock.invocationCallOrder[0]).toBeLessThan(
      ctx.drawImage.mock.invocationCallOrder[0],
    );
  });

  it('downscales an oversized payload while keeping aspect ratio', () => {
    const source = sourceCanvas(2000, 1000);
    const result = prepareInquiryImage(source);

    expect(created.length).toBeGreaterThan(1);
    const last = created[created.length - 1];
    expect(last.width / last.height).toBeCloseTo(2, 1);
    expect(last.width).toBeLessThan(2000);
    expect(last.height).toBeLessThan(1000);
    expect(result.length).toBeLessThanOrEqual(MAX_INQUIRY_IMAGE_BYTES);
    created.forEach(canvas => {
      expect(canvas.ctx.drawImage).toHaveBeenCalledWith(
        source,
        0,
        0,
        canvas.width,
        canvas.height,
      );
    });
  });

  it('throws after the max number of downscale iterations if still oversized', () => {
    toDataURLImpl = () => 'x'.repeat(MAX_INQUIRY_IMAGE_BYTES + 1);
    const source = sourceCanvas(100, 50);

    expect(() => prepareInquiryImage(source)).toThrow(
      'Inquiry image could not be reduced under the EmailJS size limit',
    );
    expect(created.length).toBe(MAX_DOWNSCALE_ITERATIONS + 1);
  });

  it('throws when a 1x1 canvas is still over the size cap', () => {
    toDataURLImpl = () => 'x'.repeat(MAX_INQUIRY_IMAGE_BYTES + 1);
    expect(() => prepareInquiryImage(sourceCanvas(1, 1))).toThrow(
      'Inquiry image could not be reduced under the EmailJS size limit',
    );
    expect(created).toHaveLength(1);
  });

  it('throws when the canvas has no dimensions', () => {
    expect(() => prepareInquiryImage(sourceCanvas(0, 10))).toThrow(
      'Inquiry image canvas has no dimensions',
    );
    expect(() => prepareInquiryImage(sourceCanvas(10, 0))).toThrow(
      'Inquiry image canvas has no dimensions',
    );
    expect(created).toHaveLength(0);
  });

  it('throws when a 2d context is unavailable', () => {
    context2d = null;
    expect(() => prepareInquiryImage(sourceCanvas(10, 10))).toThrow(
      'Could not get 2d canvas context',
    );
  });
});
