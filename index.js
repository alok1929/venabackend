import { cert, initializeApp } from 'firebase-admin/app';
import { getFirestore } from "firebase-admin/firestore";
import { collection,  getDocs } from "firebase/firestore";
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

app.post("/contractData", async (req, res) => {
  try {
    const sfRef = db.collection(req.body.region)
    const collections=await sfRef.get();
    const field=[];
    collections.forEach(collection=>{
      field.push(collection)
      
    }) 
    res.send({MESSAGE:field})
  } catch (error) {
    console.error('Error saving to Firestore:', error);
    res.status(500).send({ 'Message': 'Error saving to Firestore' });
  }
});

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

app.get("/getCollections/:region/:document", async (req, res) => {
  try {
    const collections = await db.collection(req.params.region).doc(req.params.document).listCollections();
    const collectionNames = collections.map((collection) => collection.id);
    res.send({ collections: collectionNames });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).send({ 'Message': 'Error fetching collections docs' });
  }
});

app.get("/getCollections/:region/:document/:collection", async (req, res) => {
  try {
    const sfRef = db.collection(req.params.region).doc(req.params.document).collection(req.params.collection);
    const collections=await sfRef.get();
    const field=[];
    collections.forEach(collection=>{
      field.push(collection)
    }) 
    res.send({ collections: field });

  } catch (error) {
    console.error('Error saving to Firestore:', error);
    res.status(500).send({ 'Message': 'Error saving to Firestore collections' });
  }
});

// Start the Express app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
