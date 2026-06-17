const express = require('express');
const Users = require('../models/usersSchema');
const router = express.Router();
const generateJWTToken = require('../service/token');


router.post('/users', async (req, res) => {
    try{
    const { fullname, email, password } = req.body;
    if (!fullname || !email || !password) {
        return res.status(400).json({ message: "Barcha maydonlarni to'ldiring!" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: "Bu email allaqachon ro'yxatdan o‘tgan!" });
    }

    const user = new Users({
        fullname,
        email,
        password,
        role: 'User',

    });

    user.token = generateJWTToken(user._id, user.fullname, user.role)
    const result = await user.save();
    if (result) {
        console.log("Muvaffaqiyatli saqlandi");
        res.status(201).json({
            message: "Foydalanuvchi muvaffaqiyatli yaratildi!",
            user: {
                id: result._id,
                fullname: result.fullname,
                email: result.email,
                role: result.role,
                token: result.token
            }
        });
    }
    else {
        res.status(500).json({ message: "Saqlash jarayonida xatolik yuz berdi!" });
    }
} catch (error) {
    console.error("Server xatoligi:", error);
    res.status(500).json({ message: "Serverda ichki xatolik yuz berdi!" });
}
    
  
});


router.get('/users', async (req, res) =>{
    const user = await Users.find();
    if(user){
        return res.status(201).send(user); 
    }
})

router.get('/users/:id', async (req, res) => {
    try {
        const user = await Users.findOne({ _id: req.params.id }); // `req.params.id` to‘g‘ri ishlatilgan

        if (!user) {
            return res.status(404).json({ message: "Foydalanuvchi topilmadi!" });
        }

        res.status(200).json(user); // `200 OK` yuboriladi
    } catch (error) {
        res.status(500).json({ message: "Server xatosi!", error });
    }
});

router.put('/users', async (req, res) => {
    const { userId, lessonId, score } = req.body;

    if (!userId) {
        return res.status(400).json({ message: "Foydalanuvchi ID talab qilinadi!" });
    }

    try {
        if (lessonId) {
            await Users.updateOne(
                { _id: userId },
                { $addToSet: { lastlessons: lessonId } } // Takrorlanmagan holda qo‘shish
            );
        }

        if (score) {
            const numericScore = parseInt(score, 10);
            await Users.updateOne(
                { _id: userId },
                { $set: { finishBall: numericScore } } // finishBall yangilanadi
            );
        }

        return res.status(200).json({ message: "Ma'lumotlar saqlandi!" });
    } catch (error) {
        return res.status(500).json({ message: "Server xatosi!", error });
    }
});



module.exports = router;