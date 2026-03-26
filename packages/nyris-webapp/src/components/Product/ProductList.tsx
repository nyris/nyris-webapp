import { useEffect, useMemo, useState } from 'react';
import useResultStore from 'stores/result/resultStore';
import Product from './Product';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { filterProducts } from 'utils/specificationFilter';
import { filterProductsByText } from 'utils/textSearchFilter';
import Chat from 'components/Vizo/Chat';
import { MessageType } from 'types';
import { useGeminiProductFilter } from 'hooks/useGeminiProductFilter';

interface Props {
  sendFeedBackAction?: any;
}

function ProductList({ sendFeedBackAction }: Props): JSX.Element {
  const settings = window.settings;
  const { singleImageSearch } = useImageSearch();
  const { t } = useTranslation();

  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );

  const groundingFilterResult = useResultStore(
    state => state.groundingFilterResult,
  );

  const showingGroundingFilterResult = useResultStore(
    state => state.showingGroundingFilterResult,
  );

  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);
  const isAiModeOpen = useUiStore(state => state.isAiModeOpen);
  const setIsAiModeOpen = useUiStore(state => state.setIsAiModeOpen);

  const [ocr, setOcr] = useState([]);
  const [showNewResultButton, setShowNewResultButton] = useState(false);
  const [vizoResultAssessment, setVizoResultAssessment] = useState<any>();
  const [vizoLoading, setVizoLoading] = useState(false);
  const [vizoLoadingMessage, setVizoLoadingMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<any[]>(() =>
    // loadPersistedChatHistory<any>(),
    [],
  );
  const [products, setProducts] = useState<any[]>([]);

  const setQuery = useRequestStore(state => state.setQuery);
  const query = useRequestStore(state => state.query);
  const requestImages = useRequestStore(state => state.requestImages);

  const setValueInput = useRequestStore(state => state.setValueInput);
  const specificationFilter = useRequestStore(
    state => state.specificationFilter,
  );
  const postFilterSelections = useRequestStore(
    state => state.postFilterSelections,
  );

  const { visualResults } = useGeminiProductFilter();

  const textFilteredProducts = useMemo(() => {
    if (!requestImages?.length) {
      return productsFromFindApi;
    }

    if (!query?.trim()) {
      return productsFromFindApi;
    }

    return filterProductsByText(query || '', productsFromFindApi);
  }, [productsFromFindApi, query, requestImages]);

  const postFilteredProducts = useMemo(() => {
    const entries = Object.entries(postFilterSelections || {}).filter(
      ([, values]) => values?.length,
    );

    if (entries.length === 0) {
      return textFilteredProducts;
    }

    return textFilteredProducts.filter(product => {
      const productFilters = product?.filters || {};

      return entries.every(([attribute, selectedValues]) => {
        const productValues = productFilters?.[attribute];
        if (!Array.isArray(productValues)) {
          return false;
        }

        return selectedValues.some(value => productValues.includes(value));
      });
    });
  }, [postFilterSelections, textFilteredProducts]);

  const getUrlToCanvasFile = async (url: string) => {
    setQuery('');
    setValueInput('');

    singleImageSearch({
      image: url,
      settings,
      showFeedback: true,
      compress: false,
      clearPostFilter: true,
    }).then(() => {});
  };
  const isAlgoliaEnabled = window.settings?.algolia?.enabled;

  const baseProducts = useMemo(() => {
    const filter = Object.values(specificationFilter || {})[0];
    const baseFindApiProducts = postFilteredProducts;

    if (filter) {
      return filterProducts(
        filter,
        isAlgoliaEnabled ? productsFromAlgolia : baseFindApiProducts,
      );
    }

    if (!isAlgoliaEnabled) {
      return baseFindApiProducts;
    }

    if (productsFromAlgolia.length === 0 && isAlgoliaLoading && !query) {
      return baseFindApiProducts;
    }
    return productsFromAlgolia;
  }, [
    specificationFilter,
    isAlgoliaEnabled,
    productsFromAlgolia,
    isAlgoliaLoading,
    query,
    postFilteredProducts,
  ]);

  useEffect(() => {
    setProducts(baseProducts || []);
  }, [baseProducts, specificationFilter]);

  const groundedFilteredProducts = useMemo(() => {
    if (groundingFilterResult && groundingFilterResult.length > 0) {
      const filtered = products.filter((product: any) =>
        groundingFilterResult.some((result: any) => product.sku === result.sku),
      );
      if (filtered.length > 0) {
        return filtered;
      }
      return products;
    }
    return products;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groundingFilterResult]);

  const reorderProducts = (skuInOrder: string[], products: any[]): any[] => {
    // Create a map from the sku to the product for quick lookup
    const productMap = new Map(products.map(product => [product.sku, product]));

    // Reorder products based on skuInOrder
    const orderedProducts = skuInOrder
      .map(sku => productMap.get(sku))
      .filter(product => product !== undefined);

    return orderedProducts;
  };

  const showRefinedResult = () => {
    if (typeof vizoResultAssessment?.result[0] === 'object') {
      const res = vizoResultAssessment?.result.map(
        (item: { sku: any }) => item.sku,
      );
      setProducts(reorderProducts(res, products));
    } else {
      setProducts(reorderProducts(vizoResultAssessment?.result, products));
    }
    setShowNewResultButton(false);
  };

  const onUserQuery = async (userQuery: string) => {
    setVizoLoading(true);
    setVizoLoadingMessage('Analyzing results...');
    console.log({ userQuery });

    setChatHistory(s => [
      ...s,
      {
        type: MessageType.USER,
        message: userQuery,
      },
    ]);
    try {
      const res = await visualResults(
        userQuery,
        productsFromFindApi,
        productsFromAlgolia,
      );
      console.log(res);
      if (
        !res?.extracted_filters ||
        Object.keys(res.extracted_filters).length === 0
      )
        return;
      if (res.text_type === 'keyword_query') {
      }
      if (res.text_type === 'product_description' && res.extracted_filters) {
        const foundProducts = productsFromFindApi.filter(
          (itemFindApiProd: any) =>
            Object.keys(res.extracted_filters).some(
              key =>
                itemFindApiProd[key] === res.extracted_filters[key] ||
                itemFindApiProd.ids?.[key] === res.extracted_filters[key] ||
                itemFindApiProd.customIds?.[key] === res.extracted_filters[key],
            ),
        );
        if (foundProducts.length > 0) {
          setProducts(foundProducts);
        }
        if (!foundProducts.length) {
          singleImageSearch({
            image: requestImages,
            settings,
            showFeedback: true,
            compress: false,
            clearPostFilter: true,
            text: Object.values(res.extracted_filters).join(' '),
          }).then(() => {});
        }
      }
    } finally {
      setVizoLoadingMessage('');
      setVizoLoading(false);
    }
  };

  const renderChatPanel = isAiModeOpen ? (
    <div className="fixed right-0 top-12 desktop:top-[88px] desktop:right-4 h-[calc(100vh-48px)] desktop:h-[calc(100vh-100px)] w-[284px] z-50 border-l border-[#E0E0E0] p-2">
      <Chat
        imageThumb={null}
        ocrList={ocr}
        vizoLoading={vizoLoading}
        onUserQuery={onUserQuery}
        chatHistory={chatHistory}
        filters={[]}
        showNewResultButton={showNewResultButton}
        showRefinedResult={showRefinedResult}
        imageSearch={null}
        vizoLoadingMessage={vizoLoadingMessage}
        noResult={!!products?.length}
        onCloseAiMode={() => setIsAiModeOpen(false)}
      />
    </div>
  ) : null;

  const renderItem = useMemo(() => {
    const productsToRender: any[] =
      groundedFilteredProducts &&
      groundedFilteredProducts.length > 0 &&
      showingGroundingFilterResult
        ? groundedFilteredProducts
        : products;

    return (
      <div className={twMerge(['contents'])}>
        {productsToRender?.map((product: any, i: number) => {
          return (
            <Product
              key={i}
              dataItem={product}
              indexItem={i}
              isHover={false}
              onSearchImage={(url: string) => {
                getUrlToCanvasFile(url);
              }}
              handlerFeedback={(value: string) => {
                sendFeedBackAction(value);
              }}
              isGroupItem={settings.showGroup ? product?.isGroup : false}
              main_image_link={
                !isAlgoliaEnabled
                  ? product['image']
                  : product['image(main_similarity)']
                    ? product['image(main_similarity)']
                    : product['main_image_link']
              }
            />
          );
        })}
        {/* To keep products in same starting position, To-do: better solution */}
        {productsFromAlgolia?.length <= 3 &&
          new Array(3).fill(0).map((_, i) => {
            return (
              <div
                key={i + 'dummy'}
                className="wrap-main-item-result max-w-[190px] w-[180px] desktop:w-[190px] opacity-0 h-0"
              ></div>
            );
          })}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    products,
    groundedFilteredProducts,
    showingGroundingFilterResult,
    isAiModeOpen,
    renderChatPanel,
  ]);

  if (
    products?.length === 0 &&
    !isAlgoliaLoading &&
    !isFindApiLoading &&
    !query &&
    !requestImages[0]
  ) {
    return (
      <div className="flex justify-center items-center h-full col-span-full">
        <div className="text-center text-[#AAABB5]">
          {t('Please upload an image or enter a keyword to search.')}
        </div>
      </div>
    );
  }

  if (products?.length === 0 && !isAlgoliaLoading && !isFindApiLoading) {
    return (
      <div className="flex justify-center items-center h-full col-span-full">
        <div className="text-center text-[#AAABB5]">
          {t('No products were found matching your search criteria.')}
        </div>
      </div>
    );
  }

  return <>{renderItem}</>;
}

export default ProductList;
