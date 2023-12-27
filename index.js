import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from "firebase-admin/firestore";
import { collection, getDocs } from "firebase/firestore";
import express, { json } from "express";
const app = express();

import cors from 'cors'

import serviceAccount from "./creds.json" assert { type: "json" };

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

app.use(cors())

// Middleware to parse JSON request body
app.use(json());



app.get("/getRegions", async (req, res) => {
  try {
    const regions = await db.listCollections();
    const regionNames = regions.map((region) => region.id);
    res.send({ regions: regionNames });
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).send({ 'Message': 'Error fetching regions' });
  }
});

app.get("/getDocuments/:region", async (req, res) => {
  try {
    const documents = await db.collection(req.params.region).listDocuments();
    const documentIds = documents.map((doc) => doc.id);
    res.send({ documents: documentIds });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send({ 'Message': 'Error fetching documents, regions' });
  }
});

app.get("/getAllDocumentNames", async (req, res) => {
  try {
    const regionsSnapshot = await db.listCollections();//regionname
    const regions = regionsSnapshot.map((doc) => doc.id);//maps and stores it in regions

    const allDocumentNames = [];

    for (const region of regions) {
      const regionRef = db.collection(region);
      const documentsSnapshot = await regionRef.get();

      const documentNames = documentsSnapshot.docs.map(doc => doc.id);

      for (const docName of documentNames) {
        if (!allDocumentNames.includes(docName)) {
          allDocumentNames.push(docName);
        }
      }
    }

    res.send({ allDocumentNames });
  } catch (error) {
    console.error('Error fetching all document names:', error);
    res.status(500).send({ 'Message': 'Error fetching all document names' });
  }
});


app.get("/getCollectionsByTechnology/:technology", async (req, res) => {
  try {
    const tech = req.params.technology;
    const regionsSnapshot = await db.listCollections();
    const regions = regionsSnapshot.map((doc) => doc.id);

    const foundDocuments = [];

    for (const region of regions) {
      const regionRef = db.collection(region);
      const documentsSnapshot = await regionRef.get();

      const documentNames = documentsSnapshot.docs.map(doc => doc.id);

      for (const docName of documentNames) {
        if (docName === tech.substring(1)) {

          // List collections inside the matched document
          const docRef = regionRef.doc(docName);
          const collections = await docRef.listCollections();

          for (const collection of collections) {
            const colRef = docRef.collection(collection.id);
            const documents = await colRef.get();

            const documentsData = documents.docs.map(doc => doc.data());

            foundDocuments.push({
              region,
              documentName: docName,
              collection: {
                id: collection.id,
                name: collection.id, 
                data: documentsData,
              },
            });
          }
        }
      }
    }

    res.send({ foundDocuments });
  } catch (error) {
    console.error('Error fetching collections by technology:', error);
    res.status(500).send({ 'Message': 'Error fetching collections by technology' });
  }
});





app.get("/getCollectionss/:region/", async (req, res) => {
  try {
    const regionRef = db.collection(req.params.region);
    const regionDocs = await regionRef.get();
    //get the documents inside the region

    const field = [];

    for (const doc of regionDocs.docs) {
      const docRef = regionRef.doc(doc.id);
      const collections = await docRef.listCollections();

      for (const collection of collections) {
        //it is iterating over each collection inside the documents - solar and wind for example
        const colRef = docRef.collection(collection.id);
        const documents = await colRef.get();
        //gets the documents inside that particular collection with .get() function
        const documentsData = [];
        documents.forEach((doc) => {
          documentsData.push(doc.data());
        });

        field.push({
          documentId: doc.id,
          collectionId: collection.id,
          data: documentsData,
        });
      }
    }

    res.send({ collections: field });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send({ 'Message': 'Error fetching collections' });
  }
});

app.get("/getCollections/:region/:document/", async (req, res) => {
  try {
    const sfRef = db.collection(req.params.region).doc(req.params.document);
    const collections = await sfRef.listCollections();
    const field = [];

    for (const collection of collections) {
      // Iterate over each collection inside the document (e.g., solar and wind)
      const colRef = sfRef.collection(collection.id);
      const documents = await colRef.get();
      //get function is used to get documents inside a collection

      const documentsData = [];

      documents.forEach((doc) => {
        // Iterate over each document inside the collection
        documentsData.push(doc.data());
      });

      field.push({
        documentId: req.params.document,
        collectionId: collection.id,
        data: documentsData,
      });
    }

    res.send({ collections: field });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send({ 'Message': 'Error fetching collections' });
  }
});


// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
