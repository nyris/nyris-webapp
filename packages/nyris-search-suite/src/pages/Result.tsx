import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { CadenasScriptStatus } from 'types';

import useResultStore from 'stores/result/resultStore';
import useUiStore from 'stores/ui/uiStore';

import { HitsPerPage } from 'components/HitsPerPage';
import { Pagination } from 'components/Pagination';
import ProductList from 'components/Product/ProductList';
import SidePanel from 'components/SidePanel';
import Loading from 'components/Loading';

import { addAssets } from 'utils/addAssets';
import Feedback from 'components/Feedback';
import { feedbackSuccessEpic } from 'services/Feedback';

const assets_base_url =
  'https://assets.nyris.io/nyris-widget/cadenas/8.1.0/api';

function Results() {
  const cadenas = window.settings.cadenas;

  const [feedbackStatus, setFeedbackStatus] = useState<
    'hidden' | 'submitted' | 'visible'
  >();
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const [cadenasScriptStatus, setCadenasScriptStatus] =
    useState<CadenasScriptStatus>('disabled');

  const productsFromFindApi = useResultStore(
    state => state.productsFromFindApi,
  );
  const productsFromAlgolia = useResultStore(
    state => state.productsFromAlgolia,
  );

  const isAlgoliaLoading = useUiStore(state => state.isAlgoliaLoading);
  const isFindApiLoading = useUiStore(state => state.isFindApiLoading);
  const setShowFeedback = useUiStore(state => state.setShowFeedback);
  const showFeedback = useUiStore(state => state.showFeedback);

  const requestId = useResultStore(state => state.requestId);

  useEffect(() => {
    if (cadenas?.cadenasAPIKey) {
      setCadenasScriptStatus('loading');
      addAssets([`${assets_base_url}/css/psol.components.min.css`]).catch(
        (error: any) => {
          setCadenasScriptStatus('failed');
        },
      );

      addAssets([`${assets_base_url}/js/thirdparty.min.js`])
        .then(() => {
          addAssets([`${assets_base_url}/js/psol.components.min.js`])
            .then(() => {
              setCadenasScriptStatus('ready');
            })
            .catch((error: any) => {
              setCadenasScriptStatus('failed');
            });
        })
        .catch((error: any) => {
          setCadenasScriptStatus('failed');
        });
    }
  }, [cadenas?.cadenasAPIKey]);

  const submitFeedback = async (data: boolean) => {
    setShowFeedbackSuccess(true);
    setTimeout(() => {
      setShowFeedbackSuccess(false);
    }, 3000);
    setFeedbackStatus('submitted');
    setShowFeedback(false);
    feedbackSuccessEpic(requestId, data);
  };

  useEffect(() => {
    if (isAlgoliaLoading || isFindApiLoading) {
      setFeedbackStatus('hidden');
      return;
    }

    if (!window.settings.showFeedback || !showFeedback) return;

    const handleScroll = () => {
      setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
      setShowFeedback(false);
    };

    setTimeout(() => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      setFeedbackStatus(s => (s === 'submitted' ? 'submitted' : 'visible'));
      setShowFeedback(false);
    }, 3000);

    window.addEventListener('scroll', handleScroll, {
      capture: true,
      once: true,
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    showFeedback,
    productsFromFindApi,
    productsFromAlgolia,
    isAlgoliaLoading,
    isFindApiLoading,
  ]);

  return (
    <>
      {isFindApiLoading && (
        <div className="box-wrap-loading" style={{ zIndex: 99999999 }}>
          <Loading />
        </div>
      )}
      <div className="h-full">
        <div
          className={twMerge(['flex', 'justify-between', 'relative', 'h-full'])}
        >
          <SidePanel />
          <div
            className={twMerge([
              'pt-10',
              'overflow-hidden',
              'overflow-y-auto',
              'flex',
              'flex-col',
              'relative',
              'w-full',
              'mr-auto',
              'ml-auto',
            ])}
          >
            <div
              className={twMerge([
                'flex',
                'flex-col',
                'flex-grow',
                'mt-4',
                'desktop:mt-0',
              ])}
            >
              <div
                className={twMerge([
                  'h-full',
                  'relative',
                  'flex',
                  'justify-center',
                  'mx-4',
                ])}
              >
                <div className="max-w-[840px] w-full relative">
                  <ProductList />

                  {showFeedbackSuccess && (
                    <div className={'feedback-floating'}>
                      <div className="feedback-section">
                        <div className="feedback-success">
                          Thanks for your feedback!
                        </div>
                      </div>
                    </div>
                  )}

                  {feedbackStatus === 'visible' &&
                    !showFeedbackSuccess &&
                    productsFromAlgolia.length > 0 && (
                      <div className={'feedback-floating'}>
                        <div className="feedback-section feedback-backdrop-blur" />

                        <div className="feedback-section">
                          <Feedback
                            submitFeedback={submitFeedback}
                            onFeedbackClose={() => {
                              setFeedbackStatus('submitted');
                              setShowFeedback(false);
                            }}
                          />
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
            <Pagination />
            <HitsPerPage
              items={[
                { label: '10', value: 10 },
                { label: '20', value: 20, default: true },
                { label: '30', value: 30 },
                { label: '40', value: 40 },
                { label: '50', value: 50 },
              ]}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Results;
