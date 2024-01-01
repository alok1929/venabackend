import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from "firebase-admin/firestore";
import { and, collection, getDocs } from "firebase/firestore";
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
    const fieldName = 'region';
    const mainCollectionRef = db.collection('Master');
    const result = [];
    
    // Use where clause to filter documents in the main collection
    const querySnapshot = await mainCollectionRef
      .where(fieldName, '!=', null)  // Filter documents where 'regions' is present
      .get();

    // Iterate over the documents in the main collection
    querySnapshot.forEach(doc => {
      // Access the 'regions' field of each document
      const regionsArray = doc.data()[fieldName];
      if (Array.isArray(regionsArray)) {
        // If 'regions' is an array, push its elements to the result array
        result.push(...regionsArray);
      }
    });

    res.send({ regions: result});
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).send({ 'Message': 'Error fetching regions' });
  }
});


app.get("/getTech", async (req, res) => {
  try {
    const fieldName = 'technology';
    const mainCollectionRef = db.collection('Master');
    const result = [];
    
    // Use where clause to filter documents in the main collection
    const querySnapshot = await mainCollectionRef
      .where(fieldName, '!=', null)  // Filter documents where 'regions' is present
      .get();

    // Iterate over the documents in the main collection
    querySnapshot.forEach(doc => {
      // Access the 'regions' field of each document
      const regionsArray = doc.data()[fieldName];
      if (Array.isArray(regionsArray)) {
        // If 'regions' is an array, push its elements to the result array
        result.push(...regionsArray);
      }
    });

    res.send({ technologies: result});
  } catch (error) {
    console.error('Error fetching regions:', error);
    res.status(500).send({ 'Message': 'Error fetching regions' });
  }
});


//only region parameter
const mainCollectionRef = db.collection('Contracts');
const fieldName = 'region';

app.get("/getDocuments/:region", async (req, res) => {
  try {
    const result = [];//array
    console.log(req.params.region)
    // Get all documents from the main collection
    const querySnapshot = await mainCollectionRef.get();
    // Iterate over the documents in the main collection
    querySnapshot.forEach(doc => {
      // Check if the specified field exists in the document
      if (doc.exists && doc.data().hasOwnProperty(fieldName) && doc.data()[fieldName] === req.params.region) {
        // Access the fields of each document
        const docData = doc.data();
        result.push(docData);
      }
    });

    res.send({ documents: result });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send({ 'Message': 'Error fetching documents, regions' });
  }
});

//only technology parameter
app.get("/getDocumentsbytech/:technology", async (req, res) => {
  try {
    const techfieldName = 'technology';
    const _mainCollectionRef = db.collection('Contracts');
    const technologyresult = [];
    console.log(req.params.technology)
    const technologyquerySnapshot = await _mainCollectionRef.get();
    technologyquerySnapshot.forEach(doc => {
      if (doc.exists && doc.data().hasOwnProperty(techfieldName) 
      && doc.data()[techfieldName] === req.params.technology) 
    {
        // Access the fields of each document
        const docData = doc.data();
        technologyresult.push(docData);
      }
    });
    res.send({ documents: technologyresult });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send({ 'Message': 'Error fetching documents, regions' });
  }
})

// region and technology parameters
app.get("/getDocumentsbyplantstech/:region/:technology/", async (req, res) => {
  try {
    const bothresult = [];
    const regionFieldName = 'region';
    const technologyFieldName = 'technology';

    // Use where clause to filter documents in the main collection
    const bothQuerySnapshot = await mainCollectionRef
      .where(regionFieldName, '==', req.params.region)
      .where(technologyFieldName, '==', req.params.technology)
      .get();

    // Iterate over the documents in the main collection
    bothQuerySnapshot.forEach(doc => {
      // Access the fields of each document
      const docData = doc.data();
      bothresult.push(docData);
    });

    res.send({ documents: bothresult });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send({ 'Message': 'Error fetching documents, regions' });
  }
});

//all the data in the db collection
// Retrieve all documents in the "Contracts" collection
app.get("/getAllDocuments", async (req, res) => {
  try {
    const allResult = [];

    // Retrieve all documents in the main collection
    const allQuerySnapshot = await mainCollectionRef.get();

    // Iterate over the documents in the main collection
    allQuerySnapshot.forEach(doc => {
      // Access the fields of each document
      const docData = doc.data();
      allResult.push(docData);
    });

    res.send({ documents: allResult });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).send({ 'Message': 'Error fetching documents' });
  }
});



// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
