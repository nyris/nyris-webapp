import { useMemo } from 'react';
import useResultStore from 'stores/result/resultStore';
import Product from './Product';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';
import { useTranslation } from 'react-i18next';
import { twMerge } from 'tailwind-merge';
import { useCurrentRefinements } from 'react-instantsearch';

interface Props {
  sendFeedBackAction?: any;
}

function ProductList({ sendFeedBackAction }: Props): JSX.Element {
  const settings = window.settings;
  const { singleImageSearch } = useImageSearch();
  const { t } = useTranslation();

  const { items } = useCurrentRefinements();

  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);

  const setQuery = useRequestStore(state => state.setQuery);
  const query = useRequestStore(state => state.query);
  const requestImages = useRequestStore(state => state.requestImages);

  const setValueInput = useRequestStore(state => state.setValueInput);

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

  const products = useMemo(() => {
    if (productsFromAlgolia.length === 0 && isAlgoliaLoading && !query) {
      return productsFromFindApi;
    }
    return productsFromAlgolia;
  }, [productsFromAlgolia, productsFromFindApi, isAlgoliaLoading, query]);

  const renderItem = useMemo(() => {
    return (
      <div className={twMerge(['contents'])}>
        {products?.map((product: any, i: number) => {
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
                product['image(main_similarity)']
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
  }, [productsFromAlgolia]);

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
