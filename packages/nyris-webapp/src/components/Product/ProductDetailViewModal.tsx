import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from 'components/Modal/Dialog';
import ProductDetailView from './ProductDetailView';

function ProductDetailViewModal({
  openDetailedView,
  setOpenDetailedView,
  dataItem,
  handlerFeedback,
  onSearchImage,
  main_image_link,
}: {
  openDetailedView: '3d' | 'image' | undefined;
  setOpenDetailedView: (value: '3d' | 'image' | undefined) => void;
  dataItem: any;
  handlerFeedback: (value: string) => void;
  onSearchImage: (url: string) => void;
  main_image_link: string;
}) {
  useEffect(() => {
    if (openDetailedView === '3d' || openDetailedView === 'image') {
      // Pushing the change to the end of the call stack
      const timer = setTimeout(() => {
        document.body.style.pointerEvents = '';
      }, 0);

      return () => clearTimeout(timer);
    } else {
      document.body.style.pointerEvents = 'auto';
    }
  }, [openDetailedView]);

  return (
    <Dialog
      open={openDetailedView === '3d' || openDetailedView === 'image'}
      onOpenChange={(e: any) => {
        setOpenDetailedView(undefined);
      }}
      modal={true}
    >
      <DialogContent
        closeButton={false}
        className="flex flex-col min-h-[468px] min-w-[330px] w-[360px] desktop:w-[600px] m-0 desktop:m-auto bg-white rounded-xl p-0"
        onPointerDownOutside={e => {
          const hasDataAttribute = (e.target as HTMLElement)?.hasAttribute(
            'data-modal-overlay',
          );
          if (hasDataAttribute) {
            setOpenDetailedView(undefined);
          }
          e.preventDefault();
        }}
      >
        <DialogTitle className="h-0 w-0 hidden">Product Details</DialogTitle>

        <ProductDetailView
          dataItem={dataItem}
          handleClose={() => {
            setOpenDetailedView(undefined);
          }}
          handlerFeedback={handlerFeedback}
          show3dView={openDetailedView === '3d'}
          onSearchImage={(url: string) => {
            onSearchImage(url);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

export default ProductDetailViewModal;
