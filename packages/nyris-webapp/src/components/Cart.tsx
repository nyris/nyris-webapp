import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Tooltip from './Tooltip/TooltipComponent';
import { twMerge } from 'tailwind-merge';
import toast from 'react-hot-toast';
import { Icon } from '@nyris/nyris-react-components';

const Cart = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartParts, setCartParts] = useState<any[]>([]);
  const [amountOfParts, setAmountOfParts] = useState(0);
  const [quantityEdits, setQuantityEdits] = useState<Record<string, string>>(
    {},
  );

  const updateCount = () => {
    const cart = sessionStorage.getItem('cart');
    if (cart) {
      const parsedCart = JSON.parse(cart);
      setCartParts(parsedCart);
      const amount = parsedCart.reduce(
        (total: number, part: any) => total + (part.quantity || 1),
        0,
      );
      setAmountOfParts(amount);
    } else {
      setCartParts([]);
      setAmountOfParts(0);
    }
  };

  useEffect(() => {
    updateCount();

    window.addEventListener('cart-updated', updateCount);

    return () => {
      window.removeEventListener('cart-updated', updateCount);
    };
  }, []);

  const onToggleCart = (isOpen: boolean) => {
    setIsCartOpen(isOpen);
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  };

  const clearSessionProducts = () => {
    sessionStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removePartBySku = (skuToRemove: string): void => {
    const updatedCart = cartParts.filter((p: any) => p.sku !== skuToRemove);
    if (!updatedCart.length) {
      setIsCartOpen(false);
    }
    sessionStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const updateQuantity = (sku: string, delta: number) => {
    const updated = cartParts
      .map((part: any) => {
        if (part.sku !== sku) return part;
        const newQuantity = (part.quantity || 1) + delta;
        return newQuantity > 0 ? { ...part, quantity: newQuantity } : null;
      })
      .filter(Boolean);
    setQuantityEdits(prev => {
      if (!Object.prototype.hasOwnProperty.call(prev, sku)) return prev;
      const next = { ...prev };
      delete next[sku];
      return next;
    });
    setCartParts(updated);
    if (!updated.length) {
      setIsCartOpen(false);
    }
    sessionStorage.setItem('cart', JSON.stringify(updated));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const getQuantityDisplayValue = (sku: string, quantity: number) =>
    quantityEdits[sku] ?? String(quantity || 1);

  const generateCSVContent = (): string => {
    const rows = [['Product Sku', 'Product Name', 'Quantity']];
    cartParts.forEach((part: any) => {
      rows.push([part.sku, part.title, (part.quantity || 1).toString()]);
    });
    return rows.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
  };

  const downloadCSV = () => {
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'products.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // clearSessionProducts();

    toast.success('Your data has been downloaded.');
  };

  return (
    <>
      <Tooltip
        content="The basket is currently empty"
        disabled={!!amountOfParts}
      >
        <div
          className={twMerge(
            'h-[56px] min-w-[56px]',
            'desktop:min-w-[68px] desktop:h-[68px] bg-white rounded-2xl flex items-center justify-center ',
            'border border-solid border-[#DDDEE7]',
            'shadow-ds-1',
          )}
        >
          <button
            className={twMerge(
              'relative flex items-center justify-center rounded-2xl',
              'h-10 w-10',
            )}
            style={{
              backgroundColor:
                amountOfParts > 0
                  ? window.settings.theme.primaryColor
                  : '#FAFAFA',
            }}
            onClick={() => onToggleCart(true)}
          >
            {amountOfParts ? (
              <div
                className={twMerge(
                  'absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white border-solid text-white',
                  'text-[9px]',
                )}
                style={{
                  backgroundColor: window.settings.theme.primaryColor,
                }}
              >
                {amountOfParts}
              </div>
            ) : (
              ''
            )}
            <Icon
              name="cart"
              className={twMerge(
                amountOfParts > 0 ? 'fill-white text-white' : 'text-[#BBBDCF]',
              )}
            />
          </button>
        </div>
      </Tooltip>
      {isCartOpen &&
        createPortal(
          <div className={twMerge('fixed inset-0 z-[51]')}>
            <div
              className="absolute inset-0 bg-black/20"
              onClick={() => onToggleCart(false)}
            />
            <div
              className={twMerge(
                'absolute right-0 flex h-full w-[410px] max-w-full flex-col bg-transparent',
                'p-4',
              )}
            >
              <div className="flex h-full  max-w-full flex-col bg-white rounded-2xl">
                <div className="flex h-[52px] items-center justify-between px-4 py-2 border-b border-solid border-[#DDDEE7]">
                  <div className="text-xl font-semibold">
                    Your cart ({amountOfParts} items)
                  </div>
                  <div className="flex items-center">
                    {amountOfParts > 0 ? (
                      <button
                        type="button"
                        className="mr-4 flex items-center gap-1 rounded border border-[#E31B5D] px-2 py-1 text-[9px] font-normal text-[#E31B5D]"
                        onClick={() => {
                          clearSessionProducts();
                          setIsCartOpen(false);
                        }}
                      >
                        <Icon name="trash" />
                        Clear All
                      </button>
                    ) : (
                      ''
                    )}
                    <button className="p-0" onClick={() => onToggleCart(false)}>
                      <Icon name="close" className="h-5 w-5 fill-[#55566B]" />
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto p-4 flex flex-col gap-2.5">
                  {amountOfParts === 0 ? (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <div className="text-base text-[#CACAD1]">
                        No items have been added
                      </div>
                    </div>
                  ) : (
                    ''
                  )}
                  {cartParts.map((part: any, i: number) => (
                    <div
                      key={part.sku + i}
                      className={twMerge(
                        'flex h-fit w-full items-center justify-between rounded-lg border border-solid border-[#DDDEE7] bg-[#F3F4F8]',
                        'p-2',
                        'gap-2',
                      )}
                    >
                      <div className="flex flex-1 items-center">
                        <img
                          src={
                            !window.settings.algolia.enabled
                              ? part['image']
                              : part['image(main_similarity)']
                                ? part['image(main_similarity)']
                                : part['main_image_link']
                          }
                          key={part.sku + i}
                          alt={`product ${i}`}
                          className="mr-2 h-[50px] w-[50px] bg-white object-contain"
                        />
                        <div>
                          <div>
                            <div className="max-w-[175px] break-words text-[9px] font-normal">
                              {part.sku}
                            </div>
                            <div className="max-w-[175px] break-words text-xs font-semibold">
                              {part.title}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="ml-auto flex items-center gap-4 pr-4">
                          <button
                            className="h-4 w-4 rounded-full bg-[#FAFAFA]"
                            onClick={() => updateQuantity(part.sku, -1)}
                          >
                            <Icon name="minus" width="16" height="16" />
                          </button>
                          <input
                            className="flex h-[22px] w-[22px] items-center justify-center rounded border border-solid border-[#DDDEE7] bg-white text-center"
                            value={getQuantityDisplayValue(
                              part.sku,
                              part.quantity,
                            )}
                            onChange={e => {
                              const rawValue = e.target.value;
                              if (rawValue === '') {
                                setQuantityEdits(prev => ({
                                  ...prev,
                                  [part.sku]: '',
                                }));
                                return;
                              }

                              if (!/^[0-9]+$/.test(rawValue)) return;

                              const newValue = Number(rawValue);
                              if (newValue < 1) return;

                              setQuantityEdits(prev => ({
                                ...prev,
                                [part.sku]: rawValue,
                              }));
                              updateQuantity(
                                part.sku,
                                newValue - (part.quantity || 0),
                              );
                            }}
                            onBlur={() => {
                              if (quantityEdits[part.sku] === '') {
                                setQuantityEdits(prev => {
                                  const updated = { ...prev };
                                  delete updated[part.sku];
                                  return updated;
                                });
                              }
                            }}
                          />
                          <button
                            className="h-4 w-4 rounded-full bg-[#FAFAFA] flex items-center justify-center"
                            onClick={() => updateQuantity(part.sku, 1)}
                          >
                            <Icon name="plus" width="10" height="10" />
                          </button>
                        </div>
                        <button
                          className="h-7 w-7 rounded bg-[#FFE5EF4D] p-1.5"
                          onClick={() => removePartBySku(part.sku)}
                        >
                          <Icon name="trash" color="#E31B5D" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {amountOfParts > 0 ? (
                    <button
                      className="flex h-12 w-full items-center justify-center rounded-lg bg-[#3E36DC] text-base font-semibold text-white"
                      type="button"
                      onClick={downloadCSV}
                    >
                      <Icon name="download" />
                      <span className="ml-2">Download all data</span>
                    </button>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
};

export default Cart;
