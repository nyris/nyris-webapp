import { useCallback } from 'react';
import { clone } from 'lodash';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { isCadFile } from '@nyris/nyris-api';

import { useImageSearch } from 'hooks/useImageSearch';
import { useCadSearch } from 'hooks/useCadSearch';
import useRequestStore from 'stores/request/requestStore';

interface UploadFileOptions {
  showPreFilter?: boolean;
  resetTextSearch?: boolean;
}

export const useUploadSearch = () => {
  const settings = window.settings;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { singleImageSearch } = useImageSearch();
  const { cadSearch } = useCadSearch();

  const preFilterList = useRequestStore(state => state.preFilterList);
  const specifications = useRequestStore(state => state.specifications);

  const setQuery = useRequestStore(state => state.setQuery);
  const setValueInput = useRequestStore(state => state.setValueInput);

  const setRequestImages = useRequestStore(state => state.setRequestImages);
  const setSpecifications = useRequestStore(state => state.setSpecifications);
  const setShowLoading = useRequestStore(state => state.setShowLoading);
  const setNameplateNotificationText = useRequestStore(
    state => state.setNameplateNotificationText,
  );
  const setShowNotMatchedError = useRequestStore(
    state => state.setShowNotMatchedError,
  );
  const setAlgoliaFilter = useRequestStore(state => state.setAlgoliaFilter);
  const setPreFilter = useRequestStore(state => state.setPreFilter);
  const setNameplateImage = useRequestStore(state => state.setNameplateImage);

  const uploadFile = useCallback(
    (
      file: File,
      {
        showPreFilter = settings.preFilterOption,
        resetTextSearch = true,
      }: UploadFileOptions = {},
    ) => {
      if (resetTextSearch) {
        setValueInput('');
        setQuery('');
      }

      if (isCadFile(file)) {
        return cadSearch({ file, settings, newSearch: true }).then(() => {});
      }

      setShowLoading(true);

      return singleImageSearch({
        image: file,
        settings,
        showFeedback: true,
        newSearch: true,
        clearPostFilter: true,
      }).then(singleImageResp => {
        const specificationPrefilter =
          singleImageResp?.image_analysis?.specification?.prefilter_value ||
          null;
        const hasPrefilter = preFilterList.filter((filter: any) =>
          filter.values.includes(specificationPrefilter),
        );

        if (specificationPrefilter) {
          setRequestImages([]);
          setShowNotMatchedError(false);

          if (hasPrefilter.length) {
            setSpecifications(
              clone(singleImageResp?.image_analysis?.specification),
            );
            setNameplateImage(file);
            setPreFilter({
              [singleImageResp?.image_analysis?.specification?.prefilter_value]:
                true,
            });
            setAlgoliaFilter(
              `${settings.alogoliaFilterField}:'${singleImageResp?.image_analysis?.specification?.prefilter_value}'`,
            );

            setShowLoading(false);
            navigate('/result');

            setTimeout(() => {
              setNameplateNotificationText(
                t('We have successfully defined the search criteria', {
                  prefilter_value: specificationPrefilter,
                  preFilterTitle:
                    window.settings.preFilterTitle?.toLocaleLowerCase(),
                }),
              );
            }, 1000);

            setTimeout(() => {
              setNameplateNotificationText('');
            }, 10000);
          }

          if (!hasPrefilter.length && showPreFilter) {
            setSpecifications(
              clone({
                ...singleImageResp?.image_analysis?.specification,
                specificationPrefilter,
              }),
            );
            navigate('/result');
            setPreFilter({});
            setAlgoliaFilter('');
            setShowLoading(false);
            setShowNotMatchedError(true);

            setTimeout(() => {
              setNameplateNotificationText(
                t('Extracted details from the nameplate could not be matched', {
                  preFilterTitle:
                    window.settings.preFilterTitle?.toLocaleLowerCase(),
                }),
              );
            }, 1000);

            setTimeout(() => {
              setNameplateNotificationText('');
            }, 15000);
          }
        } else {
          if (!specifications?.is_nameplate) {
            setSpecifications({ ...specifications, is_nameplate: false });
          }
          setShowLoading(false);
          navigate('/result');
        }
      });
    },
    [
      cadSearch,
      navigate,
      preFilterList,
      setAlgoliaFilter,
      setNameplateImage,
      setNameplateNotificationText,
      setPreFilter,
      setQuery,
      setRequestImages,
      setShowLoading,
      setShowNotMatchedError,
      setSpecifications,
      setValueInput,
      settings,
      singleImageSearch,
      specifications,
      t,
    ],
  );

  return {
    uploadFile,
  };
};
