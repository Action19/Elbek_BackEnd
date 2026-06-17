const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/usersSchema');
const generateJWTToken = require('../service/token');


router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Foydalanuvchi topilmadi!' });
            
            
        }

        // ✅ 2. Parolni tekshiramiz
        const isMatch =  password === user.password ? true : false;
        if (!isMatch) {
            return res.status(400).json({ message: "Noto'g'ri parol!" });
        }

        // ✅ 3. JWT token yaratamiz
        const token = generateJWTToken(user._id, user.fullname, user.role);

        res.status(200).json({ message: 'Tizimga kirdingiz!', token });
    } catch (error) {
        res.status(500).json({ message: 'Server xatosi', error });
    }
});

module.exports = router;