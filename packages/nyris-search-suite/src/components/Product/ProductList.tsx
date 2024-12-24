import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import useResultStore from 'stores/result/resultStore';
import Product from './Product';

interface Props {
  allSearchResults: any;
  getUrlToCanvasFile: any;
  setLoading?: any;
  sendFeedBackAction: any;
  requestImage?: any;
  searchQuery?: string;
}

function ProductList({
  allSearchResults,
  getUrlToCanvasFile,
  sendFeedBackAction,
  searchQuery,
  requestImage,
  isSearchStalled,
}: any): JSX.Element {
  const settings = window.settings;
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );

  console.log({ productsFromAlgolia });

  const renderItem = useMemo(() => {
    return (
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(190px,_0px))] gap-6 justify-center max-w-[100%] mx-auto">
        {productsFromAlgolia.map((hit: any, i: number) => {
          return (
            <Product
              key={i}
              dataItem={hit}
              indexItem={i}
              isHover={false}
              onSearchImage={(url: string) => {
                getUrlToCanvasFile(url);
              }}
              handlerFeedback={(value: string) => {
                sendFeedBackAction(value);
              }}
              isGroupItem={settings.showGroup ? hit?.isGroup : false}
              main_image_link={
                hit['image(main_similarity)'] || hit['main_image_link']
              }
            />
          );
        })}
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productsFromAlgolia, searchQuery, requestImage, isSearchStalled]);

  return <>{renderItem}</>;
}

export default ProductList;
