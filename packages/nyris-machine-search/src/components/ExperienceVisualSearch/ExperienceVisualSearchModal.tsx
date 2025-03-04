import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'components/Drawer/Drawer';
import { Dialog, DialogContent, DialogTitle } from 'components/Modal/Dialog';
import { useMediaQuery } from 'react-responsive';
import ExperienceVisualSearch from './ExperienceVisualSearch';

interface Props {
  openModal: boolean;
  handleClose: (e: any) => void;
  experienceVisualSearchBlobs: Blob[];
}

function ExperienceVisualSearchModal(props: Props) {
  const { openModal = false, handleClose, experienceVisualSearchBlobs } = props;

  const isMobile = useMediaQuery({ query: '(max-width: 776px)' });

  if (!isMobile) {
    return (
      <Dialog open={openModal} onOpenChange={handleClose}>
        <DialogContent
          className="bg-white p-0 max-w-[1500px] w-fit max-h-[95vh] h-fit m-auto overflow-y-hidden rounded-lg"
          closeButton={false}
        >
          <DialogTitle className="h-0 w-0 hidden">
            Experience Visual Search
          </DialogTitle>
          <ExperienceVisualSearch
            experienceVisualSearchBlobs={experienceVisualSearchBlobs}
            onOpenChange={handleClose}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={openModal} onOpenChange={handleClose}>
      <DrawerContent className="bg-white p-0 m-auto overflow-y-hidden h-full outline-none rounded-none">
        <DrawerHeader className="h-0 w-0 hidden">
          <DrawerTitle>Experience Visual Search</DrawerTitle>
        </DrawerHeader>
        <ExperienceVisualSearch
          experienceVisualSearchBlobs={experienceVisualSearchBlobs}
          onOpenChange={handleClose}
        />
      </DrawerContent>
    </Drawer>
  );
}

export default ExperienceVisualSearchModal;
