import React from 'react';
import Modal from '@material-ui/core/Modal';
import { Dialog, DialogContent, DialogTitle } from '../modal/dialog';
import PreFilterComponent from './PreFilter';

interface Props {
  openModal: boolean;
  handleClose: (e: any) => void;
}

function PreFilterModal(props: Props): JSX.Element {
  const { openModal = false, handleClose } = props;

  return (
    <Dialog open={openModal} onOpenChange={handleClose}>
      <DialogContent
        className="bg-white p-0 max-w-[1500px] w-[90%] max-h-[95vh] h-[80%] m-auto overflow-y-hidden rounded-lg pt-2.5"
        closeButton={false}
      >
        <DialogTitle className="h-0 w-0 hidden">Select a Filter</DialogTitle>
        <PreFilterComponent handleClose={handleClose} />
      </DialogContent>
    </Dialog>
  );
}

export default PreFilterModal;
