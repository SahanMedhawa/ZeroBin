import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import path from "path";
import { fileURLToPath } from "url";

// Import all necessary models
import User from "../models/userModel.js";
import Area from "../models/areaModel.js";
import WMA from "../models/wmaModel.js";
import Collector from "../models/collectorModel.js";
import Garbage from "../models/garbageModel.js";
import Schedule from "../models/scheduleModel.js";
import Transaction from "../models/transactionModel.js";
import Grievance from "../models/grievanceModel.js";
import Contact from "../models/contactModel.js";

// Setup path to find .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

const clearData = async () => {
  try {
    // Clear data in a logical order
    await Grievance.deleteMany({});
    await Schedule.deleteMany({});
    await Garbage.deleteMany({});
    await Transaction.deleteMany({});
    await Collector.deleteMany({});
    await User.deleteMany({});
    await WMA.deleteMany({});
    await Area.deleteMany({});
    await Contact.deleteMany({});
    console.log("🗑️  Previous data cleared");
  } catch (error) {
    console.error(`❌ Error clearing data: ${error.message}`);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    // 1. Create Areas
    const areas = await Area.insertMany([
      { name: "Wellawatte", district: "Colombo", postalCode: "00600" },
      { name: "Bambalapitiya", district: "Colombo", postalCode: "00400" },
      { name: "Dehiwala", district: "Colombo", postalCode: "10350" },
    ]);
    console.log("🌱 Areas seeded");

    // 2. Create Users (including an Admin)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const users = await User.insertMany([
      {
        username: "John Doe",
        email: "john.doe@example.com",
        password: hashedPassword,
        address: "123 Galle Road",
        area: areas[0]._id,
        contact: "0771234567",
        role: "Resident",
      },
      {
        username: "Jane Smith",
        email: "jane.smith@example.com",
        password: hashedPassword,
        address: "456 Marine Drive",
        area: areas[1]._id,
        contact: "0719876543",
        role: "Resident",
      },
      {
        username: "Admin User",
        email: "admin.user@zerobin.com",
        password: hashedPassword,
        isAdmin: true,
        role: "Admin",
      },
    ]);
    console.log("🌱 Users seeded");

    // 3. Create a WMA
    const wmas = await WMA.insertMany([
      {
        wmaname: "Colombo Municipal Council",
        email: "wma@colombo.mc.gov",
        password: hashedPassword,
        address: "Town Hall, Colombo 7",
        contact: "0112695141",
        authNumber: "WMA-CMC-01",
        servicedAreas: [areas[0]._id, areas[1]._id],
      },
    ]);
    console.log("🌱 WMAs seeded");

    // 4. Create Collectors
    const collectors = await Collector.insertMany([
      {
        wmaId: wmas[0]._id,
        collectorName: "Kamal Perera",
        collectorNIC: "199012345V",
        truckNumber: "WP-GA-1234",
        contactNo: "0765551111",
        statusOfCollector: "Available",
        assignedAreas: [areas[0]._id],
      },
    ]);
    console.log("🌱 Collectors seeded");

    // 5. Create Garbage Bins
    const bins = await Garbage.insertMany([
      {
        user: users[0]._id,
        area: areas[0]._id,
        address: "123 Galle Road, Wellawatte",
        latitude: 6.878,
        longitude: 79.858,
        type: "Recyclable",
        isBinRegistered: true,
        binId: `BIN-${Date.now()}`,
      },
    ]);
    console.log("🌱 Garbage Bins seeded");

    // 6. Create Schedules
    await Schedule.insertMany([
      {
        wmaId: wmas[0]._id,
        collectorId: collectors[0]._id,
        area: areas[0]._id,
        date: new Date(),
        time: "09:00",
        status: "Pending",
      },
    ]);
    console.log("🌱 Schedules seeded");

    // 7. Create Transactions
    await Transaction.insertMany([
      {
        user: users[0]._id,
        description: "Monthly subscription fee",
        amount: 500,
        isPaid: true,
      },
    ]);
    console.log("🌱 Transactions seeded");

    // 8. Create Grievances
    await Grievance.insertMany([
      {
        userId: users[0]._id,
        binId: bins[0].binId,
        garbageId: bins[0]._id,
        areaId: areas[0]._id,
        severity: "Medium",
        description: "Bin was not collected on the scheduled day.",
        status: "Pending",
      },
    ]);
    console.log("🌱 Grievances seeded");

    // 9. Create Contacts
    await Contact.insertMany([
      {
        name: "Prospective Client",
        email: "client@email.com",
        subject: "Inquiry about services",
        message:
          "I would like to know more about your waste management solutions for businesses.",
      },
    ]);
    console.log("🌱 Contacts seeded");

    console.log("\n🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error(`❌ Error seeding data: ${error.message}`);
  }
};

const run = async () => {
  await connectDB();
  if (process.argv[2] === "--clear") {
    await clearData();
  } else {
    await clearData();
    await seedData();
  }
  process.exit();
};

run();
