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
      throw new Error(`Error loading documents: ${response.status}`);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("Failed to load documents:", error);
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
      throw new Error(`Error updating document: ${response.status}`);
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log(`Failed to update document: ${error}`);
  }
};

export const createDocument = async (newDocument, user) => {
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
    const newDocumentId = await response.json();
    console.log(newDocumentId);

    if (!response.ok) {
      throw new Error(`Error saving document: ${response.status}`);
    }
    return newDocumentId;
  } catch (error) {
    console.log(`Failed to save document: ${error}`);
  }
};
