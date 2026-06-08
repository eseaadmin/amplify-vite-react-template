// Blogs GraphQL client. Loaded by content.html and post.html.
(() => {
  let cachedConfig = null;

  async function getConfig() {
    if (!cachedConfig) {
      const res = await fetch('/amplify_outputs.json');
      const json = await res.json();
      cachedConfig = { endpoint: json.data.url, apiKey: json.data.api_key };
    }
    return cachedConfig;
  }

  async function gql(query, variables) {
    const { endpoint, apiKey } = await getConfig();
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
      body: JSON.stringify({ query, variables })
    });
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data;
  }

  const BLOG_FIELDS = 'id title category created_at publish_date author tags emoji summary content status is_featured createdAt updatedAt';

  async function listBlogs() {
    const data = await gql(
      `query ListBlogs { listBlogs(limit: 1000) { items { ${BLOG_FIELDS} } } }`,
      {}
    );
    return data.listBlogs.items;
  }

  async function getBlog(id) {
    const data = await gql(
      `query GetBlog($id: ID!) { getBlog(id: $id) { ${BLOG_FIELDS} } }`,
      { id }
    );
    return data.getBlog;
  }

  async function createBlog(input) {
    const data = await gql(
      `mutation CreateBlog($input: CreateBlogInput!) { createBlog(input: $input) { ${BLOG_FIELDS} } }`,
      { input }
    );
    return data.createBlog;
  }

  async function updateBlog(input) {
    const data = await gql(
      `mutation UpdateBlog($input: UpdateBlogInput!) { updateBlog(input: $input) { ${BLOG_FIELDS} } }`,
      { input }
    );
    return data.updateBlog;
  }

  async function deleteBlog(id) {
    const data = await gql(
      `mutation DeleteBlog($input: DeleteBlogInput!) { deleteBlog(input: $input) { id } }`,
      { input: { id } }
    );
    return data.deleteBlog;
  }

  window.BlogsAPI = { listBlogs, getBlog, createBlog, updateBlog, deleteBlog };
})();
