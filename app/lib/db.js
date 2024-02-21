export const getCollection = async (user) => {
  try {
    // Assuming user is required to be logged in
    console.log(user);
    if (!user) return;

    const response = await fetch("/api/documents/read", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId: user.id }), // Assuming API expects userId
    });

    if (!response.ok) {
      throw new Error(`Error loading project: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Failed to load project:", error);
  }
};

export const updateDocuments = async (codeText, documentId) => {
  try {
    const response = await fetch("/api/documents/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code: codeText, id: documentId }),
    });
    if (!response.ok) {
      throw new Error(`Error loading project: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(`Failed to save code: ${error}`);
  }
};

export const deleteDocument = async (id) => {
  try {
    const response = await fetch("/api/documents/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    if (!response.ok) {
      throw new Error(`Error loading project: ${response.status}`);
    }

    const responseData = await response.json();
    setDocuments(responseData);
  } catch (error) {
    console.error("Failed to load project:", error);
  }
};

export const createDocument = async (documentName) => {
  try {
    const response = await fetch("/api/documents/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: newDocument.name,
        text: newDocument.text,
        userId: user.id,
      }),
    });
    newDocumentId = await response.json();
    console.log(newDocumentId);

    if (!response.ok) {
      throw new Error(`Error loading project: ${response.status}`);
    }
  } catch (error) {
    console.log(`Failed to save code: ${error}`);
  }
};
