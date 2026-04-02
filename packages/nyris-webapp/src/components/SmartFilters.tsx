import { useEffect, useMemo, useState } from 'react';
import useRequestStore from 'stores/request/requestStore';
import useResultStore from 'stores/result/resultStore';
import {
  canvasToBlob,
  rerankSmartFilters,
  SmartFilterRerankItem,
  SmartFilterRerankPayload,
  SmartFilterRerankResponse,
} from 'services/vizo';

type SmartFiltersStatus = 'loading' | 'success' | 'error' | 'empty';

const SYSTEM_FILTER_KEYS = new Set(['is_nameplate', 'prefilter_value']);

export function SmartFilters() {
  const requestImages = useRequestStore(state => state.requestImages);
  const imageAnalysis = useResultStore(state => state.imageAnalysis);
  const productsFromFindApi = useResultStore(state => state.productsFromFindApi);

  const [status, setStatus] = useState<SmartFiltersStatus>('empty');
  const [error, setError] = useState<string>('');
  const [response, setResponse] = useState<SmartFilterRerankResponse | null>(null);

  const payload = useMemo<SmartFilterRerankPayload>(() => {
    const filters = Object.entries(imageAnalysis?.specification || {})
      .filter(([key, value]) => {
        return (
          !SYSTEM_FILTER_KEYS.has(key) &&
          typeof value === 'string' &&
          value.trim().length > 0
        );
      })
      .slice(0, 3)
      .reduce<Record<string, string>>((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {});

    const items: SmartFilterRerankItem[] = (productsFromFindApi || [])
      .slice(0, 10)
      .map((product: any): SmartFilterRerankItem | null => {
        const sku = product?.sku || product?.objectID;
        const imageUrl =
          product?.matches?.[0]?.url ||
          product?.['image(main_similarity)'] ||
          product?.main_image_link ||
          product?.image ||
          product?.images?.[0];

        if (!sku || !imageUrl) {
          return null;
        }

        return {
          sku: String(sku),
          metadata: {
            title: product?.title || product?.name || product?.Bezeichnung || '',
            description:
              product?.description ||
              product?.VK_Text_Englisch ||
              product?.VK_Text_Deutsch ||
              '',
            language: window.settings.language || 'en',
            sku: String(sku),
            score:
              typeof (product?.score ?? product?.similarity) === 'number'
                ? Number(product?.score ?? product?.similarity)
                : null,
          },
          imageUrl: String(imageUrl),
        };
      })
      .filter((item): item is SmartFilterRerankItem => item !== null);

    return { filters, items };
  }, [imageAnalysis?.specification, productsFromFindApi]);

  useEffect(() => {
    const run = async () => {
      const requestImageCanvas = requestImages[0];
      if (!requestImageCanvas || payload.items.length === 0) {
        setStatus('empty');
        setResponse(null);
        setError('');
        return;
      }

      setStatus('loading');
      setError('');
      setResponse(null);

      try {
        const blob = await canvasToBlob(requestImageCanvas);
        const imageFile = new File([blob], 'smart-filters-request.jpg', {
          type: 'image/jpeg',
        });
        
        console.log({
          image: imageFile,
          payload,
          timeoutMs: 5000,
          apiKey: 'ATpOJTXorxQMVJGtvfJ6OZGXrext1tMS',
        });

        const result = await rerankSmartFilters({
          image: imageFile,
          payload,
          timeoutMs: 5000
        });

        setResponse(result);
        setStatus('success');
      } catch (err: any) {
        setStatus('error');
        setError(err?.message || 'SmartFilters request failed.');
      }
    };

    run();
  }, [payload, requestImages]);

  return (
    <div className="mx-4 rounded-2xl border border-[#DDDEE7] bg-[#FAFAFA] p-3">
      <div className="text-sm font-semibold text-[#2B2C46]">Smart Filters</div>

      {status === 'empty' && (
        <div className="mt-2 text-xs text-[#767A9F]">
          Missing request image or candidate items.
        </div>
      )}

      {status === 'loading' && (
        <div className="mt-2 text-xs text-[#3E36DC]">Loading...</div>
      )}

      {status === 'error' && (
        <div className="mt-2 text-xs text-[#D14343]">{error}</div>
      )}

      {status === 'success' && (
        <div className="mt-2">
          <div className="text-xs text-[#22A06B]">
            filtered_items: {response?.filtered_items?.length || 0}
          </div>
          <ul className="mt-2 list-disc pl-4 text-xs text-[#3B3E5F]">
            {(response?.filtered_items || []).map(item => (
              <li key={item.sku}>{item.sku}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

