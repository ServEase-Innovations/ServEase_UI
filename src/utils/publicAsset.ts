/**
 * URL for a file served from `public/` (Create React App).
 * Root-relative paths avoid broken requests on nested client routes (`../foo.png` resolves against the current URL path).
 */
export function publicAsset(fileName: string) {
    const base = (process.env.PUBLIC_URL || "").replace(/\/$/, "");
    const path = fileName.replace(/^\//, "");
    return base ? `${base}/${path}` : `/${path}`;
}
