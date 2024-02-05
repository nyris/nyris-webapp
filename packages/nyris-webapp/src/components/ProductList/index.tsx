import { Box } from '@material-ui/core';
import ItemResult from 'components/results/ItemResult';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { connectStateResults } from 'react-instantsearch-dom';
import { useMediaQuery } from 'react-responsive';
import { useAppSelector } from 'Store/Store';
import { AppState } from 'types';
import { useProductList } from './useProductList';

interface Props {
  allSearchResults: any;
  getUrlToCanvasFile: any;
  setLoading?: any;
  sendFeedBackAction: any;
  requestImage?: any;
  searchQuery?: string;
}

function ProductListComponent({
  allSearchResults,
  getUrlToCanvasFile,
  sendFeedBackAction,
  searchQuery,
  requestImage,
  isSearchStalled,
}: any): JSX.Element {
  const { search, settings } = useAppSelector<AppState>((state: any) => state);
  const { loadingSearchAlgolia } = search;
  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { t } = useTranslation();
  const { productList, handlerCloseGroup, handlerGroupItem, algoliaRequest } =
    useProductList({
      allSearchResults,
    });

  const renderItem = useMemo(() => {
    if (
      !requestImage &&
      !search.valueTextSearch.query &&
      !searchQuery &&
      !isSearchStalled
    ) {
      return (
        <Box style={{ marginTop: '50px', width: '100%', textAlign: 'center' }}>
          {t('Please upload an image or enter a keyword to search.')}
        </Box>
      );
    } else if (
      productList.length === 0 &&
      !loadingSearchAlgolia &&
      !isSearchStalled
    ) {
      return (
        <Box style={{ marginTop: '50px', width: '100%', textAlign: 'center' }}>
          {t('No products were found matching your search criteria.')}
        </Box>
      );
    }
    return productList.map((hit: any, i: number) => {
      return (
        <Box key={i} style={{ height: 'fit-content' }}>
          <ItemResult
            dataItem={hit}
            indexItem={i}
            isHover={false}
            onSearchImage={(url: string) => {
              getUrlToCanvasFile(url);
            }}
            handlerFeedback={(value: string) => {
              sendFeedBackAction(value);
            }}
            handlerGroupItem={(hitItem: any, index: number) =>
              handlerGroupItem(hitItem, index)
            }
            handlerCloseGroup={(hitItem: any, index: number) =>
              handlerCloseGroup(hitItem, index)
            }
            isGroupItem={settings.showGroup ? hit?.isGroup : false}
            main_image_link={
              hit['image(main_similarity)'] || hit['main_image_link']
            }
          />
        </Box>
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    productList,
    searchQuery,
    requestImage,
    search.valueTextSearch,
    isSearchStalled,
    algoliaRequest,
    loadingSearchAlgolia,
    isMobile,
  ]);

  return <>{renderItem}</>;
}

const ProductList = connectStateResults<Props>(memo(ProductListComponent));
export default ProductList;
