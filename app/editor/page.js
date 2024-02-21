"use client";

import Editor from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  getCollection,
  updateDocuments,
  deleteDocument,
  createDocument,
} from "../lib/db";

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
  const [user, setUser] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [iframeURL, setIframeURL] = useState("");
  const [deploymentId, setDeploymentId] = useState("");
  const [deploymentStatus, setDeploymentStatus] = useState("");
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (!user) return;
    async function getSupabaseUser() {
      const {
        data: { user: supabaseUser },
      } = await supabase.auth.getUser();

      if (supabaseUser) {
        // redirect to editor page
        console.log(supabaseUser);
        setUser(supabaseUser);
      } else {
        console.log("user is not logged in");
      }
    }

    getSupabaseUser();
  }, []);

  useEffect(() => {
    if (project != "") return;
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
      console.log(user);
      const collection = await getCollection(user);
      setDocuments(collection);
    };
    getDocuments();
    createSubhosting();
  }, [user]); // Add dependency on user

  useEffect(() => {
    if (user && project) {
      const getDocuments = async () => {
        console.log(user);
        const collection = await getCollection(user);
        setDocuments(collection);
      };
      getDocuments();
    }
  }, [user]); // Add dependency on user

  const handleEditorChange = (value, event) => {
    setCodeText(value);
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const holder = await updateDocuments(codeText, documentId);
  };

  const handleRun = async (event) => {
    event.preventDefault();
    setURL(""); // Clear previous response message
    console.log("handleRun docs", documents);
    console.log("handleRun project", project);

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
      console.log("response data from deploy: ", responseData);
      setURL(`https://${project.name}-${responseData.id}.deno.dev`); // Update the response message state
      setDeploymentId(responseData.id);
    } catch (error) {
      setURL(`Failed to deploy code: ${error}`);
    }
    console.log("project URL: ", URL);
  };

  useEffect(() => {
    if (URL === "") return;
    let isMounted = true; // Track if component is mounted to prevent state update on unmounted component

    const checkDeploymentStatus = async () => {
      try {
        while (isMounted && deploymentStatus !== "complete") {
          const response = await fetch("/api/subhosting/poll", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              deploymentId: deploymentId,
            }),
          });
          const status = await response.json();
          console.log(status);
          if (status === "success") {
            if (isMounted) {
              setDeploymentStatus("complete");
              setIframeURL(URL);
            }
          } else {
            // Wait for a specified time before the next check
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        }
      } catch (error) {
        console.error("Failed to check job status:", error);
      }
    };

    checkDeploymentStatus();

    return () => {
      isMounted = false; // Set isMounted to false when the component unmounts
    };
  }, [deploymentStatus, URL]);

  const handleAddNewDocument = () => {
    setShowModal(true);
  };

  const createNewDocument = async (documentName) => {
    // Here you would send the documentName to your API to save it in MongoDB
    // For demonstration, assuming the document gets saved and returns an ID

    const newDocument = {
      _id: "",
      name: documentName,
      text: "// New code here",
    };
    const newDocumentId = await createDocument(documentName);
    newDocument._id = newDocumentId;
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
              onSave={createNewDocument}
            />
          </div>
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
            {isLoading && <p className="text-center">Request sent...</p>}
            <iframe
              src={iframeURL}
              title="Deployed Project"
              width="100%"
              height="300px"
              //onLoad={handleLoad}
              //onError={handleError}
              style={{ display: isLoading ? "none" : "block" }} // Hide iframe while loading
            ></iframe>
          </div>
        </aside>
      </div>
    </div>
  );
}
