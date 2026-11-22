// Type templates (WordPress-style): one CMS page per page type, e.g. every blog post.
// Shared by server and client code.

/** Category of the CMS rows that hold type templates. */
export const TEMPLATE_CATEGORY = "Template";

/** Slug of the template row for a page type, e.g. "template-blog-post". */
export const templateSlug = (type: string) => `template-${type}`;
