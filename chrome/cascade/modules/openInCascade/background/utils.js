export const extractDecodedUrl = (safelinkUrl) => {
  const fullyDecodeUrl = (encodedUrl) => {
    let previousUrl = "";
    let currentUrl = encodedUrl;

    while (previousUrl !== currentUrl) {
      try {
        previousUrl = currentUrl;
        currentUrl = decodeURIComponent(currentUrl);
      } catch (error) {
        break;
      }
    }

    return currentUrl;
  };
  const encodeUrlForHref = (decodedUrl) => {
    // Break down the URL into its components
    const url = new URL(decodedUrl);

    // Break down the path into its individual parts
    let pathParts = url.pathname.split("/");

    // URL-encode each part of the path
    for (let i = 0; i < pathParts.length; i++) {
      pathParts[i] = encodeURIComponent(pathParts[i]);
    }

    // Reassemble the path
    url.pathname = pathParts.join("/");
    return url.href;
  };
  if (!safelinkUrl.includes(".safelinks.protection.outlook.com/?url=")) {
    throw new Error(
      `URL ${safelinkUrl} doesn't have '.safelinks.protection.outlook.com/?url='`
    );
  }
  const encodedUrlPart = safelinkUrl.split("url=")[1];
  if (!encodedUrlPart) {
    throw new Error(`No URL found in the safelink: ${safelinkUrl}`);
  }
  const encodedUrl = encodedUrlPart.split("&")[0];
  const decodedUrl = fullyDecodeUrl(encodedUrl);
  return encodeUrlForHref(decodedUrl);
};
