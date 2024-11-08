import React from 'react';
import Modal from '@material-ui/core/Modal';

interface Props {
  children: JSX.Element;
  openModal: boolean;
  handleClose: (e: any) => void;
  classNameModal?: string;
  classNameComponentChild?: string;
  rounded?: boolean;
}

function DefaultModal(props: Props): JSX.Element {
  const {
    children,
    openModal = false,
    handleClose,
    classNameModal,
    classNameComponentChild,
    rounded = true,
  } = props;

  return (
    <Modal
      open={openModal}
      onClose={handleClose}
      className={`modal-container ${classNameModal || ''}`}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      // BackdropProps={{
      //   style: {
      //     backgroundColor: '#2B2C46',
      //     opacity: 0.85,
      //   },
      // }}
    >
      <div
        className={classNameComponentChild}
        style={{
          overflowY: 'auto',
          maxHeight: '95vh',
          borderRadius: rounded ? 8 : 0,
        }}
      >
        {children}
      </div>
    </Modal>
  );
}

export default DefaultModal;
