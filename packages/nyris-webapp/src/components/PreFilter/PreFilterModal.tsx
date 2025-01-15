import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '../Modal/Dialog';
import PreFilterComponent from './PreFilter';
import { useMediaQuery } from 'react-responsive';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'components/Drawer/Drawer';
import { useTranslation } from 'react-i18next';

interface Props {
  openModal: boolean;
  handleClose: (e: any) => void;
}

function PreFilterModal(props: Props): JSX.Element {
  const { openModal = false, handleClose } = props;

  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });
  const { t } = useTranslation();

  if (!isMobile) {
    return (
      <Dialog open={openModal} onOpenChange={handleClose}>
        <DialogContent
          className="bg-white p-0 max-w-[1500px] w-[90%] max-h-[95vh] h-[80%] m-auto overflow-y-hidden rounded-lg pt-2.5"
          closeButton={false}
        >
          <DialogTitle className="h-0 w-0 hidden">
            {t('Select a Filter')}
          </DialogTitle>
          <PreFilterComponent handleClose={handleClose} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={openModal} onOpenChange={handleClose}>
      <DrawerContent className="bg-white p-0 m-auto overflow-y-hidden pt-2.5 h-full outline-none rounded-none">
        <DrawerHeader className="h-0 w-0 hidden">
          <DrawerTitle>{t('Select a Filter')}</DrawerTitle>
        </DrawerHeader>
        <PreFilterComponent handleClose={handleClose} />
      </DrawerContent>
    </Drawer>
  );
}

export default PreFilterModal;
