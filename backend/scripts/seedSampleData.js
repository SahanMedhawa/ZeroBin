import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import Area from '../models/areaModel.js';
import WMA from '../models/wmaModel.js';
import Collector from '../models/collectorModel.js';
import User from '../models/userModel.js';
import Garbage from '../models/garbageModel.js';
import Schedule from '../models/scheduleModel.js';
import Transaction from '../models/transactionModel.js';
import Grievance from '../models/grievanceModel.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from repo root to get MONGO_URI
dotenv.config({ path: join(__dirname, '../../.env') });

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB for seeding');

    // ---------- AREAS ----------
    const areasToCreate = [
      { name: 'Central Park', district: 'Colombo', postalCode: '00100', coordinates: { latitude: 6.9271, longitude: 79.8612 } },
      { name: 'River Side', district: 'Colombo', postalCode: '00200', coordinates: { latitude: 6.9300, longitude: 79.8700 } },
    ];

    const createdAreas = [];
    for (const a of areasToCreate) {
      const existing = await Area.findOne({ name: a.name, district: a.district });
      if (existing) {
        console.log(`⏭️ Area exists: ${a.name} (${a.district})`);
        createdAreas.push(existing);
        continue;
      }
      const area = new Area(a);
      await area.save();
      console.log(`✅ Created area: ${area.name}`);
      createdAreas.push(area);
    }

    // ---------- WMA ----------
    const wmaEmail = 'central-wma@zerobin.com';
    let wma = await WMA.findOne({ email: wmaEmail });
    if (!wma) {
      const wmaPassword = await bcrypt.hash('WMApass123', 10);
      wma = new WMA({
        wmaname: 'Central Waste Management Authority',
        address: '123 WMA St, Colombo',
        contact: '+94111222333',
        authNumber: 'WMA-001',
        email: wmaEmail,
        password: wmaPassword,
        servicedAreas: createdAreas.map(a => a._id),
        ratePerCollection: 500,
      });
      await wma.save();
      console.log(`✅ Created WMA: ${wma.wmaname}`);
    } else {
      console.log(`⏭️ WMA exists: ${wma.email}`);
    }

    // ---------- COLLECTORS ----------
    const collectorsToCreate = [
      { truckNumber: 'TRUCK-100', collectorName: 'Kasun Perera', collectorNIC: '900000000V', contactNo: '+94770000001', statusOfCollector: 'Available' },
      { truckNumber: 'TRUCK-101', collectorName: 'Nimal Fernando', collectorNIC: '900000001V', contactNo: '+94770000002', statusOfCollector: 'Available' },
    ];

    const createdCollectors = [];
    for (const c of collectorsToCreate) {
      const exist = await Collector.findOne({ truckNumber: c.truckNumber });
      if (exist) {
        console.log(`⏭️ Collector exists: ${c.truckNumber}`);
        createdCollectors.push(exist);
        continue;
      }
      const coll = new Collector({ ...c, wmaId: wma._id, assignedAreas: [createdAreas[0]._id] });
      await coll.save();
      console.log(`✅ Created collector: ${coll.collectorName}`);
      createdCollectors.push(coll);
    }

    // ---------- USERS (Residents) ----------
    const usersToCreate = [
      { username: 'alice', name: 'Alice Silva', email: 'alice@example.com', password: 'Alice1234', contact: '+94770001001', address: '10 Central Park', area: createdAreas[0]._id },
      { username: 'bob', name: 'Bob Jay', email: 'bob@example.com', password: 'Bob1234', contact: '+94770001002', address: '22 River Side', area: createdAreas[1]._id },
      { username: 'charlie', name: 'Charlie K', email: 'charlie@example.com', password: 'Charlie1234', contact: '+94770001003', address: '5 Central Park', area: createdAreas[0]._id },
    ];

    const createdUsers = [];
    for (const u of usersToCreate) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        console.log(`⏭️ User exists: ${u.email}`);
        createdUsers.push(existing);
        continue;
      }
      const hashed = await bcrypt.hash(u.password, 10);
      const user = new User({
        username: u.username,
        name: u.name,
        email: u.email,
        password: hashed,
        contact: u.contact,
        address: u.address,
        area: u.area,
      });
      await user.save();
      console.log(`✅ Created user: ${user.email}`);
      createdUsers.push(user);
    }

    // ---------- GARBAGE (Bins) ----------
    const createdGarbage = [];
    for (const user of createdUsers) {
      // check if user already has a registered bin
      const existingBin = await Garbage.findOne({ user: user._id, isBinRegistered: true });
      if (existingBin) {
        console.log(`⏭️ Bin exists for user: ${user.email}`);
        createdGarbage.push(existingBin);
        continue;
      }

      const binId = `BIN-${user._id.toString().slice(-6)}-${Date.now().toString().slice(-6)}`;
      const garbage = new Garbage({
        user: user._id,
        address: user.address,
        longitude: 79.8612 + Math.random() * 0.01,
        latitude: 6.9271 + Math.random() * 0.01,
        type: 'Recyclable',
        area: user.area,
        weight: Math.floor(Math.random() * 5) + 1,
        status: 'Pending',
        isBinRegistered: true,
        binId,
        sensorData: {
          fillLevel: 'Medium',
          fillPercentage: 50,
          isAutoDetected: false,
        },
        isVisibleToCollectors: false,
      });
      await garbage.save();
      console.log(`✅ Created bin ${garbage.binId} for user ${user.email}`);
      createdGarbage.push(garbage);
    }

    // ---------- SCHEDULES ----------
    const schedulesToCreate = [];
    // create a schedule for first collector and first area
    schedulesToCreate.push({ wmaId: wma._id, collectorId: createdCollectors[0]._id, area: createdAreas[0]._id, date: new Date(), time: '09:00', status: 'Pending', latitude: createdAreas[0].coordinates.latitude, longitude: createdAreas[0].coordinates.longitude });
    schedulesToCreate.push({ wmaId: wma._id, collectorId: createdCollectors[1]._id, area: createdAreas[1]._id, date: new Date(), time: '10:00', status: 'Pending', latitude: createdAreas[1].coordinates.latitude, longitude: createdAreas[1].coordinates.longitude });

    for (const s of schedulesToCreate) {
      // simple duplication check: same collector + area + time
      const exists = await Schedule.findOne({ collectorId: s.collectorId, area: s.area, time: s.time });
      if (exists) {
        console.log(`⏭️ Schedule exists for collector ${s.collectorId} at ${s.time}`);
        continue;
      }
      const sched = new Schedule(s);
      await sched.save();
      console.log(`✅ Created schedule for collector ${sched.collectorId} at ${sched.time}`);
    }

    // ---------- TRANSACTIONS ----------
    // create a sample transaction for the first user
    const txUser = createdUsers[0];
    const existingTx = await Transaction.findOne({ user: txUser._id, description: /Sample collection/ });
    if (!existingTx) {
      const tx = new Transaction({ user: txUser._id, description: 'Sample collection fee', amount: 250, isPaid: false });
      await tx.save();
      console.log(`✅ Created transaction for ${txUser.email}`);
    } else {
      console.log(`⏭️ Transaction exists for ${txUser.email}`);
    }

    // ---------- GRIEVANCES ----------
    // create a grievance against the first user's bin
    const bin = createdGarbage[0];
    const grievanceExists = await Grievance.findOne({ binId: bin.binId, userId: createdUsers[0]._id });
    if (!grievanceExists) {
      const grievance = new Grievance({
        binId: bin.binId,
        garbageId: bin._id,
        userId: createdUsers[0]._id,
        areaId: bin.area,
        severity: 'Medium',
        description: 'Overflowing bin near my house, needs collection.',
        status: 'Open',
      });
      await grievance.save();
      console.log(`✅ Created grievance for bin ${bin.binId}`);
    } else {
      console.log(`⏭️ Grievance exists for bin ${bin.binId}`);
    }

    console.log('\n🎉 Seeding complete');

    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();
