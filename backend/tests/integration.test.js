import { test, before, after } from "node:test";
import assert from "node:assert";
import app from "../server.js";
import db from "../src/database/models/index.js";

let server;
let port;
let baseUrl;

before(async () => {
  // Set NODE_ENV to test to prevent Sequelize logs and configure test port
  process.env.NODE_ENV = "test";
  
  // Connect and sync test database (force sync clear schemas)
  await db.sequelize.sync({ force: true });

  // Bind to random port
  server = app.listen(0);
  port = server.address().port;
  baseUrl = `http://localhost:${port}/api`;
  console.log(`Test server active on port ${port} 🧪`);
});

after(async () => {
  if (server) {
    server.close();
  }
  await db.sequelize.close();
  console.log("Test suite finished and connections closed. 🏁");
});

test("CareSync Integration Tests", async (t) => {
  let doctorCookie = "";
  let patient1Cookie = "";
  let patient2Cookie = "";
  let doctorId = "";
  let slotId = "";

  await t.test("1. JWT Authentication Guard checks", async () => {
    const res = await fetch(`${baseUrl}/users/me`);
    assert.strictEqual(res.status, 401, "Protected route must return 401 Unauthorized without token cookies");
  });

  await t.test("2. Database validation constraints", async () => {
    // Signup with invalid parameters
    const res = await fetch(`${baseUrl}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "not-an-email",
        password: "",
        role: "PATIENT",
      }),
    });
    
    assert.strictEqual(res.status, 400, "Should reject empty password and invalid email format with 400 Bad Request");
  });

  await t.test("3. Authenticated Doctor & Patient Setup", async () => {
    // Signup Doctor
    const docRes = await fetch(`${baseUrl}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test_doctor@caresync.com",
        password: "securepass123",
        role: "DOCTOR",
        firstName: "Stephen",
        lastName: "Strange",
        phone: "9988776655",
      }),
    });
    assert.strictEqual(docRes.status, 201);
    
    // Parse cookie from headers
    const docSetCookie = docRes.headers.get("set-cookie");
    assert.ok(docSetCookie, "Should return set-cookie session credentials");
    doctorCookie = docSetCookie.split(";")[0];

    // Check doctor record was created
    const docInfo = await db.Doctor.findOne({
      include: [{ model: db.User, as: "user", where: { email: "test_doctor@caresync.com" } }],
    });
    assert.ok(docInfo, "Doctor model should automatically be created on signup");
    
    // Set isVerified = true to allow slot publishing
    await docInfo.update({ isVerified: true });
    doctorId = docInfo.id;

    // Signup Patient 1
    const p1Res = await fetch(`${baseUrl}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test_patient1@caresync.com",
        password: "patientpass1",
        role: "PATIENT",
        firstName: "Peter",
        lastName: "Parker",
        phone: "9988112233",
      }),
    });
    assert.strictEqual(p1Res.status, 201);
    patient1Cookie = p1Res.headers.get("set-cookie").split(";")[0];

    // Signup Patient 2
    const p2Res = await fetch(`${baseUrl}/users/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "test_patient2@caresync.com",
        password: "patientpass2",
        role: "PATIENT",
        firstName: "Bruce",
        lastName: "Banner",
        phone: "9988223344",
      }),
    });
    assert.strictEqual(p2Res.status, 201);
    patient2Cookie = p2Res.headers.get("set-cookie").split(";")[0];
  });

  await t.test("4. Doctor Availability Slot Publishing", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);
    futureDate.setHours(10, 0, 0, 0);

    const endDate = new Date(futureDate);
    endDate.setHours(11, 0, 0, 0);

    // Publish slot
    const res = await fetch(`${baseUrl}/doctors/availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": doctorCookie,
      },
      body: JSON.stringify({
        slots: [{ startTime: futureDate.toISOString(), endTime: endDate.toISOString() }],
      }),
    });

    assert.strictEqual(res.status, 201);
    const body = await res.json();
    assert.ok(body.slots?.[0]?.id, "Should return the created slot object ID");
    slotId = body.slots[0].id;
  });

  await t.test("5. Concurrency Control: Booking lock transaction (Prevent Double Booking)", async () => {
    assert.ok(slotId, "Requires published slotId");

    // Launch 2 concurrent fetch requests to book the exact same slot ID
    const bookRequest = (cookie) => fetch(`${baseUrl}/consultations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookie,
      },
      body: JSON.stringify({
        slotId,
        reasonForVisit: "Concurrent slot double-booking test",
      }),
    });

    const [res1, res2] = await Promise.all([
      bookRequest(patient1Cookie),
      bookRequest(patient2Cookie),
    ]);

    // Parse responses
    const status1 = res1.status;
    const status2 = res2.status;

    // Validate that one request succeeded and one failed with 409 Conflict
    const hasSuccess = status1 === 201 || status2 === 201;
    const hasConflict = status1 === 409 || status2 === 409;

    assert.ok(hasSuccess, "One concurrent booking transaction must succeed (201)");
    assert.ok(hasConflict, "The other concurrent booking transaction must be rejected with 409 Conflict");
  });
});
