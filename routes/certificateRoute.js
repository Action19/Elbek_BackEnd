const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFSBucket } = require("mongodb");
const multer = require("multer");
const { GridFsStorage } = require("multer-gridfs-storage");
const Users = require("../models/usersSchema"); // ✅ Users modelini import qilish
const QRCode = require("qrcode");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const fs = require("fs"); 
const path = require("path");

const router = express.Router();

let gfsBucket;
mongoose.connection.once("open", () => {
    gfsBucket = new GridFSBucket(mongoose.connection.db, { bucketName: "certificates" });
});

const storage = multer.memoryStorage(); // 🔹 Faylni xotirada saqlash (GridFS uchun moslashish)
const upload = multer({ storage }); 

// 📌 **Sertifikat yaratish va foydalanuvchiga saqlash**
router.post("/upload", upload.single("certificate"), async (req, res) => {
    try {
        console.log("✅ Kelayotgan so‘rov:", req.body);  // 🔍 Foydalanuvchi ID va ismi tekshiriladi
    console.log("✅ Kelayotgan fayl:", req.file);
        const { userId, userName } = req.body;
        console.log(req.body);
        
        if (!userId || !userName) {
            return res.status(400).json({ error: "Foydalanuvchi ID va ismi talab qilinadi!" });
        }

        // ✅ **Yangi PDF yaratish**
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([842, 595]); // A4 format (landshaft)
        const { width, height } = page.getSize();
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

        
                // 🔹 **Rasm qo‘shish**
                const imagePath = path.join(process.cwd(), "assets", "certificate-back.png"); 
                const imageBytes = fs.readFileSync(imagePath);
                const backgroundImage = await pdfDoc.embedPng(imageBytes);
        
                page.drawImage(backgroundImage, {
                    x: 0,
                    y: 0,
                    width: width,
                    height: height
                });
        


         // 🔹 **CERTIFICATE yozuvi**

         // 🔹 **Foydalanuvchi ismi (faqat bosh harflarda)**
        const userNameText = userName.toUpperCase();
        const userNameSize = 20;
        const userNameWidth = font.widthOfTextAtSize(userNameText, userNameSize);
        page.drawText(userNameText, {
            x: (width - userNameWidth) / 2,
            y: height - 300,
            size: userNameSize,
            font,
            color: rgb(0, 0, 1)
        });


         // 🔹 **Sertifikat sanasi**
        const dateText = `Sana: ${new Date().toLocaleDateString()}`;
        page.drawText(dateText, {
            x:  50,
            y: 60,
            size: 14,
            font,
            color: rgb(0, 0, 0)
        });


        // 🔹 **QR kod yaratish**
        const qrData = `http://localhost:5001/certificate/${userId}`;
        const qrImageBuffer = await QRCode.toBuffer(qrData);
        const qrImage = await pdfDoc.embedPng(qrImageBuffer);
        const qrSize = 160;
        page.drawImage(qrImage, {
            x: width / 2 - qrSize / 2,
            y: 40,
            width: qrSize,
            height: qrSize
        });

        // ✅ **PDF faylni saqlash**
        const pdfBytes = await pdfDoc.save();

        // ✅ **PDF faylni GridFS-ga yuklash**
        const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, {
            bucketName: "certificates"
        });

        const uploadStream = bucket.openUploadStream(`${Date.now()}-certificate.pdf`, {
            contentType: "application/pdf"
        });

        uploadStream.end(pdfBytes); // 📂 PDF ma’lumotlarini GridFS-ga yozish

        uploadStream.on("finish", async () => {
            console.log("Sertifikat saqlandi, ID:", uploadStream.id);

            // ✅ **Foydalanuvchiga sertifikat ID sini bog‘lash**
            await Users.findByIdAndUpdate(userId, { $set: { certificate: uploadStream.id } });

            res.status(201).json({
                message: "Sertifikat yaratildi va foydalanuvchiga bog‘landi!",
                fileId: uploadStream.id
            });
        });

        uploadStream.on("error", (err) => {
            console.error("Sertifikatni yuklashda xatolik:", err);
            res.status(500).json({ error: "Sertifikatni yuklashda xatolik" });
        });

    } catch (err) {
        console.error("Sertifikat yaratishda xatolik:", err);
        res.status(500).json({ error: "Sertifikat yaratishda xatolik" });
    }
});

// 📌 **Foydalanuvchining sertifikatini olish**
router.get("/certificate/:userId", async (req, res) => {
    try {
        const user = await Users.findById(req.params.userId);
        if (!user || !user.certificate) {
            return res.status(404).json({ error: "❌ Foydalanuvchi yoki sertifikat topilmadi!" });
        }

        const fileId = new mongoose.Types.ObjectId(user.certificate);
        const cursor = gfsBucket.find({ _id: fileId });
        const files = await cursor.toArray();

        if (!files || files.length === 0) {
            return res.status(404).json({ error: "❌ Sertifikat topilmadi!" });
        }

        res.set("Content-Type", "application/pdf");
        gfsBucket.openDownloadStream(fileId).pipe(res);
    } catch (err) {
        console.error("❌ Sertifikat yuklashda xatolik:", err);
        res.status(500).json({ error: "Sertifikat yuklashda xatolik!" });
    }
});

module.exports = router;
