import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import emailjs from '@emailjs/browser';
import Inquiry, { isValidInquiryEmail } from './Inquiry';
import { prepareInquiryImage } from '../prepareInquiryImage';

jest.mock('../styles/inquiry-modal.scss', () => ({}));
jest.mock('@nyris/nyris-react-components', () => ({
  Icon: () => null,
}));
jest.mock('@emailjs/browser', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    send: jest.fn(() => Promise.resolve()),
  },
}));
jest.mock('../prepareInquiryImage', () => ({
  prepareInquiryImage: jest.fn(() => 'data:image/jpeg;base64,abc'),
}));
jest.mock('./ToastNotification', () => ({
  ToastHelper: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const labels = {
  'Submit your image for inquiry': 'Submit your image for inquiry',
  'Your email': 'Your email',
  'Additional information': 'Additional information',
  Cancel: 'Cancel',
  Send: 'Send',
  'Request sent successfully': 'Request sent successfully',
};

function renderInquiry() {
  const imageSource = {
    toDataURL: () => 'data:image/png;base64,preview',
  } as HTMLCanvasElement;
  const onClose = jest.fn();
  render(
    <Inquiry
      imageSource={imageSource}
      isPopupOpened={true}
      labels={labels}
      onClose={onClose}
      prefilters={[]}
    />,
  );
  return { onClose };
}

describe('isValidInquiryEmail', () => {
  it('rejects empty and incomplete addresses', () => {
    expect(isValidInquiryEmail('')).toBe(false);
    expect(isValidInquiryEmail('   ')).toBe(false);
    expect(isValidInquiryEmail('not-an-email')).toBe(false);
    expect(isValidInquiryEmail('missing-domain@')).toBe(false);
  });

  it('accepts a trimmed address with an @ and a dot', () => {
    expect(isValidInquiryEmail('  user@example.com  ')).toBe(true);
  });
});

describe('Inquiry send guard', () => {
  beforeEach(() => {
    window.nyrisSettings = {
      emailTemplateId: 'template_sznbtrs',
    } as typeof window.nyrisSettings;
    jest.clearAllMocks();
  });

  it('keeps Send disabled and does not call EmailJS when the email is empty', () => {
    const { onClose } = renderInquiry();
    const send = screen.getByText('Send') as HTMLButtonElement;

    expect(send.disabled).toBe(true);
    fireEvent.click(send);

    expect(emailjs.send).not.toHaveBeenCalled();
    expect(prepareInquiryImage).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('keeps Send disabled when the email is invalid', () => {
    renderInquiry();
    fireEvent.change(document.querySelector('input[type="email"]') as HTMLInputElement, {
      target: { value: 'not-an-email' },
    });

    const send = screen.getByText('Send') as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.click(send);
    expect(emailjs.send).not.toHaveBeenCalled();
  });

  it('disables Send again after a valid email is cleared', () => {
    const { onClose } = renderInquiry();
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: 'user@example.com' } });
    expect((screen.getByText('Send') as HTMLButtonElement).disabled).toBe(false);

    fireEvent.change(emailInput, { target: { value: '' } });
    const send = screen.getByText('Send') as HTMLButtonElement;
    expect(send.disabled).toBe(true);
    fireEvent.click(send);
    expect(emailjs.send).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('sends a trimmed email_id when the address is valid', async () => {
    const { onClose } = renderInquiry();
    const emailInput = document.querySelector('input[type="email"]') as HTMLInputElement;
    fireEvent.change(emailInput, { target: { value: '  user@example.com  ' } });

    const send = screen.getByText('Send') as HTMLButtonElement;
    expect(send.disabled).toBe(false);
    fireEvent.click(send);

    await Promise.resolve();
    await Promise.resolve();

    expect(emailjs.send).toHaveBeenCalledWith(
      'service_zfsxshi',
      'template_sznbtrs',
      expect.objectContaining({
        email_id: 'user@example.com',
      }),
    );
    expect(onClose).toHaveBeenCalled();
  });

  it('marks Send as a support_request conversion for the events tracker', () => {
    renderInquiry();
    const send = screen.getByText('Send') as HTMLButtonElement;
    expect(send.getAttribute('data-nyris-conversion')).toBe('support_request');
  });
});
