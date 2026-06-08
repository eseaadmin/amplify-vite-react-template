// Videos GraphQL client. Loaded by content.html.
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

  const VIDEO_FIELDS = 'id title category created_at youtube_id speaker publish_date duration description status is_featured createdAt updatedAt';

  function isVideoSchemaMissing(error) {
    return /Field 'listVideos' in type 'Query' is undefined|Cannot query field "listVideos"/.test(error?.message || '');
  }

  async function listVideos() {
    try {
      const data = await gql(
        `query ListVideos { listVideos(limit: 1000) { items { ${VIDEO_FIELDS} } } }`,
        {}
      );
      return data.listVideos.items;
    } catch (error) {
      if (isVideoSchemaMissing(error)) return [];
      throw error;
    }
  }

  async function getVideo(id) {
    const data = await gql(
      `query GetVideo($id: ID!) { getVideo(id: $id) { ${VIDEO_FIELDS} } }`,
      { id }
    );
    return data.getVideo;
  }

  async function createVideo(input) {
    const data = await gql(
      `mutation CreateVideo($input: CreateVideoInput!) { createVideo(input: $input) { ${VIDEO_FIELDS} } }`,
      { input }
    );
    return data.createVideo;
  }

  async function updateVideo(input) {
    const data = await gql(
      `mutation UpdateVideo($input: UpdateVideoInput!) { updateVideo(input: $input) { ${VIDEO_FIELDS} } }`,
      { input }
    );
    return data.updateVideo;
  }

  async function deleteVideo(id) {
    const data = await gql(
      `mutation DeleteVideo($input: DeleteVideoInput!) { deleteVideo(input: $input) { id } }`,
      { input: { id } }
    );
    return data.deleteVideo;
  }

  window.VideosAPI = { listVideos, getVideo, createVideo, updateVideo, deleteVideo };
})();
