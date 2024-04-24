import toast from 'react-hot-toast';

export class ToastHelper {
  static success(msg: string) {
    toast.success(msg, {
      duration: 3000,
      style: {
        background: '#1E1F31',
        color: '#fff',
      },
    });
  }

  static error(msg: string) {
    toast.error(msg, {
      duration: 3000,
      style: {
        background: '#1E1F31',
        color: '#fff',
      },
    });
  }
}
