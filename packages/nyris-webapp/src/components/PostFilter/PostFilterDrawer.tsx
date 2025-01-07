import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from 'components/Drawer/Drawer';
import PostFilterComponent from './PostFilterComponent';
import { useTranslation } from 'react-i18next';
import { Icon } from '@nyris/nyris-react-components';

function PostFilterDrawer({
  openModal,
  handleClose,
}: {
  openModal: boolean;
  handleClose: (e: any) => void;
}) {
  const settings = window.settings;
  const { t } = useTranslation();

  return (
    <Drawer open={openModal} onOpenChange={handleClose}>
      <DrawerContent className="bg-white p-0 m-auto overflow-y-hidden pt-2.5 h-full outline-none rounded-none">
        <DrawerHeader className="h-0 w-0 hidden">
          <DrawerTitle>Select a Filter</DrawerTitle>
        </DrawerHeader>

        <div
          className="flex justify-end items-center p-4"
          onClick={() => handleClose(false)}
        >
          <Icon name="close" />
        </div>
        <PostFilterComponent />
        <div className="footer h-16 mt-auto flex">
          <div
            style={{
              backgroundColor: settings.theme.secondaryColor,
            }}
            className="button-left w-1/2  text-white rounded-none justify-start text-none pl-4 pt-4 pb-8 cursor-pointer"
            onClick={() => handleClose(false)}
          >
            {t('Cancel')}
          </div>
          <div
            style={{
              backgroundColor: settings.theme.primaryColor,
            }}
            className="button-right w-1/2  text-white rounded-none justify-start text-none pl-4 pt-4 pb-8 cursor-pointer"
            onClick={() => handleClose(false)}
          >
            {t('Apply')}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default PostFilterDrawer;
