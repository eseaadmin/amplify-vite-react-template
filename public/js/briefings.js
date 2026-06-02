// Briefings GraphQL client. Loaded by admin.html and briefing.html.
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

  const BRIEFING_FIELDS = 'id title category created_at publish_date author tags summary content status is_featured createdAt updatedAt';

  async function listBriefings() {
    const data = await gql(
      `query ListBriefings { listBriefings(limit: 1000) { items { ${BRIEFING_FIELDS} } } }`,
      {}
    );
    return data.listBriefings.items;
  }

  async function getBriefing(id) {
    const data = await gql(
      `query GetBriefing($id: ID!) { getBriefing(id: $id) { ${BRIEFING_FIELDS} } }`,
      { id }
    );
    return data.getBriefing;
  }

  async function createBriefing(input) {
    const data = await gql(
      `mutation CreateBriefing($input: CreateBriefingInput!) { createBriefing(input: $input) { ${BRIEFING_FIELDS} } }`,
      { input }
    );
    return data.createBriefing;
  }

  async function updateBriefing(input) {
    const data = await gql(
      `mutation UpdateBriefing($input: UpdateBriefingInput!) { updateBriefing(input: $input) { ${BRIEFING_FIELDS} } }`,
      { input }
    );
    return data.updateBriefing;
  }

  async function deleteBriefing(id) {
    const data = await gql(
      `mutation DeleteBriefing($input: DeleteBriefingInput!) { deleteBriefing(input: $input) { id } }`,
      { input: { id } }
    );
    return data.deleteBriefing;
  }

  window.BriefingsAPI = { listBriefings, getBriefing, createBriefing, updateBriefing, deleteBriefing };
})();
