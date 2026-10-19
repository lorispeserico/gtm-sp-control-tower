export const fetchDataFromGoogleSheets = async (): Promise<AppData> => {
  const apiUrl = import.meta.env.VITE_GOOGLE_SHEET_API_URL;

  if (!apiUrl) {
    throw new Error('VITE_GOOGLE_SHEET_API_URL is not configured');
  }

  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch from Google Sheets API: ${response.status} ${response.statusText}`
    );
  }

  const contentType = response.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await response.text();
    throw new Error(
      `Google Sheets API returned non-JSON content (${contentType}): ${text.slice(0, 200)}`
    );
  }

  const data = await response.json();

  return {
    projects: data.projects || [],
    styles: data.styles || [],
    bindings: data.bindings || [],
    milestones: data.milestones || [],
  };
};
