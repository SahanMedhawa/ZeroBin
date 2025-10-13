import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Setup path to find .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');

// Load environment variables
dotenv.config({ path: envPath });

// Define Area schema to match your model
const areaSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["flat", "weightBased"],
    },
    rate: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

// Create the Area model
const Area = mongoose.model("Area", areaSchema);

const addColomboArea = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Check if Colombo area already exists
    const existingArea = await Area.findOne({ name: 'Colombo' });
    
    if (existingArea) {
      console.log('Colombo area already exists:', existingArea);
    } else {
      // Create Colombo area
      const colomboArea = new Area({
        name: 'Colombo',
        type: 'flat',
        rate: 100
      });
      
      await colomboArea.save();
      console.log('Colombo area added successfully:', colomboArea);
    }

    // List all areas
    const allAreas = await Area.find({});
    console.log('All areas in database:', allAreas);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    console.error('Error adding Colombo area:', error);
    process.exit(1);
  }
};

addColomboArea();