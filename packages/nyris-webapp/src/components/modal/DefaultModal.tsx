import React from 'react';
import Modal from '@material-ui/core/Modal';

interface Props {
  children: JSX.Element;
  openModal: boolean;
  handleClose: (e: any) => void;
  classNameModal?: string;
  classNameComponentChild?: string;
}

function DefaultModal(props: Props): JSX.Element {
  const {
    children,
    openModal = false,
    handleClose,
    classNameModal,
    classNameComponentChild,
  } = props;

  return (
    <Modal
      open={openModal}
      onClose={handleClose}
      className={classNameModal}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className={classNameComponentChild}>{children}</div>
    </Modal>
  );
}

export default DefaultModal;
