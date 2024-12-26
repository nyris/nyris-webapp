import { useMemo } from 'react';
import useResultStore from 'stores/result/resultStore';
import Product from './Product';
import { useImageSearch } from 'hooks/useImageSearch';
import useRequestStore from 'stores/request/requestStore';
import useUiStore from 'stores/ui/uiStore';

interface Props {
  sendFeedBackAction?: any;
}

function ProductList({ sendFeedBackAction }: Props): JSX.Element {
  const settings = window.settings;
  const { singleImageSearch } = useImageSearch();

  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );
  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);

  const setQuery = useRequestStore(state => state.setQuery);

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
    if (productsFromAlgolia.length === 0 && isAlgoliaLoading) {
      return productsFromFindApi;
    }
    return productsFromAlgolia;
  }, [productsFromAlgolia, productsFromFindApi, isAlgoliaLoading]);

  const renderItem = useMemo(() => {
    return (
      <div
        className={`grid grid-cols-[repeat(auto-fit,_minmax(190px,_0px))] gap-6 ${
          productsFromAlgolia.length > 3 ? 'justify-center' : 'justify-start'
        }  max-w-[100%] mx-auto`}
      >
        {products.map((product: any, i: number) => {
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
                productsFromFindApi[i]?.image ||
                product['image(main_similarity)'] ||
                product['main_image_link']
              }
            />
          );
        })}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsFromAlgolia]);

  return <>{renderItem}</>;
}

export default ProductList;
