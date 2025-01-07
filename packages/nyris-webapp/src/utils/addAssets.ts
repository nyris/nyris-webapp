export const addAssets = (urls: string[]) => {
  return Promise.all(
    urls.map(url => {
      return new Promise<void>((resolve, reject) => {
        let element: HTMLScriptElement | HTMLLinkElement;

        if (url.endsWith('.css')) {
          // Create a link element for CSS
          element = document.createElement('link');
          element.rel = 'stylesheet';
          element.href = url;

          // Handle load and error for CSS
          element.onload = () => {
            resolve();
          };
          element.onerror = () => {
            reject(new Error(`Failed to load CSS: ${url}`));
          };
        } else {
          // Create a script element for JS
          element = document.createElement('script');
          element.src = url;
          element.async = true;

          // Handle load and error for JS
          element.onload = () => {
            resolve();
          };
          element.onerror = () => {
            reject(new Error(`Failed to load script: ${url}`));
          };
        }

        // Append the element to the document
        document.head.appendChild(element);
      });
    }),
  );
};
