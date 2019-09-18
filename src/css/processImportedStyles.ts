let pendingPromises: Array<Promise<any>> = [];

export const processImportedStyles = (check?: boolean): Promise<any> => {
  const links = Array
    .from(document.getElementsByTagName("style"))
    .filter(link => link.dataset.deferredStyle);

  if (check && !links.length && !pendingPromises.length) {
    return undefined;
  }

  const operation = Promise.all(
    links.map(link => {
      if (link.dataset.deferredStyle) {
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = link.dataset.href;
        style.type = "text/css";

        delete link.dataset.deferredStyle;

        return new Promise(resolve => {
          style.addEventListener('load', resolve);
          link.parentNode.insertBefore(style, link);
          link.parentNode.removeChild(link);
        });
      }

      return null;
    })
  );

  pendingPromises.push(operation);
  operation.then(() => {
    pendingPromises = pendingPromises.filter(op => op !== operation);
  });

  return Promise.all(pendingPromises);
};