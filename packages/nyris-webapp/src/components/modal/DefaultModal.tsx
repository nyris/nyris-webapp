import React from "react";
import Modal from "@material-ui/core/Modal";

interface Props {
  children: JSX.Element;
  openModal: boolean;
  handleClose: (e: any) => void;
}

function DefaultModal(props: Props) {
  const { children, openModal = false, handleClose } = props;

  return (
    <Modal
      open={openModal}
      onClose={handleClose}
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {children}
    </Modal>
  );
}

export default DefaultModal;
