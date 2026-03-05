import toast, { ToastPosition } from 'react-hot-toast';

export class ToastHelper {
  static success(msg: string, position?: ToastPosition) {
    toast.success(msg, {
      duration: 3000,
      style: {
        background: '#E4E3FF',
        color: '#000000',
      },
      position: position,
      iconTheme: {
        primary: '#3E36DC',
        secondary: '#fff',
      },
    });
  }

  static error(msg: string, position?: ToastPosition) {
    toast.error(msg, {
      duration: 3000,
      style: {
        background: '#1E1F31',
        color: '#fff',
      },
      position: position,
    });
  }
}
