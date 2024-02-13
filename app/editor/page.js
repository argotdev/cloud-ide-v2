"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

const NewDocumentModal = ({ isOpen, onClose, onSave }) => {
  const [documentName, setDocumentName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(documentName);
    onClose(); // Close modal after save
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-base font-semibold leading-6 text-gray-900">
          Add your file
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 sm:flex sm:items-center">
          <div className="w-full sm:max-w-xs">
            <label htmlFor="filename" className="sr-only">
              File name
            </label>
            <input
              type="text"
              placeholder="Document Name"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
          <button
            type="submit"
            className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:ml-3 sm:mt-0 sm:w-auto"
          >
            Add
          </button>
        </form>
      </div>
    </div>
  );
};

export default function IDE() {
  const [codeText, setCodeText] = useState("");
  const [documents, setDocuments] = useState([]);
  const [documentId, setDocumentId] = useState("");
  const [URL, setURL] = useState("");
  const [project, setProject] = useState("");
  const [user, setUser] = useState("");
  const [showModal, setShowModal] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function getSupabaseUser() {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        // redirect to editor page
        setUser(supabaseUser);
      } else {
        console.log("user is not logged in");
      }
    }

    getSupabaseUser();
  }, [supabase]);

  useEffect(() => {
    const createSubhosting = async () => {
      try {
        const response = await fetch("/api/subhosting/create", {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error(`Error creating project: ${response.status}`);
        }

        const responseData = await response.json();
        setProject(responseData);
      } catch (error) {
        console.error("Failed to create project:", error);
      }
    };

    const getDocuments = async () => {
      try {
        // Assuming user is required to be logged in
        if (!user) return;

        const response = await fetch("/api/documents/get", {
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
        setDocuments(responseData);
      } catch (error) {
        console.error("Failed to load project:", error);
      }
    };
    getDocuments();
    createSubhosting();
  }, [user]); // Add dependency on user

  const handleEditorChange = (value, event) => {
    setCodeText(value);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    try {
      const response = await fetch("/api/documents/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: codeText, id: documentId }),
      });
    } catch (error) {
      console.log(`Failed to save code: ${error}`);
    }
  };

  const handleRun = async (event) => {
    event.preventDefault();
    setURL(""); // Clear previous response message

    try {
      const response = await fetch("/api/subhosting/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ documents: documents, project: project["id"] }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const responseData = await response.json(); // Assuming the response is in JSON format
      console.log(responseData);
      setURL(`https://${project.name}-${responseData.id}.deno.dev`); // Update the response message state
    } catch (error) {
      setURL(`Failed to deploy code: ${error}`);
    }
  };

  const handleAddNewDocument = () => {
    setShowModal(true);
  };

  const saveNewDocument = async (documentName) => {
    // Here you would send the documentName to your API to save it in MongoDB
    // For demonstration, assuming the document gets saved and returns an ID

    const newDocument = {
      _id: "",
      name: documentName,
      text: "// New code here",
    };

    try {
      const response = await fetch("/api/documents/save", {
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
      newDocument._id = await response.json();
      console.log(newDocument._id);

      if (!response.ok) {
        throw new Error(`Error loading project: ${response.status}`);
      }
    } catch (error) {
      console.log(`Failed to save code: ${error}`);
    }
    setDocuments([...documents, newDocument]);
    setCodeText(newDocument.text);
    setDocumentId(newDocument._id);
    // Optionally, close the modal here if not already handled
    setShowModal(false);
  };

  return (
    <div className="flex min-h-full flex-col bg-gray-900">
      <header className="shrink-0 border-b border-gray-200 bg-white py-4 px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          <img
            className="h-8 w-auto"
            src="https://raw.githubusercontent.com/denolib/high-res-deno-logo/master/deno_hr_circle.svg"
            alt="Your Company"
          />
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl items-start gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="sticky top-8 w-64 shrink-0 lg:block rounded-md border border-gray-200">
          <div className="mb-4">
            {" "}
            {/*Spacing above doc list */}
            <button
              onClick={handleAddNewDocument}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 px-4 rounded-md w-full"
            >
              + New Document
            </button>
            <NewDocumentModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onSave={saveNewDocument}
            />
          </div>
          {console.log(documents)}
          <ul className="divide-y divide-gray-200">
            {documents.map((document) => (
              <li
                key={document._id.toString()}
                className="p-3 hover:bg-gray-100"
              >
                <button
                  onClick={() => {
                    setCodeText(document.text);
                    setDocumentId(document._id);
                  }}
                  className="text-blue-600 hover:text-blue-800 block"
                >
                  {document.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-6 rounded-md border border-gray-200">
          {" "}
          {/* Background for Editor */}
          <Editor
            height="70vh"
            defaultLanguage="javascript"
            defaultValue="//code here"
            value={codeText}
            onChange={handleEditorChange}
            theme="vs-dark"
          />
          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={handleUpdate}
              className="bg-gray-700 hover:bg-gray-800 text-white font-semibold py-2 px-4 rounded-md"
            >
              Save
            </button>
            <button
              onClick={handleRun}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-md"
            >
              Run
            </button>
          </div>
        </main>

        <aside className="sticky top-8 shrink-0 xl:block w-96">
          <div className="p-6 rounded-md border border-gray-200">
            {" "}
            {/*Iframe wrapper*/}
            <iframe
            // ... keep your existing iframe configuration
            ></iframe>
          </div>
        </aside>
      </div>
    </div>
  );
}
